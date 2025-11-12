import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {Subscription} from 'rxjs';
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

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  productService: ProductService = inject(ProductService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  cartService:CartService = inject(CartService);

  serverImagesPath: string = environment.images;
  recommendedProducts: ProductType[] = [];
  product: ProductType | null = null;
  cartProducts:CartItemType[]=[];
  subscriptions$: Subscription = new Subscription();
  count:number = 1;

  updateCount(value:number) {
    this.count = value;
    if (this.product?.countInCart){
      this.updateCart(value);
    }
  }

  addToCart() {
    if (!this.product?.disabled) {
      this.updateCart(this.count);
    }
  }

  updateCart(count:number) {
    this.subscriptions$.add(
      this.cartService.updateCart(this.product!.id,count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.cartService.userErrorMessages.getCart);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          this.cartProducts=[];
          this.product!.countInCart=0;
          if (data.cart){
            this.cartProducts = data.cart.items;
            if (data.cart.items.length){
              const itemIndexInResp:number = data.cart.items.findIndex((item)=>item.product.id === this.product!.id);
              if (itemIndexInResp > -1) {
                this.product!.countInCart = data.cart.items[itemIndexInResp].quantity;
              }
            }
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(this.cartService.userErrorMessages.updateCart);
          if (errorResponse.error && errorResponse.error.message) console.log(errorResponse.error.message)
          else console.log(`Unexpected error (update Cart)!` + ` Code:${errorResponse.status}`);
        }
      })
    );
  }

  removeFromCart(){
    if (this.product?.countInCart){
      this.count=1;
      this.updateCart(0);
    }
  }

  ngOnInit(): void {
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        this.productService.getProduct(params['url']).subscribe({
          next: (productData: ProductResponseType) => {
            if (productData.error) {
              this.showSnackService.error(this.productService.getProductError);
              throw new Error(productData.message);
            }
            if (!productData.product) throw new Error(productData.message);

            this.subscriptions$.add(this.cartService.getCart().subscribe({
              next: (data: CartResponseType) => {
                if (data.error) {
                  this.showSnackService.error(this.cartService.userErrorMessages.getCart);
                  throw new Error(data.message);
                }//Если ошибка есть - выводим её и завершаем функцию
                if (data.cart) this.cartProducts = data.cart.items;
                if (this.cartProducts.length > 0 && productData.product) {
                  const productIndexInCart: number = this.cartProducts.findIndex((cartItem: CartItemType) => cartItem.product.id == productData.product?.id);
                  if (productIndexInCart !== -1) {
                    productData.product.countInCart = this.cartProducts[productIndexInCart].quantity;
                    this.count=productData.product.countInCart;
                  }
                }
                this.product = productData.product!;
              },
              error: (errorResponse: HttpErrorResponse) => {
                this.product = productData.product!;
                this.showSnackService.error(this.cartService.userErrorMessages.getCart);
                if (errorResponse.error && errorResponse.error.message) console.log(errorResponse.error.message)
                else console.log(`Unexpected error (get Cart)!` + ` Code:${errorResponse.status}`);
              }
            }));

            this.subscriptions$.add(
              this.productService.getRecommendedProducts(productData.product.category_id, productData.product.id).subscribe({
                next: (data: RecommendedProductsResponseType) => {
                  if (data.error) {
                    this.showSnackService.error(this.productService.getRecommendedProductsError);
                    throw new Error(data.message);
                  }
                  if (data.products) this.recommendedProducts = data.products;
                },
                error: (errorResponse: HttpErrorResponse) => {
                  this.showSnackService.error(this.productService.getRecommendedProductsError);
                  console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getRecommendedProducts)! Code:${errorResponse.status}`);
                }
              }));
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.showSnackService.error(this.productService.getProductError);
            console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getProduct)! Code:${errorResponse.status}`);
          }
        });
      })
    );


  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
