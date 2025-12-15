import {Component, inject, OnDestroy, OnInit} from '@angular/core';

import {catchError, combineLatest, Observable, of, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProductService} from '../../../shared/services/product.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ActivatedRoute} from '@angular/router';
import {ProductType} from '../../../../assets/types/product.type';
import {ProductResponseType} from '../../../../assets/types/responses/product-response.type';
import {RecommendedProductsResponseType} from '../../../../assets/types/responses/recommended-products-response.type';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {CartService} from '../../../shared/services/cart.service';
import {CartItemType} from '../../../../assets/types/cart-item.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {FavoriteService} from '../../../shared/services/favorite.service';
import {AddToFavoritesResponseType} from '../../../../assets/types/responses/add-to-favorites-response.type';
import {FavoritesResponseType} from '../../../../assets/types/responses/favorites-response.type';
import {FavoriteProductType} from '../../../../assets/types/favorite-product.type';
import {AuthService} from '../../../core/auth/auth.service';
import {Config} from '../../../shared/config';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  private productService: ProductService = inject(ProductService);
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private cartService: CartService = inject(CartService);
  private authService: AuthService = inject(AuthService);
  private favoriteService: FavoriteService = inject(FavoriteService);

  serverImagesPath: string = environment.images;
  recommendedProducts: ProductType[] = [];
  product: ProductType | null = null;
  cartProducts: CartItemType[] = [];
  favoriteProducts: FavoriteProductType[] = [];
  subscriptions$: Subscription = new Subscription();
  count: number = 1;

  protected updateCount(value: number) {
    this.count = value;
    if (this.product?.countInCart) {
      this.updateCart(value);
    }
  }

  protected addToCart() {
    if (!this.product?.disabled) {
      this.updateCart(this.count);
    }
  }

  private updateCart(count: number) {
    this.subscriptions$.add(
      this.cartService.updateCart(this.product!, count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error || !data.cart) {
            this.showSnackService.error(this.cartService.updateCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          //Инф сообщения только в Cart компоненте
          this.cartProducts = [];
          this.product!.countInCart = 0;
            this.cartProducts = data.cart.items;
            if (data.cart.items.length) {
              const itemIndexInResp: number = data.cart.items.findIndex((item) => item.product.id === this.product!.id);
              if (itemIndexInResp > -1) {
                this.product!.countInCart = data.cart.items[itemIndexInResp].quantity;
              }
              this.applyFavAndCart();
            }
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status !==401 && errorResponse.status !== 403)this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  protected removeFromCart() {
    if (this.product?.countInCart) {
      this.count = 1;
      this.updateCart(0);
    }
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

  private applyFavAndCart() {
    this.recommendedProducts.forEach((productItem: ProductType) => {
      if (this.favoriteProducts.length>0){
        const favIndex:number = this.favoriteProducts.findIndex((favItem:FavoriteProductType)=>favItem.id === productItem.id);
        if (favIndex !==-1) productItem.isInFavorite=true;
      }
      const productIndexInCart: number = this.cartProducts.findIndex((cartItem: CartItemType) => cartItem.product.id == productItem.id);
      if (productIndexInCart !== -1) productItem.countInCart = this.cartProducts[productIndexInCart].quantity;
    })
  }
//Объединить все 3 запроса
  ngOnInit(): void {
    let initialized:boolean = false;
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        initialized?window.scrollTo({top: 0, behavior: 'smooth'}):initialized = true;
        const getProduct$: Observable<ProductResponseType> = this.productService.getProduct(params['url'])
          .pipe(catchError((err: HttpErrorResponse): Observable<ProductResponseType> => of({__error: true, err} as any)));
        const getUserCart$: Observable<CartResponseType> = this.cartService.getCart()
          .pipe(catchError((err: HttpErrorResponse): Observable<CartResponseType> => of({__error: true, err} as any)));
        const getFavorites$:Observable<FavoritesResponseType|any> = this.authService.getIsLoggedIn()?this.favoriteService.getFavorites()
          .pipe(catchError((err: HttpErrorResponse):Observable<any> => of({ __error: true, err } as any))):of(null);

        const combinedRequests$: Observable<[ ProductResponseType | any,CartResponseType | any, FavoritesResponseType|any]> = combineLatest([getProduct$,getUserCart$,getFavorites$]);
        this.subscriptions$.add(combinedRequests$.subscribe({
          next:([getProductResp, getUserCartResp, getFavoritesResp]:[ProductResponseType|any,CartResponseType | any, FavoritesResponseType|any])=>{
            // ---------- Error code GetProduct ----------
            if (getProductResp.__error) {
              const errorResponse: HttpErrorResponse = getProductResp.err;
              this.showSnackService.error(this.productService.getProductError);
              console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (getProduct)! Code:${errorResponse.status}`);
            }
            const productResponse:ProductResponseType = getProductResp as ProductResponseType;
            if (productResponse.error || !productResponse.product) {
              this.showSnackService.error(this.productService.getProductError);
              throw new Error(productResponse.message);
            }
            this.product=productResponse.product;
            // ---------- Error code GetCart ----------
            if (getUserCartResp.__error) {
              const httpErr: HttpErrorResponse = getUserCartResp.err;
              if (httpErr.status !==401 && httpErr.status !== 403)this.showSnackService.error(httpErr.error.message, ReqErrorTypes.cartGetCart);
              console.error(httpErr.error.message ? httpErr.error.message : `Unexpected (get Cart) error! Code:${httpErr.status}`);
            }
            const cartData = getUserCartResp as CartResponseType;
            if ((cartData.error && !cartData.cart) || !cartData.cart) {
              this.showSnackService.error(this.cartService.getCartError);
              throw new Error(cartData.message);
            }//Если ошибка есть и нет корзины в ответе - выводим её и завершаем функцию
            //if (data.error && data.cart) this.showSnackService.info(data.message);Инфо сообщение выводим только в сервисе
            this.cartProducts = cartData.cart.items;

            //Применение корзины
            if (this.cartProducts.length > 0) {
              const productIndexInCart: number = this.cartProducts.findIndex((cartItem: CartItemType) => cartItem.product.id === this.product!.id);
              if (productIndexInCart !== -1) {
                this.product.countInCart = this.cartProducts[productIndexInCart].quantity;
                this.count = this.product.countInCart;
              }
            }

            //Применение избранного
            if (getFavoritesResp){
              if (getFavoritesResp.__error) {
                const httpFavErr: HttpErrorResponse = getFavoritesResp.err;
                if (httpFavErr.status !==401 && httpFavErr.status !== 403)this.showSnackService.error(this.favoriteService.getFavoritesError);
                console.error(httpFavErr.error.message ? httpFavErr.error.message : `Unexpected (get Favorites) error! Code:${httpFavErr.status}`);
              }else{
                const favoriteList:FavoritesResponseType = (getFavoritesResp as FavoritesResponseType);
                if (favoriteList.favorites && favoriteList.favorites.length > 0) {
                  this.favoriteProducts = favoriteList.favorites;
                  const indexInFav:number = favoriteList.favorites.findIndex((favItem:FavoriteProductType)=>favItem.id===this.product!.id);
                  if (indexInFav !== -1) this.product!.isInFavorite=true;
                }
              }
            }

            this.subscriptions$.add(
              this.productService.getRecommendedProducts(this.product.category_id, this.product.id).subscribe({
                next: (data: RecommendedProductsResponseType) => {
                  if (data.error){
                    this.showSnackService.error(this.productService.getProductError);
                    throw new Error(data.message);
                  }
                  if (data.products && data.products.length > 0) {
                    this.recommendedProducts = data.products;
                    this.applyFavAndCart();//заполнение countInCart полей у рекомендованных продуктов
                  }
                },
                error: (errorResponse: HttpErrorResponse) => {
                  this.showSnackService.error(this.productService.getRecommendedProductsError);
                  console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getRecommendedProducts)! Code:${errorResponse.status}`);
                },
              })
            );
          }
        }));
      })
    );//3 запроса. 2 спаренных (продукт и корзина), после чего рекомендованные продукты
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
