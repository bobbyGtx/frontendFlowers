import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FavoriteService} from '../../../shared/services/favorite.service';
import {catchError, combineLatest, Observable, Subscription, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {FavoritesResponseType} from '../../../../assets/types/responses/favorites-response.type';
import {environment} from '../../../../environments/environment';
import {FavoriteProductType} from '../../../../assets/types/favorite-product.type';
import {CartService} from '../../../shared/services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {ExtErrorResponseType} from '../../../../assets/types/responses/ext-error-response';
import {ErrorSources} from '../../../../assets/enums/error-sources.enum';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {CartItemType} from '../../../../assets/types/cart-item.type';
import {Router} from '@angular/router';
import {CartProductType} from '../../../../assets/types/cart-product.type';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private languageService:LanguageService=inject(LanguageService);
  private favoriteService: FavoriteService = inject(FavoriteService);
  private cartService: CartService=inject(CartService);
  private router:Router = inject(Router);

  private subscriptions$: Subscription = new Subscription();
  appLanguage:AppLanguages;

  serverImagesPath: string = environment.images;
  favoriteProducts: FavoriteProductType[] = [];
  cartProducts: CartItemType[]=[];

  constructor() {
    this.appLanguage = this.languageService.appLang;
  }

  protected updateCount(count:number, arrIndex:number):void{
    const product:FavoriteProductType = this.favoriteProducts[arrIndex];
    if (product.isInCart) this.updateCart(product.id, count);
    else product.countInCart = count;
  }

  protected updateCart(productId:number,quantity:number|undefined):void{
    if (quantity===undefined) return;
    const product:FavoriteProductType|undefined = this.favoriteProducts.find((favProductItem:FavoriteProductType) => favProductItem.id === productId);
    if (!product) return;
    const cartProduct:CartProductType = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      url: product.url,
      count:product.count,
      disabled: product.disabled,
    }
    this.subscriptions$.add(
      this.cartService.updateCart(cartProduct, quantity).subscribe({
        next: (data:CartResponseType) => {
          if (data.error || !data.cart) {
            this.showSnackService.error(this.cartService.updateCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          this.cartProducts = data.cart.items;
          this.applyCartChanges();
        },
        error: (errorResponse:HttpErrorResponse) => {
          if (errorResponse.status !==401 && errorResponse.status !== 403)this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  protected removeFromCart(arrIndex:number):void{
    this.favoriteProducts[arrIndex].countInCart=0;
    this.updateCart(this.favoriteProducts[arrIndex].id,0);
  }

  protected removeFromFavorites(productId: number): void {
    this.subscriptions$.add(
      this.favoriteService.removeFavorite(productId).subscribe({
        next: (data: FavoritesResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.favoriteService.removeFavoriteError);
            throw new Error(data.message);
          }
          this.favoriteProducts = this.favoriteProducts.filter(product => product.id !== productId);
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error.status !== 401 && errorResponse.status !== 403) this.showSnackService.error(this.favoriteService.removeFavoriteError);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected (remove Favorite) error! Code:${errorResponse.status}`);
        }
      })
    );
  }

  private applyCartChanges(): void {
    this.favoriteProducts.forEach((favProduct:FavoriteProductType) => {
      const cartProduct:CartItemType|undefined = this.cartProducts.find((cartProductItem:CartItemType)=>cartProductItem.product.id === favProduct.id);
      if (cartProduct){
        favProduct.isInCart = true;
        favProduct.countInCart = cartProduct.quantity;
      }else favProduct.isInCart = false;

    });
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
      if (this.appLanguage!==language)this.appLanguage = language;
    }));

    const cart$:Observable<CartResponseType> = this.cartService.getCart()
      .pipe(
        catchError((error: HttpErrorResponse):Observable<ExtErrorResponseType> => {
          return throwError(():ExtErrorResponseType=>{
            return{
              __source:ErrorSources.UserCart,
              ...error
            } as ExtErrorResponseType;
          })
        }
      ));//обязательный запрос, без которого летим в error при подписке

    const favorites$:Observable<FavoritesResponseType> = this.favoriteService.getFavorites(true)
      .pipe(
        catchError((error: HttpErrorResponse):Observable<ExtErrorResponseType>=>{
          return throwError(():ExtErrorResponseType=>{
            return{
              __source:ErrorSources.Favorites,
              ...error
            } as ExtErrorResponseType;
          })
        })
      );//обязательный запрос, без которого летим в error при подписке

    const combineRequests$:Observable<[CartResponseType,FavoritesResponseType]>=combineLatest([cart$,favorites$]);

    this.subscriptions$.add(
      combineRequests$.subscribe({
        next:([cartResp,favoritesResp]:[CartResponseType,FavoritesResponseType])=>{
          if (cartResp.error || !cartResp.cart || !cartResp.cart.items || !Array.isArray(cartResp.cart.items)){
            this.showSnackService.error(this.cartService.getCartError);
            this.router.navigate(['/',this.appLanguage]);
            throw new Error(cartResp.message);
          }
          this.cartProducts = cartResp.cart.items;

          if (favoritesResp.error || !favoritesResp.favorites || !Array.isArray(favoritesResp.favorites)){
            this.showSnackService.error(this.favoriteService.getFavoritesError);
            this.router.navigate(['/',this.appLanguage]);
            throw new Error(favoritesResp.message);
          }
          if (favoritesResp.favorites.length===0) return;

          let favorites = favoritesResp.favorites;
          this.cartProducts.forEach((cartProduct:CartItemType) => {
            const favItemIndex:number = favorites.findIndex((favoriteItem:FavoriteProductType)=> favoriteItem.id === cartProduct.product.id);
            if (favItemIndex >= 0) {
              favorites[favItemIndex].countInCart = cartProduct.quantity;
              favorites[favItemIndex].isInCart = true;
            }
          });
          this.favoriteProducts = favorites;
        },
        error:(extError:ExtErrorResponseType)=>{
          if (extError.__source === ErrorSources.UserCart){
            if (extError.status !==401 && extError.status !== 403) this.showSnackService.error(extError.error.message,ReqErrorTypes.cartGetCart);
            console.error(extError.error.message ? extError.error.message : `Unexpected error (getUserCart)! Code:${extError.status}`);
          }
          if (extError.__source === ErrorSources.Favorites){
            if (extError.status !== 401 && extError.status !== 403) this.showSnackService.error(this.favoriteService.getFavoritesError);
            console.error(extError.error.message ? extError.error.message : `Unexpected (get Favorites) error! Code:${extError.status}`);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
