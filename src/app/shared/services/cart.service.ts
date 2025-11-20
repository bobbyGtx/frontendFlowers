import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, finalize, Observable, of, shareReplay, tap} from 'rxjs';
import {CartResponseType} from '../../../assets/types/responses/cart-response.type';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {CartItemType} from '../../../assets/types/cart-item.type';
import {CartProductType} from '../../../assets/types/cart-product.type';
import {CartType} from '../../../assets/types/cart.type';
import {AuthService} from '../../core/auth/auth.service';
import {ShowSnackService} from '../../core/show-snack.service';
import {LanguageService} from '../../core/language.service';
import {ReqErrorTypes} from '../../../assets/enums/auth-req-error-types.enum';

export type userErrorsType = {
  getCart: { [key in AppLanguages]: string; },
  updateCart: { [key in AppLanguages]: string; },
  rebaseCart: { [key in AppLanguages]: string; },
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private languageService:LanguageService= inject(LanguageService);
  readonly cartLsKey: string = 'userCart';
  private cartRequest$?: Observable<CartResponseType>;//для предотвращения дублирования запроса
  private cartCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private cartCache: CartResponseType | null = null;//Кэш ответа корзины. Пополняется по результатам 2х запросов
  readonly cartCacheLifetime: number = 30000;
  clearCartCacheTimeout: ReturnType<typeof setTimeout> | null = null;//таймер для чистки кэша корзины

  private userErrors: userErrorsType = {
    getCart: {
      [AppLanguages.ru]: 'Ошибка при запросе корзины. Обновите страницу.',
      [AppLanguages.en]: 'Error requesting cart. Please refresh the page.',
      [AppLanguages.de]: 'Fehler beim Anfordern des Warenkorbs. Bitte aktualisieren Sie die Seite.',
    },
    updateCart: {
      [AppLanguages.ru]: 'Ошибка изменения корзины. Повторите попытку.',
      [AppLanguages.en]: 'Error editing cart. Please try again.',
      [AppLanguages.de]: 'Fehler beim Ändern des Warenkorbs. Bitte versuchen Sie es erneut.',
    },
    rebaseCart: {
      [AppLanguages.ru]:'Ошибка переноса локальной корзины.',
      [AppLanguages.en]:'Error transferring local recycle bin.',
      [AppLanguages.de]:'Fehler beim Übertragen des lokalen Papierkorbs.',
    },
  };

  private isLoggedIn:boolean = false;

  constructor() {
    this.authService.isLogged$.subscribe(isLogged => {
      this.isLoggedIn = isLogged;
      this.cartCache=null;
    });
  }

  get getCartError():string {
    return this.userErrors.getCart[this.languageService.appLang];
  }
  get updateCartError():string {
    return this.userErrors.updateCart[this.languageService.appLang];
  }
  get rebaseCartError():string {
    return this.userErrors.rebaseCart[this.languageService.appLang];
  }

  getCartCount$(): Observable<number> {
    return this.cartCount$;
  }

  private updateCartCount(newCount: number): void {
    this.cartCount$.next(newCount);
  }

  resetCartCount(): void {
    this.cartCount$.next(0);
  }//сброс после создания заказа например

  getCart(forceUpdate: boolean = false): Observable<CartResponseType> {
    if (!this.isLoggedIn) return of(this.getLSCart());
    if (!forceUpdate && this.cartCache) return of(this.cartCache);
    if (this.cartRequest$) {return this.cartRequest$;}
    this.cartRequest$ = this.http.get<CartResponseType>(environment.api + 'cart.php')
      .pipe(
        tap((data: CartResponseType) => {
          if (data.cart && data.cart.count >= 0) {
            //Инфо сообщение при наличии ошибки и корзины выводится только тут
            if (data.error) this.showSnackService.error(data.message,ReqErrorTypes.cartGetCart);
            this.cartCache = data;
            //Если была ошибка и есть корзина, значит это информационное сообщение, которое удаляем из кеша
            this.cartCache.error = false;
            this.cartCache.message = 'Request success!';
            if (data.cart.count === 0) {
              this.updateCartCount(data.cart.count);
            } else {
              //коррекция кол-ва товаров в корзине с вычетом недоступных
              let totalCount = 0;
              data.cart.items.forEach((cartItem: CartItemType) => {
                if (cartItem.product.disabled) {
                  cartItem.quantity = 0;
                } else {
                  totalCount += cartItem.quantity;
                }
              });
              this.updateCartCount(totalCount);
              this.cartCache = data;
              this.resetCacheTimer();
            }
            this.resetCacheTimer();
          }
        }),
        shareReplay(1),
        finalize(() => {
          //После выполнения запроса очищаем живой observable, чтоб в след раз создался новый
          this.cartRequest$ = undefined;
        })
      );

    return this.cartRequest$;
  }

  updateCart(cartProduct: CartProductType, quantity: number): Observable<CartResponseType> {
    if (!this.isLoggedIn) return of(this.updateLSCart(cartProduct, quantity));
    const id: number = cartProduct.id;
    return this.http.patch<CartResponseType>(environment.api + 'cart.php', {id, quantity})
      .pipe(
        tap((data: CartResponseType) => {
          if (data.cart && data.cart.count >= 0) {
              //коррекция кол-ва товаров в корзине с вычетом недоступных
              let totalCount = 0;
              data.cart.items.forEach((cartItem: CartItemType) => {
                if (cartItem.product.disabled) {
                  cartItem.quantity = 0;
                } else {
                  totalCount += cartItem.quantity;
                }
              });
              this.updateCartCount(totalCount);
              this.cartCache = data;
              this.resetCacheTimer();
          }
        })
      );
  }

  rebaseCart(): Observable<CartResponseType> {
    let userLSCart: CartResponseType = this.getLSCart();
    localStorage.removeItem(this.cartLsKey);
    if (userLSCart.cart && userLSCart.cart?.items.length === 0) {
      this.updateCartCount(0);
      return of(userLSCart);
    }
    let products: { id: number, quantity: number }[] = [];
    userLSCart.cart!.items.forEach((cartItem: CartItemType) => {
      if (cartItem.quantity > 0 && cartItem.product.id > 0) {
        products.push({id: cartItem.product.id, quantity: cartItem.quantity});
      }
    });
    this.cartRequest$ = this.http.post<CartResponseType>(environment.api + 'cart.php', {products}).pipe(
      tap((data: CartResponseType) => {
        if (!data.error && data.cart && data.cart.count >= 0) {
          //коррекция кол-ва товаров в корзине с вычетом недоступных
          let totalCount = 0;
          data.cart.items.forEach((cartItem: CartItemType) => {
            if (cartItem.product.disabled) {
              cartItem.quantity = 0;
            } else {
              totalCount += cartItem.quantity;
            }
          });
          this.updateCartCount(totalCount);
          this.cartCache = data;
          this.resetCacheTimer();
        }
      }),
      shareReplay(1),
      finalize(() => {
        //После выполнения запроса очищаем живой observable, чтоб в след раз создался новый
        this.cartRequest$ = undefined;
      })
    );
    return this.cartRequest$;
  }

  private getLSCart(): CartResponseType {
    let cart: CartType = {
      count: 0,
      createdAt: 0,
      updatedAt: 0,
      items: []
    };
    let response: CartResponseType = {
      error: false,
      message: "Request success!",
      cart: cart
    };
    if (!localStorage.getItem(this.cartLsKey)) {
      this.updateCartCount(0);
      return response;
    }//завершаем функцию, если нет корзины
    let userCart: CartType = JSON.parse(localStorage.getItem(this.cartLsKey)!);
    if (!(userCart.count >= 0) && !Array.isArray(userCart.items)) {
      //чистим корзину если данные имеют не правильный формат
      localStorage.removeItem(this.cartLsKey);
      this.updateCartCount(0);
      return response;
    }
    this.updateCartCount(userCart.count);
    return {
      error: false,
      message: "Request success!",
      cart: userCart
    }
  }

  updateLSCart(product: CartProductType, quantity: number): CartResponseType {
    const newCartItem: CartItemType = {
      quantity: quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        url: product.url,
        count: product.count,
        disabled: false
      },
    };
    let userLSCart: CartResponseType = this.getLSCart();
    if (userLSCart.cart && userLSCart.cart.items.length > 0) {
      //добавляем или меняем значение в корзине
      userLSCart.cart.updatedAt = Date.now();
      //ищем товар в корзине
      const findIndex: number = userLSCart.cart.items.findIndex(cartItem => cartItem.product.id == newCartItem.product.id);
      if (findIndex === -1) {
        userLSCart.cart.items.push(newCartItem);
        userLSCart.cart.count += quantity;
      } else {
        if (userLSCart.cart.items[findIndex].product.disabled) {
          userLSCart.cart.items[findIndex].quantity = quantity;
        } else {
          userLSCart.cart.count = userLSCart.cart.count - userLSCart.cart.items[findIndex].quantity + quantity;
          userLSCart.cart.items[findIndex].quantity = quantity;
        }
      }
      localStorage.setItem(this.cartLsKey, JSON.stringify(userLSCart.cart));
      this.updateCartCount(userLSCart.cart.count);
      return userLSCart;
    } else {
      //Создаем новую карзину.
      let userCart: CartType = {
        count: newCartItem.product.disabled ? 0 : newCartItem.quantity,
        createdAt: Date.now(),
        updatedAt: 0,
        items: [newCartItem]
      }
      localStorage.setItem(this.cartLsKey, JSON.stringify(userCart));
      this.updateCartCount(userCart.count);
      return {
        error: false,
        message: "Request Success!",
        cart: userCart
      }
    }
  }

  checkLSCart(): boolean {
    const userLSCart: CartType | null = localStorage.getItem(this.cartLsKey) ? JSON.parse(localStorage.getItem(this.cartLsKey)!) : null;
    return !!(userLSCart && userLSCart.items.length > 0);
  }

  private resetCacheTimer() {
    if (this.clearCartCacheTimeout) clearTimeout(this.clearCartCacheTimeout);
    this.clearCartCacheTimeout = setTimeout(() => {
      this.cartCache = null;
      if (this.clearCartCacheTimeout) clearTimeout(this.clearCartCacheTimeout);
    }, this.cartCacheLifetime);
  }
}
//if (data.infoMessage) this.showSnackService.info(data.infoMessage);
//this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
//console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (update Cart)! Code:${errorResponse.status}`);
