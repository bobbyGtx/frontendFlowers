import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {ProductType} from '../../../../assets/types/product.type';
import {CartService} from '../../services/cart.service';
import {Subscription} from 'rxjs';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {Config} from '../../config';
import {FavoritesResponseType} from '../../../../assets/types/responses/favorites-response.type';
import {AddToFavoritesResponseType} from '../../../../assets/types/responses/add-to-favorites-response.type';
import {AuthService} from '../../../core/auth/auth.service';
import {FavoriteService} from '../../services/favorite.service';
import {environment} from '../../../../environments/environment';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit, OnDestroy{
  @Input() product!:ProductType;
  @Input() isLight:boolean=false;
  //countInCart:number = 0;
  cartService:CartService=inject(CartService);
  showSnackService:ShowSnackService=inject(ShowSnackService);
  authService:AuthService=inject(AuthService);
  favoriteService:FavoriteService=inject(FavoriteService);
  languageService:LanguageService=inject(LanguageService);

  subscriptions$:Subscription=new Subscription();
  appLanguage:AppLanguages;

  images:string = environment.images;
  count:number=1;

  constructor() {
    this.appLanguage = this.languageService.appLang;
  }

  ngOnInit():void{
    this.subscriptions$.add(
      this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
        if (this.appLanguage !== language)this.appLanguage = language;
      }));
    if (this.product.countInCart) this.count=this.product.countInCart;
  }

  updateCart(count:number){
    this.subscriptions$.add(
      this.cartService.updateCart(this.product,count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error || !data.cart) {
            this.showSnackService.error(this.cartService.updateCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          //Инфо сообщения выводим только в cart компоненте
          this.product.countInCart=0;
          this.count=1;
          const itemIndexInResp:number = data.cart.items.findIndex((item)=>item.product.id === this.product.id);
          if (itemIndexInResp > -1) {
            this.product.countInCart = data.cart.items[itemIndexInResp].quantity;
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status !==401 && errorResponse.status !== 403) this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  removeFromCart(){
    if (!this.product.countInCart) return;
    this.count=1;
    this.product.countInCart=0;
    this.updateCart(0);
  }

  updateCount(count:number){
    this.count=count;
    if (this.product.countInCart)this.updateCart(count);
  }

  protected toggleFavorite():void {
    if (!this.product) return;
    if (!this.authService.getIsLoggedIn()){
      this.showSnackService.infoObj(Config.authorisationRequired);
      return;
    }
    if (this.product.isInFavorite){
      this.subscriptions$.add(
        this.favoriteService.removeFavorite(this.product.id).subscribe({
          next: (data:FavoritesResponseType) => {
            if (data.error) {
              this.showSnackService.error(this.favoriteService.removeFavoriteError);
              throw new Error(data.message);
            }
            if (this.product)this.product.isInFavorite=false;
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error.status !== 401 && errorResponse.status !== 403) this.showSnackService.error(this.favoriteService.removeFavoriteError);
            console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected (remove Favorite) error! Code:${errorResponse.status}`);
          }
        })
      );
    }else{
      this.subscriptions$.add(
        this.favoriteService.addToFavorite(this.product.id).subscribe({
          next: (data: AddToFavoritesResponseType) => {
            if (data.error || !data.product) {
              this.showSnackService.error(this.favoriteService.addToFavoritesError);
              throw new Error(data.message);
            }
            if (this.product && this.product.id === data.product.id) this.product.isInFavorite = true;
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error.status !== 401 && errorResponse.status !== 403) this.showSnackService.error(this.favoriteService.addToFavoritesError);
            console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected (add Favorite) error! Code:${errorResponse.status}`);
          }
        }));
    }
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
