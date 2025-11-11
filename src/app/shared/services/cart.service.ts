import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CartResponseType} from '../../../assets/types/responses/cart-response.type';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';

export type userErrorsType = {
  getCart:{ [key in AppLanguages]:string; },
  updateCart:{ [key in AppLanguages]:string; },
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  http:HttpClient=inject(HttpClient);
  token:string="6aWJVvmJIxqdHHtn5VpXn8qFlz1OcPt8TInUf5JMS4Dsbk45j2M0Z58EMrufd42OcX6VaHe4GdDC5ubStbda3m0jszexNPa381aa";

  userErrorMessages = {
    getCart: 'Ошибка при запросе корзины. Обновите страницу.',
    updateCart: 'Ошибка при добавления товара в корзину.',
  }
  userErrors:userErrorsType = {
    getCart: {
      [AppLanguages.ru]:'Ошибка при запросе категорий. Обновите страницу.',
      [AppLanguages.en]:'Error retrieving categories. Please refresh the page.',
      [AppLanguages.de]:'Fehler beim Abrufen der Kategorien. Bitte aktualisieren Sie die Seite.',
    },
    updateCart: {
      [AppLanguages.ru]:'Ошибка при запросе категорий. Обновите страницу.',
      [AppLanguages.en]:'Error retrieving categories. Please refresh the page.',
      [AppLanguages.de]:'Fehler beim Abrufen der Kategorien. Bitte aktualisieren Sie die Seite.',
    },
  };

  getCart():Observable<CartResponseType>{
    const headers = new HttpHeaders().set("x-access-token", this.token);
    return this.http.get<CartResponseType>(environment.api+'cart.php',{headers});
  }
  updateCart(id:number, quantity:number):Observable<CartResponseType>{
    const headers = new HttpHeaders().set("x-access-token", this.token);
    return this.http.patch<CartResponseType>(environment.api+'cart.php',{id, quantity},{headers});
  }
}
