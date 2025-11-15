import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
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

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  productService: ProductService = inject(ProductService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  cartService: CartService = inject(CartService);

  serverImagesPath: string = environment.images;
  recommendedProducts: ProductType[] = [];
  product: ProductType | null = null;
  cartProducts: CartItemType[] = [];
  subscriptions$: Subscription = new Subscription();
  count: number = 1;

  updateCount(value: number) {
    this.count = value;
    if (this.product?.countInCart) {
      this.updateCart(value);
    }
  }

  addToCart() {
    if (!this.product?.disabled) {
      this.updateCart(this.count);
    }
  }

  updateCart(count: number) {
    this.subscriptions$.add(
      this.cartService.updateCart(this.product!, count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error || !data.cart) {
            this.showSnackService.error(this.cartService.getCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          if (data.infoMessage) this.showSnackService.info(data.infoMessage);
          this.cartProducts = [];
          this.product!.countInCart = 0;
            this.cartProducts = data.cart.items;
            if (data.cart.items.length) {
              const itemIndexInResp: number = data.cart.items.findIndex((item) => item.product.id === this.product!.id);
              if (itemIndexInResp > -1) {
                this.product!.countInCart = data.cart.items[itemIndexInResp].quantity;
              }
              this.checkRecommendedProducts();
            }

        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  removeFromCart() {
    if (this.product?.countInCart) {
      this.count = 1;
      this.updateCart(0);
    }
  }

  ngOnInit(): void {
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        const getProduct$: Observable<ProductResponseType> = this.productService.getProduct(params['url'])
          .pipe(catchError((err: HttpErrorResponse): Observable<ProductResponseType> => of({__error: true, err} as any)));
        const getUserCart$: Observable<CartResponseType> = this.cartService.getCart()
          .pipe(catchError((err: HttpErrorResponse): Observable<CartResponseType> => of({__error: true, err} as any)));

        const combinedRequests$: Observable<[ ProductResponseType | any,CartResponseType | any]> = combineLatest([getProduct$,getUserCart$]);
        this.subscriptions$.add(combinedRequests$.subscribe({
          next:([getProductResp, getUserCartResp]:[ProductResponseType|any,CartResponseType | any])=>{
            // ---------- Ошибка GetProduct ----------
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
            // ---------- Ошибка корзина ----------
            if (getUserCartResp.__error) {
              const httpErr: HttpErrorResponse = getUserCartResp.err;
              this.showSnackService.error(httpErr.error.message, ReqErrorTypes.cartGetCart);
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

            this.subscriptions$.add(
              this.productService.getRecommendedProducts(this.product.category_id, this.product.id).subscribe({
                next: (data: RecommendedProductsResponseType) => {
                  if (data.error){
                    this.showSnackService.error(this.productService.getProductError);
                    throw new Error(data.message);
                  }
                  if (data.products && data.products.length > 0) {
                    this.recommendedProducts = data.products;
                    this.checkRecommendedProducts();//заполнение countInCart полей у рекомендованных продуктов
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

  checkRecommendedProducts() {
    this.recommendedProducts.forEach((productItem: ProductType) => {
      const productIndexInCart: number = this.cartProducts.findIndex((cartItem: CartItemType) => cartItem.product.id == productItem.id);
      if (productIndexInCart !== -1) {
        productItem.countInCart = this.cartProducts[productIndexInCart].quantity;
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
