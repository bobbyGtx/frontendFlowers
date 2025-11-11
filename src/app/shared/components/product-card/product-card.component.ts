import {Component, inject, Input, OnDestroy} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {ProductType} from '../../../../assets/types/product.type';
import {CartService} from '../../services/cart.service';
import {Subscription} from 'rxjs';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {BestProductsResponseType} from '../../../../assets/types/responses/best-products-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
class ProductCardComponent implements OnDestroy {
  @Input() product!:ProductType;
  @Input() isLight:boolean=false;
  cartService:CartService=inject(CartService);
  showSnackService:ShowSnackService=inject(ShowSnackService);
  subscriptions$:Subscription=new Subscription();
  images:string = environment.images;
  count:number=1;

  addToCart(){
    this.subscriptions$.add(
      this.cartService.updateCart(this.product.id,this.count).subscribe({
          next: (data: CartResponseType) => {
            if (data.error) {
              this.showSnackService.error(this.cartService.userErrorMessages.getCart);
              throw new Error(data.message);
            }//Если ошибка есть - выводим её и завершаем функцию
            if (data.cart){

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
  updateCount(count:number){
    this.count=count;
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}

export default ProductCardComponent
