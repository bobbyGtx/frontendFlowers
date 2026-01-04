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
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {Config} from '../../../shared/config';
import {OrderService} from '../../../shared/services/order.service';
import {OrderParamsType} from '../../../../assets/types/order-params.type';
import {OrderResponseType} from '../../../../assets/types/responses/order-response.type';
import {UserService} from '../../../shared/services/user.service';
import {AuthService} from '../../../core/auth/auth.service';
import {UserDataResponseType} from '../../../../assets/types/responses/user-data-response.type';
import {UserDataType} from '../../../../assets/types/user-data.type';
import {DlgWindowService} from '../../../shared/services/dlg-window.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy {

  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private cartService: CartService = inject(CartService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private paymentService: PaymentService = inject(PaymentService);
  private orderService: OrderService = inject(OrderService);
  private userService: UserService = inject(UserService);
  private authService: AuthService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private dlgWindowService: DlgWindowService=inject(DlgWindowService);

  private subscriptions$: Subscription = new Subscription();

  protected cart: CartType | null = null;
  protected deliveryTypes: DeliveryTypeType[] = [];
  protected paymentTypes: PaymentTypeType[] = [];
  protected activeDeliveryType: DeliveryTypeType | null = null;
  protected regionList: Array<string> = Config.regionList;
  protected finalAmount: number = 0;//Конечная стоимость заказа. Заполняется в deliveryAndTotalAmountCalculate
  protected lowDeliveryPrice: boolean = false;//Если активна, то цена доставки снижена согласно условия
  private userDataFromServer:UserDataType|null = null;

  private dialogContents={
      title:'Благодарим за заказ!',
      content:'<div class="additional-title">Ваш заказ оформлен.</div>'+
        '<div class="message-string">Вся информация о заказе была выслана вам на почту.</div>'+
        '<div class="message-string">Курьер свяжется с вами за два часа до доставки товара.</div>',
  }

  get firstName() {
    return this.orderForm.get('firstName');
  }

  get lastName() {
    return this.orderForm.get('lastName');
  }

  get phone() {
    return this.orderForm.get('phone');
  }

  get email() {
    return this.orderForm.get('email');
  }

  get zip() {
    return this.orderForm.get('zip');
  }

  get region() {
    return this.orderForm.get('region');
  }

  get city() {
    return this.orderForm.get('city');
  }

  get street() {
    return this.orderForm.get('street');
  }

  get house() {
    return this.orderForm.get('house');
  }

  get paymentType() {
    return this.orderForm.get('paymentType');
  }

  get comment() {
    return this.orderForm.get('comment');
  }

  protected orderForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    lastName: ['', [Validators.required, Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{11,14}$/iu)]],//+14155552671, +497116666777
    email: [{value:'', disabled:false}, [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    region: [''],//Валидация всех полей адреса зависит от выбранного DeliveryType, flag:addressNeed
    zip: [''],
    city: [''],
    street: [''],
    house: [''],
    paymentType: [1],
    comment: ['', Validators.maxLength(500)]
  });

  private deliveryAndTotalAmountCalculate() {
    if (!this.activeDeliveryType || !this.cart) return;
    let finalAmount: number = this.cart.amount;
    this.lowDeliveryPrice = false;
    if (this.activeDeliveryType.delivery_price > 0) {
      if (this.activeDeliveryType.lPMinPrice > 0 && this.activeDeliveryType.lPMinPrice < this.cart.amount) {
        finalAmount += this.activeDeliveryType.low_price;
        this.lowDeliveryPrice = true;
      } else {
        //Добавляем к стоимости товара, стоимость доставки
        finalAmount += this.activeDeliveryType.delivery_price;
      }
    }
    this.finalAmount = finalAmount;
  }//Рассчет стоимости доставки и финальной суммы заказа

  protected changeDeliveryType(deliveryType: DeliveryTypeType) {
    if ((this.activeDeliveryType && this.activeDeliveryType.id === deliveryType.id) || deliveryType.disabled) return;
    this.activeDeliveryType = deliveryType;
    this.updateDeliveryTypeValidation();
  }

  private updateDeliveryTypeValidation() {
    if (!this.activeDeliveryType) return;
    if (this.activeDeliveryType.addressNeed) {
      //Активируем валидацию на поля адреса
      this.region?.setValidators(Validators.required);
      this.zip?.setValidators([Validators.required, Validators.pattern(/^[0-9]{5}$/)]);//Validators.pattern(/^[0-9]{5}$/)
      this.city?.setValidators(Validators.required);
      this.street?.setValidators(Validators.required);
      this.house?.setValidators([Validators.required,Validators.pattern(/^\d{1,3}[A-Za-z]?$/)]);

      if (this.userDataFromServer){
        if (this.userDataFromServer.region) this.region?.setValue(this.userDataFromServer.region);
        if (this.userDataFromServer.zip) this.zip?.setValue(this.userDataFromServer.zip);
        if (this.userDataFromServer.city) this.city?.setValue(this.userDataFromServer.city);
        if (this.userDataFromServer.street) this.street?.setValue(this.userDataFromServer.street);
        if (this.userDataFromServer.house) this.house?.setValue(this.userDataFromServer.house);
      }

      this.region?.markAsUntouched();this.region?.markAsPristine();
      this.zip?.markAsUntouched();this.zip?.markAsPristine();
      this.city?.markAsUntouched();this.city?.markAsPristine();
      this.street?.markAsUntouched();this.street?.markAsPristine();
      this.house?.markAsUntouched();this.house?.markAsPristine();
    } else {
      this.region?.removeValidators(Validators.required);
      this.zip?.removeValidators([Validators.required, Validators.pattern(/^[0-9]{5}$/)]);
      this.city?.removeValidators(Validators.required);
      this.street?.removeValidators(Validators.required);
      this.house?.removeValidators(Validators.required);
      this.orderForm.patchValue({
        region: '',
        zip: '',
        city: '',
        street: '',
        house: '',
      });
    }
    this.region?.updateValueAndValidity();
    this.zip?.updateValueAndValidity();
    this.city?.updateValueAndValidity();
    this.street?.updateValueAndValidity();
    this.house?.updateValueAndValidity();
    this.deliveryAndTotalAmountCalculate();
  }

  protected createOrder() {
    //Сделать заказ без регистрации
    if (this.orderForm.valid && this.activeDeliveryType && this.orderForm.value.paymentType && this.orderForm.value.firstName && this.orderForm.value.lastName && this.orderForm.value.phone && this.email?.value) {
      const paramsObject:OrderParamsType={
        deliveryType: this.activeDeliveryType.id,
        paymentType:this.orderForm.value.paymentType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        email: this.email.value,
      };//Сформировали обязательные поля
      if (this.orderForm.value.region) paramsObject.region = this.orderForm.value.region;
      if (this.orderForm.value.zip) paramsObject.zip = this.orderForm.value.zip;
      if (this.orderForm.value.city) paramsObject.city = this.orderForm.value.city;
      if (this.orderForm.value.street) paramsObject.street = this.orderForm.value.street;
      if (this.orderForm.value.house) paramsObject.house = this.orderForm.value.house;
      if (this.orderForm.value.comment) paramsObject.comment = this.orderForm.value.comment;
      this.subscriptions$.add(this.orderService.createOrder(paramsObject).subscribe({
        next: (data: OrderResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.orderService.createOrderError);
            this.router.navigate(['/cart']);
            throw new Error(data.message);
          }
          this.cartService.resetCartCache();
          this.dlgWindowService.openDialog(this.dialogContents.title,this.dialogContents.content,'/');
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.errorObj(errorResponse.error, ReqErrorTypes.createOrder);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (getProducts)! Code:${errorResponse.status}`);
          if (errorResponse.status === 409) this.router.navigate(['/cart']);//ошибка товаров. редирект на корзину для проверки
        }
      }));
    }else{
      this.showSnackService.error('Заполните обязательные поля!');
      this.orderForm.markAllAsTouched();
    }
  }

  protected changeFirstLetter(control:AbstractControl<string | null, string | null> | null) {
    if (control && typeof control.value === 'string' ) {
      control.setValue(control.value.replace(/^\p{L}/u, c => c.toUpperCase()));
    }
  }

  private setDefaultPayment(){
    //Применение первого доступного метода оплаты и проверка наличия хоть одного доступного метода
    for (let i = 0; i < this.paymentTypes.length; i++) {
      if (!this.paymentTypes[i].disabled) {
        this.paymentType?.setValue(this.paymentTypes[i].id)
        i = this.paymentTypes.length;
      }
    }//Установка активного paymentType
    if (!this.orderForm.value.paymentType) {
      this.showSnackService.error(this.paymentService.notAvailableError);
      this.router.navigate(['/cart']);
      return;
    }//Проверка наличия хоть одного доступного метода
  }
  private setDefaultDelivery(){
    for (let i = 0; i < this.deliveryTypes.length; i++) {
      if (!this.deliveryTypes[i].disabled) {
        this.activeDeliveryType = this.deliveryTypes[i];
        i = this.deliveryTypes.length;
      }
    }//Установка активного deliveryType
    if (!this.activeDeliveryType) {
      this.showSnackService.error(this.deliveryService.notAvailableError);
      console.error(this.deliveryService.notAvailableError);
      this.router.navigate(['/cart']);
      return;
    }//Если нет активных методов доставки
  }

  ngOnInit() {
    const getDeliveryTypes$: Observable<DeliveryTypesResponseType> = this.deliveryService.getDeliveryTypes()
      .pipe(catchError((err: HttpErrorResponse) => of({__error: true, err} as any)));
    const getPaymentTypes$: Observable<PaymentTypesResponseType> = this.paymentService.getPaymentTypes()
      .pipe(catchError((err: HttpErrorResponse) => of({__error: true, err} as any)));
    const getCart$: Observable<CartResponseType> = this.cartService.getCart(true)
      .pipe(catchError((err: HttpErrorResponse) => of({__error: true, err} as any)));

    const combinedRequests$: Observable<[DeliveryTypesResponseType | any, PaymentTypesResponseType | any, CartResponseType | any]> = combineLatest([getDeliveryTypes$, getPaymentTypes$, getCart$]);

    this.subscriptions$.add(
      combinedRequests$.subscribe({
        next: ([deliveryTypesResponse, paymentTypesResponse, cartResponse]: [DeliveryTypesResponseType | any, PaymentTypesResponseType | any, CartResponseType | any]) => {
          //Обработка ошибок
          if (deliveryTypesResponse.__error) {
            const httpDeliveryErr: HttpErrorResponse = deliveryTypesResponse.err;
            this.showSnackService.error(this.deliveryService.getDeliveryError);
            console.error(httpDeliveryErr.error.message ? httpDeliveryErr.error.message : `Unexpected error (getDeliveryTypes)! Code:${httpDeliveryErr.status}`);
            this.router.navigate(['/cart']);
            return;
          }//код не 200
          if (paymentTypesResponse.__error) {
            const httpPaymentErr: HttpErrorResponse = paymentTypesResponse.err;
            this.showSnackService.error(this.paymentService.getPaymentError);
            console.error(httpPaymentErr.error.message ? httpPaymentErr.error.message : `Unexpected error (getPaymentTypes)! Code:${httpPaymentErr.status}`);
            this.router.navigate(['/cart']);
            return;
          }//код не 200
          if (cartResponse.__error) {
            const httpCartError: HttpErrorResponse = cartResponse.err;
            if (httpCartError.status !== 401 && httpCartError.status !== 403) this.showSnackService.error(httpCartError.error.message, ReqErrorTypes.cartGetCart);
            console.error(httpCartError.error.message ? httpCartError.error.message : `Unexpected error (getCart)! Code:${httpCartError.status}`);
            this.router.navigate(['/']);
            return;
          }//код не 200
          //обработка ответов
          const deliveryTypesResp: DeliveryTypesResponseType = deliveryTypesResponse as DeliveryTypesResponseType;
          const paymentTypesResp: PaymentTypesResponseType = paymentTypesResponse as PaymentTypesResponseType;
          const cartResp: CartResponseType = cartResponse as CartResponseType;
          if (deliveryTypesResp.error || !deliveryTypesResp.deliveryTypes || deliveryTypesResp.deliveryTypes.length === 0) {
            this.showSnackService.error(this.deliveryService.getDeliveryError);
            console.log(deliveryTypesResp.message ? deliveryTypesResp.message : `Unexpected error (getDeliveryTypes)!`);
            this.router.navigate(['/cart']);
            return;
          }
          this.deliveryTypes = deliveryTypesResp.deliveryTypes;
          if (paymentTypesResp.error || !paymentTypesResp.paymentTypes || paymentTypesResp.paymentTypes.length === 0) {
            this.showSnackService.error(this.paymentService.getPaymentError);
            console.log(paymentTypesResp.message ? paymentTypesResp.message : `Unexpected error (getPaymentTypes)!`);
            this.router.navigate(['/cart']);
            return;
          }
          this.paymentTypes = paymentTypesResp.paymentTypes;


          //Может быть error с нормальным ответом при проблемах с товарами
          if (cartResp.error || !cartResp.cart) {
            this.showSnackService.error(this.cartService.getCartError);
            this.router.navigate(['/']);
            throw new Error(cartResp.message);
          }
          if (cartResp.messages && cartResp.messages.length > 0) this.router.navigate(['/cart']);//Условие при котором есть сообщения об ошибках в корзине и она не пуста.
          if (cartResp.cart && cartResp.cart.count === 0) {
            this.showSnackService.infoObj(this.cartService.cartEmptyError);
            this.router.navigate(['/catalog']);//Условие при котором корзина пустая и необходим редирект на каталог
            return;
          }
          this.cart = cartResp.cart;

          if (this.authService.getIsLoggedIn()){
            this.subscriptions$.add(
              this.userService.getUserData().subscribe({
                next: (data:UserDataResponseType) => {
                  if (data.error || !data.userData || !data.user){
                    this.showSnackService.error(this.userService.getUserDataError);
                    throw new Error(data.message);
                  }
                  this.userDataFromServer=data.userData;
                  if (data.userData.deliveryType_id){
                    const deliveryTypeIndex:number = this.deliveryTypes.findIndex((deliveryItem:DeliveryTypeType)=>deliveryItem.id===data.userData?.deliveryType_id);
                    if (deliveryTypeIndex>-1 && !this.deliveryTypes[deliveryTypeIndex].disabled) {
                      this.changeDeliveryType(this.deliveryTypes[deliveryTypeIndex]);
                    }else {
                      this.setDefaultDelivery();
                      this.showSnackService.infoObj('Saved delivery type unavailable');
                    }
                  }else this.setDefaultDelivery();

                  if (data.userData.paymentType_id) {
                    const paymentTypeIndex:number = this.paymentTypes.findIndex((paymentItem:PaymentTypeType)=>paymentItem.id === data.userData!.paymentType_id);
                    if (paymentTypeIndex>-1 && !this.paymentTypes[paymentTypeIndex].disabled) {
                      this.paymentType?.setValue(this.paymentTypes[paymentTypeIndex].id);
                    }else{
                      this.setDefaultPayment();
                      this.showSnackService.infoObj('Saved payment type unavailable');
                    }
                  }else this.setDefaultPayment();

                  const paramsToUpdate = {
                    email:data.userData.email,
                    firstName: data.userData.firstName,
                    lastName: data.userData.lastName,
                    phone:data.userData.phone,
                    region:data.userData.region,
                    zip:data.userData.zip,
                    city:data.userData.city,
                    street:data.userData.street,
                    house:data.userData.house,
                  }
                  this.orderForm.patchValue(paramsToUpdate);
                  this.email?.disable();
                },
                error: (errorResponse:HttpErrorResponse) => {
                  this.showSnackService.error(this.userService.getUserDataError);
                  console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (getUserData)! Code:${errorResponse.status}`);
                },
              })
            );//Подписка на данные из профиля пользователя, если он залогинен
          }else{
            this.setDefaultPayment();
            this.setDefaultDelivery();
          }

          this.deliveryAndTotalAmountCalculate();

        },
        error: () => {
          this.showSnackService.error("Unexpected Request Error!");
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
