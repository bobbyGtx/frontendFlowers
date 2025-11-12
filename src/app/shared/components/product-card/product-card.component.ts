import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {ProductType} from '../../../../assets/types/product.type';
import {CartService} from '../../services/cart.service';
import {Subscription} from 'rxjs';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
class ProductCardComponent implements OnInit, OnDestroy{
  @Input() product!:ProductType;
  @Input() isLight:boolean=false;
  //countInCart:number = 0;
  cartService:CartService=inject(CartService);
  showSnackService:ShowSnackService=inject(ShowSnackService);
  subscriptions$:Subscription=new Subscription();
  images:string = environment.images;
  count:number=1;

  ngOnInit():void{
    if (this.product.countInCart) this.count=this.product.countInCart;
  }

  updateCart(count:number){
    this.subscriptions$.add(
      this.cartService.updateCart(this.product.id,count).subscribe({
        next: (data: CartResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.cartService.userErrorMessages.getCart);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          this.product.countInCart=0;
          this.count=1;
          if (data.cart){
            const itemIndexInResp:number = data.cart.items.findIndex((item)=>item.product.id === this.product.id);
            if (itemIndexInResp > -1) {
              this.product.countInCart = data.cart.items[itemIndexInResp].quantity;
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
    if (!this.product.countInCart) return;
    this.count=1;
    this.product.countInCart=0;
    this.updateCart(0);

  }

  updateCount(count:number){
    this.count=count;
    if (this.product.countInCart)this.updateCart(count);
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}

export default ProductCardComponent
