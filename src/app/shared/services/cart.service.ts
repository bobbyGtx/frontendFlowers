import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, tap} from 'rxjs';
import {CartResponseType} from '../../../assets/types/responses/cart-response.type';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {CartItemType} from '../../../assets/types/cart-item.type';

export type userErrorsType = {
  getCart:{ [key in AppLanguages]:string; },
  updateCart:{ [key in AppLanguages]:string; },
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  http:HttpClient=inject(HttpClient);
  private cartCount$:BehaviorSubject<number>=new BehaviorSubject<number>(0);
  private cartCache:CartResponseType|null=null;
  readonly cartCacheLifetime:number = 30000;
  clearCartCacheTimeout: ReturnType<typeof setTimeout> | null = null;

  resetCacheTimer(){
    if (this.clearCartCacheTimeout) clearTimeout(this.clearCartCacheTimeout);
    this.clearCartCacheTimeout = setTimeout(()=>{
      this.cartCache=null;
      if (this.clearCartCacheTimeout) clearTimeout(this.clearCartCacheTimeout);
    },this.cartCacheLifetime);
  }

  getCartCount$():Observable<number>{
    return this.cartCount$;
  }
  updateCartCount(newCount: number): void {
    this.cartCount$.next(newCount);
  }
  resetCartCount(): void {
    this.cartCount$.next(0);
  }//сброс после создания заказа например

  token:string="RlGjVuantSHRDCYuea9GFUy4jRp7zJTVvcqhbyVXg5IQr8Al4a2iASRB8atfKy2kbmWhwrffluyk0uhABpr0GjeEVH82kUqmM2hE";

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

  getCart(forceUpdate:boolean=false):Observable<CartResponseType>{
    if (!forceUpdate && this.cartCache) return of(this.cartCache);
    const headers = new HttpHeaders().set("x-access-token", this.token);
    return this.http.get<CartResponseType>(environment.api+'cart.php',{headers}).pipe(
      tap((data: CartResponseType) => {
        if (!data.error && data.cart){
          this.cartCache=data;
          if (data.cart.count===0){
            this.updateCartCount(data.cart.count);
          }else{
            //коррекция кол-ва товаров в корзине с вычетом недоступных
            let totalCount=0;
            data.cart.items.forEach((cartItem:CartItemType) => {
              if(cartItem.product.disabled) {
                cartItem.quantity=0;
              }else{
                totalCount+=cartItem.quantity;
              }
            });
            this.updateCartCount(totalCount);
            this.cartCache = data;
            this.resetCacheTimer();
          }

          this.resetCacheTimer();
        }
      })
    );
  }

  updateCart(id:number, quantity:number):Observable<CartResponseType>{
    const headers = new HttpHeaders().set("x-access-token", this.token);
    return this.http.patch<CartResponseType>(environment.api+'cart.php',{id, quantity},{headers})
      .pipe(
        tap((data: CartResponseType) => {
          if (!data.error && data.cart && data.cart.count>=0) {
            if (data.cart.count===0){
              this.updateCartCount(data.cart.count);
            }else{
              //коррекция кол-ва товаров в корзине с вычетом недоступных
              let totalCount=0;
              data.cart.items.forEach((cartItem:CartItemType) => {
                if(cartItem.product.disabled) {
                  cartItem.quantity=0;
                }else{
                  totalCount+=cartItem.quantity;
                }
              });
              this.updateCartCount(totalCount);
              this.cartCache = data;
              this.resetCacheTimer();
            }
          }
        })
      );
  }
}
