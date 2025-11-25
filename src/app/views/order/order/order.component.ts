import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CartService} from '../../../shared/services/cart.service';
import {catchError, combineLatest, Observable, of, Subscription} from 'rxjs';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {ShowSnackService} from '../../../core/show-snack.service';
import {CartType} from '../../../../assets/types/cart.type';
import {Router} from '@angular/router';
import {DeliveryTypeType} from '../../../../assets/types/delivery-type.type';
import {DeliveryService} from '../../../shared/services/delivery.service';
import {DeliveryTypesResponseType} from '../../../../assets/types/responses/delivery-types-response.type';
import {PaymentService} from '../../../shared/services/payment.service';
import {PaymentTypesResponseType} from '../../../../assets/types/responses/payment-types-response.type';
import {PaymentTypeType} from '../../../../assets/types/payment-type.type';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy {
  //На этапе отладки скрыта проверка сообщений
  private showSnackService:ShowSnackService=inject(ShowSnackService);
  private cartService: CartService = inject(CartService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private paymentService: PaymentService = inject(PaymentService);
  private router:Router=inject(Router);

  private subscriptions$: Subscription = new Subscription();

  protected cart:CartType|null=null;
  protected deliveryTypes:DeliveryTypeType[]=[];
  protected paymentTypes:PaymentTypeType[]=[];
  protected activeDeliveryType:DeliveryTypeType|null=null;
  protected finalAmount:number=0;//Конечная стоимость заказа. Заполняется в deliveryAndTotalAmountCalculate
  protected lowDeliveryPrice:boolean=false;//Если активна, то цена доставки снижена согласно условия


  private deliveryAndTotalAmountCalculate(){
    if (!this.activeDeliveryType || !this.cart) return;
    let finalAmount:number=this.cart.amount;
    this.lowDeliveryPrice=false;
    if (this.activeDeliveryType.delivery_price>0){
      if (this.activeDeliveryType.lPMinPrice>0 && this.activeDeliveryType.lPMinPrice<this.cart.amount){
        finalAmount+=this.activeDeliveryType.low_price;
        this.lowDeliveryPrice = true;
      }else{
        //Добавляем к стоимости товара, стоимость доставки
        finalAmount+=this.activeDeliveryType.delivery_price;
      }
    }
    this.finalAmount=finalAmount;
  }//Рассчет стоимости доставки и финальной суммы заказа

  changeDeliveryType(deliveryType:DeliveryTypeType){
    if ((this.activeDeliveryType && this.activeDeliveryType.id === deliveryType.id) || deliveryType.disabled) return;
    this.activeDeliveryType = deliveryType;
    this.deliveryAndTotalAmountCalculate();
  }

  ngOnInit() {
    const getDeliveryTypes$:Observable<DeliveryTypesResponseType> = this.deliveryService.getDeliveryTypes()
      .pipe(catchError((err: HttpErrorResponse) => of({ __error: true, err } as any)));
    const getPaymentTypes$:Observable<PaymentTypesResponseType> = this.paymentService.getPaymentTypes()
      .pipe(catchError((err: HttpErrorResponse) => of({ __error: true, err } as any)));
    const getCart$:Observable<CartResponseType> = this.cartService.getCart(true)
      .pipe(catchError((err: HttpErrorResponse) => of({ __error: true, err } as any)));

    const combinedRequests$:Observable<[DeliveryTypesResponseType|any,PaymentTypesResponseType|any,CartResponseType|any]>=combineLatest([getDeliveryTypes$,getPaymentTypes$,getCart$]);

    this.subscriptions$.add(
      combinedRequests$.subscribe({
        next:([deliveryTypesResponse,paymentTypesResponse,cartResponse]:[DeliveryTypesResponseType|any,PaymentTypesResponseType|any,CartResponseType|any])=>{
          //Обработка ошибок
          if (deliveryTypesResponse.__error){
            const httpDeliveryErr: HttpErrorResponse = deliveryTypesResponse.err;
            this.showSnackService.error(this.deliveryService.getDeliveryError);
            console.error(httpDeliveryErr.error.message ? httpDeliveryErr.error.message : `Unexpected error (getDeliveryTypes)! Code:${httpDeliveryErr.status}`);
            this.router.navigate(['/cart']);
            return;
          }//код не 200
          if (paymentTypesResponse.__error){
            const httpPaymentErr: HttpErrorResponse = paymentTypesResponse.err;
            this.showSnackService.error(this.deliveryService.getDeliveryError);
            console.error(httpPaymentErr.error.message ? httpPaymentErr.error.message : `Unexpected error (getPaymentTypes)! Code:${httpPaymentErr.status}`);
            this.router.navigate(['/cart']);
            return;
          }//код не 200
          if (cartResponse.__error){
            const httpCartError: HttpErrorResponse = cartResponse.err;
            if (httpCartError.status !==401 && httpCartError.status !== 403) this.showSnackService.error(httpCartError.error.message,ReqErrorTypes.cartGetCart);
            console.error(httpCartError.error.message ? httpCartError.error.message : `Unexpected error (getCart)! Code:${httpCartError.status}`);
            this.router.navigate(['/']);
            return;
          }//код не 200
          //обработка ответов
          const deliveryTypesResp: DeliveryTypesResponseType = deliveryTypesResponse as DeliveryTypesResponseType;
          const paymentTypesResp: PaymentTypesResponseType = paymentTypesResponse as PaymentTypesResponseType;
          const cartResp:CartResponseType=cartResponse as CartResponseType;
          if (deliveryTypesResp.error || !deliveryTypesResp.deliveryTypes || deliveryTypesResp.deliveryTypes.length===0){
            this.showSnackService.error(this.deliveryService.getDeliveryError);
            console.log(deliveryTypesResp.message?deliveryTypesResp.message:`Unexpected error (getDeliveryTypes)!`);
            this.router.navigate(['/cart']);
            return;
          }
          this.deliveryTypes=deliveryTypesResp.deliveryTypes;
          if (paymentTypesResp.error || !paymentTypesResp.paymentTypes || paymentTypesResp.paymentTypes.length===0){
            this.showSnackService.error(this.paymentService.getPaymentError);
            console.log(paymentTypesResp.message?paymentTypesResp.message:`Unexpected error (getPaymentTypes)!`);
            this.router.navigate(['/cart']);
            return;
          }
          this.paymentTypes = paymentTypesResp.paymentTypes;
          for (let i = 0; i < this.deliveryTypes.length; i++) {
            if (!this.deliveryTypes[i].disabled){
              this.activeDeliveryType = this.deliveryTypes[i];
              i=this.deliveryTypes.length;
            }
          }//Установка активного deliveryType
          if (!this.activeDeliveryType) {
            this.showSnackService.error(this.deliveryService.notAvailableError);
            console.error(this.deliveryService.notAvailableError);
            this.router.navigate(['/cart']);
            return;
          }//Если нет активных методов доставки
          //Может быть error с нормальным ответом при проблемах с товарами
          if (cartResp.error || !cartResp.cart) {
            this.showSnackService.error(this.cartService.getCartError);
            this.router.navigate(['/']);
            throw new Error(cartResp.message);
          }
          if (cartResp.messages && cartResp.messages.length>0) this.router.navigate(['/cart']);//Условие при котором есть сообщения об ошибках в корзине и она не пуста.
          if (cartResp.cart && cartResp.cart.count === 0) {
            this.showSnackService.infoObj(this.cartService.cartEmptyError);
            this.router.navigate(['/catalog']);//Условие при котором корзина пустая и необходим редирект на каталог
            return;
          }
          this.cart = cartResp.cart;

          this.deliveryAndTotalAmountCalculate();

        },
        error:()=>{
          this.showSnackService.error("Unexpected Request Error!");
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
