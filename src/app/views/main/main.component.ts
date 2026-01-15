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

type ReviewType={
  name: string,
  image: string,
  text: string,
}

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

  private subscriptions$: Subscription=new Subscription();
  appLanguage:AppLanguages;

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
  protected reviews:Array<ReviewType> = [
    {
      name:'Ирина',
      image:'review1.png',
      text:'В ассортименте я встретила все комнатные растения, которые меня интересовали. Цены - лучшие в городе. Доставка - очень быстрая и с заботой о растениях.',
    },
    {
      name:'Анастасия',
      image:'review2.png',
      text:'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом.',
    },
    {
      name:'Илья',
      image:'review3.png',
      text:'Магазин супер! Второй раз заказываю курьером, доставлено в лучшем виде. Ваш ассортимент комнатных растений впечатляет! Спасибо вам за хорошую работу!',
    },
    {
      name:'Аделина',
      image:'review4.jpg',
      text:'Хочу поблагодарить всю команду за помощь в подборе подарка для моей мамы! Все просто в восторге от мини-сада! А самое главное, что за ним удобно ухаживать, ведь в комплекте мне дали целую инструкцию.',
    },
    {
      name:'Яника',
      image:'review5.jpg',
      text:'Спасибо большое за мою обновлённую коллекцию суккулентов! Сервис просто на 5+: быстро, удобно, недорого. Что ещё нужно клиенту для счастья?',
    },
    {
      name:'Марина',
      image:'review6.jpg',
      text:'Для меня всегда важным аспектом было наличие не только физического магазина, но и онлайн-маркета, ведь не всегда есть возможность прийти на место. Ещё нигде не встречала такого огромного ассортимента!',
    },
    {
      name:'Станислав',
      image:'review7.jpg',
      text:'Хочу поблагодарить консультанта Ирину за помощь в выборе цветка для моей жены. Я ещё никогда не видел такого трепетного отношения к весьма непростому клиенту, которому сложно угодить! Сервис – огонь!',
    },
  ];
  private favoriteProducts:FavoriteProductType[]=[];

  constructor() {
    this.appLanguage = this.languageService.appLang;
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
      if (this.appLanguage!==language)this.appLanguage = language;
    }));
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

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
