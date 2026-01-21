import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../shared/services/product.service';
import {catchError, combineLatest, Observable, of, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../core/show-snack.service';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {ProductType} from '../../../assets/types/product.type';
import {BestProductsResponseType} from '../../../assets/types/responses/best-products-response.type';
import {CartResponseType} from '../../../assets/types/responses/cart-response.type';
import {CartService} from '../../shared/services/cart.service';
import {CartItemType} from '../../../assets/types/cart-item.type';
import {FavoritesResponseType} from '../../../assets/types/responses/favorites-response.type';
import {AuthService} from '../../core/auth/auth.service';
import {FavoriteService} from '../../shared/services/favorite.service';
import {FavoriteProductType} from '../../../assets/types/favorite-product.type';
import {LanguageService} from '../../core/language.service';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {MainTranslationType} from '../../../assets/types/translations/main-translation.type';
import {mainTranslations, reviewsTranslations} from './main.translations';
import {ReviewType} from '../../../assets/types/review.type';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService=inject(ShowSnackService);
  private languageService:LanguageService=inject(LanguageService);
  private productService: ProductService=inject(ProductService);
  private cartService: CartService=inject(CartService);
  private authService: AuthService=inject(AuthService);
  private favoriteService:FavoriteService=inject(FavoriteService);
  private sanitizer: DomSanitizer=inject(DomSanitizer);

  private subscriptions$: Subscription=new Subscription();
  protected appLanguage:AppLanguages;
  protected translations:MainTranslationType;
  private mapUrlLanguageList:{[key in AppLanguages]: string}={
    [AppLanguages.ru]:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1302.4906195725962!2d6.9920544!3d49.2388449!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795b6a960ac17fd%3A0xb9be345dd31096e!2sEuropa%20Galerie!5e0!3m2!1sru!2sde!4v1768850908936!5m2!1sru!2sde",
    [AppLanguages.en]:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1302.4906195725962!2d6.9920544!3d49.2388449!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795b6a960ac17fd%3A0xb9be345dd31096e!2sEuropa%20Galerie!5e0!3m2!1sen!2sde!4v1768850865047!5m2!1sen!2sde",
    [AppLanguages.de]:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1302.4906195725962!2d6.9920544!3d49.2388449!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795b6a960ac17fd%3A0xb9be345dd31096e!2sEUROPA-Galerie%20Saarbr%C3%BCcken!5e0!3m2!1sde!2sde!4v1768850543965!5m2!1sde!2sde",
  };

  protected mapUrl!:SafeResourceUrl;

  protected bestProducts:ProductType[]=[];
  protected customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  };
  protected reviews:Array<ReviewType>;
  private favoriteProducts:FavoriteProductType[]=[];

  constructor() {
    this.appLanguage = this.languageService.appLang;
    this.translations = mainTranslations[this.appLanguage];
    this.reviews = reviewsTranslations[this.appLanguage];
  }

  doRequests(): void {
    const bestProducts$ = this.productService.getBestProducts()
      .pipe(catchError((err: HttpErrorResponse) => of({ __error: true, err } as any)));
    const cart$ = this.cartService.getCart()
      .pipe(catchError((err: HttpErrorResponse) => of({ __error: true, err } as any)));
    const favorites$:Observable<FavoritesResponseType|any> = this.authService.getIsLoggedIn()?this.favoriteService.getFavorites()
      .pipe(catchError((err: HttpErrorResponse):Observable<any> => of({ __error: true, err } as any))):of(null);

    //Favorites of(null) если пользователь не залогинен
    const combinedRequest$: Observable<[BestProductsResponseType | any, CartResponseType | any, FavoritesResponseType|any]> =
      combineLatest([bestProducts$, cart$, favorites$]);
    this.subscriptions$.add(
      combinedRequest$.subscribe({
        next: ([bestProductsResponse,cartResponse, favoritesResponse]:[BestProductsResponseType | any, CartResponseType | any, FavoritesResponseType|any]) => {
          //Обработка ошибок bestProducts
          if (bestProductsResponse.__error) {
            const httpErr: HttpErrorResponse = bestProductsResponse.err;
            console.error(httpErr.error.message?httpErr.error.message:`Unexpected error (getBestProducts)! Code:${httpErr.status}`);
            return;
          }//Ошибочный код bestProducts. Завершаем функцию
          if ((bestProductsResponse as BestProductsResponseType).error){
            throw new Error((bestProductsResponse as BestProductsResponseType).message);
          }//Обработка ошибки с кодом 200
          let bestProducts:Array<ProductType> = (bestProductsResponse as BestProductsResponseType).products!;
          if (cartResponse.__error) {
            const httpErr: HttpErrorResponse = cartResponse.err;
            console.error(httpErr.error.message?httpErr.error.message:`Unexpected error (GetCart)! Code:${httpErr.status}`);
            this.bestProducts = bestProducts;
            return;
          }//Ошибка getCart. Выводим bestProducts и завершаем
          const userCart: CartResponseType = (cartResponse as CartResponseType);
          if (userCart.error && !userCart.cart){
            this.showSnackService.error(this.cartService.getCartError);
            throw new Error(userCart.message);
          }//обработка ошибки с кодом 200 без корзины
          //Ошибки корзины выводим только на странице корзины

          if (favoritesResponse){
            if (favoritesResponse.__error) {
              const httpErr: HttpErrorResponse = favoritesResponse.err;
              console.error(httpErr.error.message?httpErr.error.message:`Unexpected error (GetFavorites)! Code:${httpErr.status}`);
            }else{
              const favoriteList:FavoritesResponseType = (favoritesResponse as FavoritesResponseType);
              if (favoriteList.favorites)this.favoriteProducts = favoriteList.favorites;
            }
          }

          if ((userCart.cart && userCart.cart.items.length > 0) || (this.favoriteProducts && this.favoriteProducts.length > 0)){
            this.bestProducts = bestProducts.map((bestProduct:ProductType)=>{
              if (userCart.cart && userCart.cart.items.length > 0){
                const cartItemIndex:number = userCart.cart.items.findIndex((cartProduct:CartItemType)=>cartProduct.product.id ===bestProduct.id);
                if (cartItemIndex > -1)bestProduct.countInCart=userCart.cart.items[cartItemIndex].quantity;
              }
              if (this.favoriteProducts && this.favoriteProducts.length > 0){
                const favItemIndex:number = this.favoriteProducts.findIndex((favProduct:FavoriteProductType)=>favProduct.id ===bestProduct.id);
                if (favItemIndex > -1) bestProduct.isInFavorite=true;
              }
              return bestProduct
            })
          }//применяем корзину и избранное к продуктам
          this.bestProducts = bestProducts;
        },
        error:(error:HttpErrorResponse)=>{
          this.showSnackService.error("Unexpected Request Error!");
          console.error(error.error.message);
        }
      })
    );
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
      this.appLanguage = language;
      this.translations = mainTranslations[this.appLanguage];
      this.reviews = reviewsTranslations[this.appLanguage];
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrlLanguageList[this.appLanguage]);//Обновление карты
      this.doRequests();
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  protected readonly reviewsTranslations = reviewsTranslations;
}
