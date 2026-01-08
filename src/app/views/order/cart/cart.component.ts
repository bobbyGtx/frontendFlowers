import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product.service';
import {Subscription, timer} from 'rxjs';
import {BestProductsResponseType} from '../../../../assets/types/responses/best-products-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ProductType} from '../../../../assets/types/product.type';
import {CartService} from '../../../shared/services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {environment} from '../../../../environments/environment';
import {CartItemType} from '../../../../assets/types/cart-item.type';
import {CartProductType} from '../../../../assets/types/cart-product.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';

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
  showedMessages:Array<string>=[];

  editCount(cartProduct:CartProductType, count:number){
    this.subscriptions$.add(
      this.cartService.updateCart(cartProduct,count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error || !data.cart) {
            this.showSnackService.error(this.cartService.updateCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          //if (data.messages) this.showSnackService.infoObj(data);
          if (data.messages) this.showMessages(data);
          this.cartItems = data.cart.items;
          this.totalCount=data.cart.count;
          this.totalAmount=data.cart.amount;
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status !==401 && errorResponse.status !== 403)this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartUpdate);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }
  //функция для фильтрации повторных сообщений из messages[]
  showMessages(cartResponse:CartResponseType):void{
    if (!cartResponse.messages || cartResponse.messages.length === 0) return;
    if (this.showedMessages.length === 0){
      this.showedMessages=cartResponse.messages;
    }else{
      let newMessages:string[]=[];
      for (let i = 0; i < cartResponse.messages.length; i++) {
        const ind = this.showedMessages.findIndex(item=>item===cartResponse.messages![i]);
        if (ind ===-1) newMessages.push(cartResponse.messages[i]);
      }
      if (newMessages.length === 0){
        cartResponse.messages=[];
      }else{
        this.showedMessages=[...this.showedMessages, ...cartResponse.messages];
      }
    }

    if (cartResponse.messages.length > 0){
      const tmrSubscription$ = timer(30000).subscribe(()=>{
        cartResponse.messages?.forEach((message:string)=>{
          const ind = this.showedMessages.findIndex(item=>item===message);
          if (ind!==-1) this.showedMessages.splice(ind,1);
        })
        tmrSubscription$.unsubscribe();
      });
      this.showSnackService.infoObj(cartResponse);
    }

  }

  updateCount(cartProduct:CartProductType,value:number) {
    this.editCount(cartProduct,value);
  }

  ngOnInit() {
    this.subscriptions$.add(
      this.cartService.getCart(true).subscribe({
        next: (data: CartResponseType) => {
          //Может быть error с нормальным ответом при проблемах с товарами
          if (data.error && !data.cart) {
            this.showSnackService.error(this.cartService.getCartError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          //if (data.error && data.cart) this.showSnackService.error(data.message,ReqErrorTypes.cartGetCart);Инфо сообщение выводим только в сервисе
          if (data.messages) this.showMessages(data);
          //if (data.messages) this.showSnackService.infoObj(data);
          if (data.cart){
            this.cartItems = data.cart.items;
            this.totalCount=data.cart.count;
            this.totalAmount=data.cart.amount;
            if (this.cartItems.length > 0){
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
          if (errorResponse.status !==401 && errorResponse.status !== 403) this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartGetCart);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected (get Cart) error! Code:${errorResponse.status}`);
        }
      }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
