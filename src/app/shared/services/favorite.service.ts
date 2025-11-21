import {inject, Injectable} from '@angular/core';
import {map, Observable, of, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {FavoritesResponseType} from '../../../assets/types/responses/favorites-response.type';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {LanguageService} from '../../core/language.service';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {AddToFavoritesResponseType} from '../../../assets/types/responses/add-to-favorites-response.type';
import {FavoriteProductType} from '../../../assets/types/favorite-product.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';
import {Config} from '../config';

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
enum CacheOperations{
  add='add',
  remove='remove',
  clear='clear',
}

/*
* Сервис для работы с избранным.
* Особенности: данные кэшируются в автоматическом режиме во время выполнения запросов.
* cache - переменная для хранения кэша избранного
* cacheTimeout - таймаут для чистки кэша
* cacheLifetime - время жизни кэша. Используется в таймауте
*  - favoriteProductTemplate - переменная со всеми обязательными полями, для проверки целостности данных
* */

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http:HttpClient=inject(HttpClient);
  private languageService:LanguageService=inject(LanguageService);
  private cache:FavoritesResponseType|null=null;
  private cacheTimeout: ReturnType<typeof setTimeout> | null = null;//таймер для чистки кэша корзины
  private cacheLifetime:number = 120000;

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

  private cacheOperation(operation:CacheOperations,favoritesProduct:FavoriteProductType|null=null):void{
    if (operation === CacheOperations.clear && !favoritesProduct) {
      this.cache=null;
      if (this.cacheTimeout) clearTimeout(this.cacheTimeout);
    }else if(operation === CacheOperations.add && favoritesProduct){
      if (!this.cache || !this.cache.favorites || !this.cache.favorites.length){
        this.cache={
          error:false,
          message:Config.confirmMsgFromServer,
          favorites:[favoritesProduct],
        }
      }else{
        const favIndexInCache:number = this.cache.favorites.findIndex((favItem:FavoriteProductType)=>favItem.id === favoritesProduct.id);
        favIndexInCache===-1?this.cache.favorites.push(favoritesProduct):null;
      }
    }else if(operation === CacheOperations.remove && favoritesProduct){
      if (!this.cache || !this.cache.favorites) return;
      this.cache.favorites=this.cache.favorites.filter((favItem:FavoriteProductType) => favItem.id !== favoritesProduct.id);
    }
  }
  private resetCacheTimer() {
    if (this.cacheTimeout) clearTimeout(this.cacheTimeout);
    this.cacheTimeout = setTimeout(() => {
      this.cache = null;
      if (this.cacheTimeout) clearTimeout(this.cacheTimeout);
    }, this.cacheLifetime);
  }

  getFavorites(forceUpdate:boolean=false): Observable<FavoritesResponseType> {
    if (!forceUpdate && this.cache) return of(this.cache);
    return this.http.get<FavoritesResponseType>(environment.api + 'favorites.php')
      .pipe(
        tap((response:FavoritesResponseType) => {
          if (response.error || !response.favorites ) return;
          this.cache = response;
          this.resetCacheTimer();
        })
      );
  }

  addToFavorite(productId:number): Observable<AddToFavoritesResponseType> {
    return this.http.post<AddToFavoritesResponseType>(environment.api + 'favorites.php',{productId})
      .pipe(
        map((response:AddToFavoritesResponseType)=>{
          if (response.error) return response;
          if (!response.product || !ResponseDataValidator.validateRequiredFields(this.favoriteProductTemplate, response.product)) {
            response.error = true;
            response.message = 'addToFavorite error. Product not found in response or have invalid structure.';
          }else{
            this.cacheOperation(CacheOperations.add, response.product);
          }
          return response;
        })
      );
  }

  removeFavorite(productId:number): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(environment.api + 'favorites.php',{body:{productId}})
      .pipe(
        tap((response:DefaultResponseType) => {
          if (!response.error) this.cacheOperation(CacheOperations.remove, {
            id:productId,
            name:'',
            price: 0,
            image: '',
            url: '',
            count: 0,
            disabled: false,
            ends: false,
          });
        })
      );
  }
}
