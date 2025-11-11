import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product.service';
import {Observable, Subscription} from 'rxjs';
import {BestProductsResponseType} from '../../../../assets/types/responses/best-products-response.type';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ProductType} from '../../../../assets/types/product.type';
import {CartService} from '../../../shared/services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {environment} from '../../../../environments/environment.development';
import {CartItemType} from '../../../../assets/types/cart-item.type';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit , OnDestroy {
  productService:ProductService=inject(ProductService);
  cartService:CartService=inject(CartService);
  showSnackService:ShowSnackService=inject(ShowSnackService);
  subscriptions$:Subscription = new Subscription();
  serverImagesPath: string = environment.images;
  extraProducts:ProductType[]=[];
  cartItems:CartItemType[]=[];
  totalAmount:number=0;
  totalCount:number=0;

  ngOnInit() {
    this.subscriptions$.add(
      this.cartService.getCart().subscribe({
        next: (data: CartResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.cartService.userErrorMessages.getCart);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          if (data.cart){
            this.cartItems = data.cart.items;
            if (this.cartItems.length > 0){
              this.calculateTotal();
              this.subscriptions$.add(
                this.productService.getBestProducts().subscribe({
                  next: (data:BestProductsResponseType) => {
                    if (data.error){
                      this.showSnackService.error(this.productService.getBestProductsError);
                      throw new Error(data.message);
                    }
                    if (data.products)this.extraProducts=data.products;
                  },
                  error: (errorResponse:HttpErrorResponse) => {
                    this.showSnackService.error(this.productService.getBestProductsError);
                    console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getBestProducts)! Code:${errorResponse.status}`);
                  }
                })
              );
            }
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(this.cartService.userErrorMessages.getCart);
          if (errorResponse.error && errorResponse.error.message) console.log(errorResponse.error.message)
          else console.log(`Unexpected error (get Cart)!` + ` Code:${errorResponse.status}`);
        }
      }));
  }

  editCount(id:number, count:number){
    this.subscriptions$.add(
      this.cartService.updateCart(id,count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.cartService.userErrorMessages.getCart);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          if (data.cart){
            this.cartItems = data.cart.items;
            this.calculateTotal();
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

  updateCount(value:number,productId:number) {
    this.editCount(productId,value);
  }

  calculateTotal():void{
    this.totalCount=0;
    this.totalAmount=0;
    this.cartItems.forEach((cartItem:CartItemType) => {
      if(cartItem.product.disabled) {
        cartItem.quantity=0;
      }else{
        this.totalCount+=cartItem.quantity;
        this.totalAmount+=cartItem.quantity*cartItem.product.price;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
