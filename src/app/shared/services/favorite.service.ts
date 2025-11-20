import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {FavoritesResponseType} from '../../../assets/types/responses/favorites-response.type';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {LanguageService} from '../../core/language.service';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {AddToFavoritesResponseType} from '../../../assets/types/responses/add-to-favorites-response.type';
import {FavoriteProductType} from '../../../assets/types/favorite-product.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';

export type userErrorsType = {
  getFavorites:{
    [key in AppLanguages]:string;
  },
  removeFavorite:{
    [key in AppLanguages]:string;
  },
  addToFavorite:{
    [key in AppLanguages]:string;
  },
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http:HttpClient=inject(HttpClient);
  private languageService:LanguageService=inject(LanguageService);

  private favoriteProductTemplate: FavoriteProductType = {
    id: 0,
    name: '',
    price: 0,
    image: '',
    url: '',
    count: 0,
    disabled: false,
    ends:false,
  };

  userErrors:userErrorsType = {
    getFavorites: {
      [AppLanguages.ru]:'Ошибка получения избранных продуктов.',
      [AppLanguages.en]:'Error retrieving selected products.',
      [AppLanguages.de]:'Fehler beim Abrufen der ausgewählten Produkte.',
    },
    removeFavorite: {
      [AppLanguages.ru]:'Ошибка удаления из избранного.',
      [AppLanguages.en]:'Error removing from favorites.',
      [AppLanguages.de]:'Fehler beim Entfernen aus den Favoriten.',
    },
    addToFavorite: {
      [AppLanguages.ru]:'Ошибка добавления товара в избранное.',
      [AppLanguages.en]:'Error adding product to favorites.',
      [AppLanguages.de]:'Fehler beim Hinzufügen des Produkts zu den Favoriten.',
    },
  };
  get getFavoritesError():string{
    return this.userErrors.getFavorites[this.languageService.appLang];
  }
  get removeFavoriteError():string{
    return this.userErrors.removeFavorite[this.languageService.appLang];
  }
  get addToFavoritesError():string{
    return this.userErrors.addToFavorite[this.languageService.appLang];
  }

  getFavorites(): Observable<FavoritesResponseType> {
    return this.http.get<FavoritesResponseType>(environment.api + 'favorites.php');
  }
  removeFavorite(productId:number): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(environment.api + 'favorites.php',{body:{productId}});
  }

  addToFavorite(productId:number): Observable<AddToFavoritesResponseType> {
    return this.http.post<AddToFavoritesResponseType>(environment.api + 'favorites.php',{productId})
      .pipe(
        map((response:AddToFavoritesResponseType)=>{
          if (response.error) return response;
          if (!response.product || !ResponseDataValidator.validateRequiredFields(this.favoriteProductTemplate, response.product)) {
            response.error = true;
            response.message = 'addToFavorite error. Product not found in response or have invalid structure.';
          }
          return response;
        })
      );
  }
}
