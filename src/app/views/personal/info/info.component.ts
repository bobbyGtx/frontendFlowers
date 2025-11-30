import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {DeliveryTypeType} from '../../../../assets/types/delivery-type.type';
import {PaymentTypeType} from '../../../../assets/types/payment-type.type';
import {Config} from '../../../shared/config';
import {DeliveryService} from '../../../shared/services/delivery.service';
import {PaymentService} from '../../../shared/services/payment.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {catchError, combineLatest, Observable, of, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {DeliveryTypesResponseType} from '../../../../assets/types/responses/delivery-types-response.type';
import {PaymentTypesResponseType} from '../../../../assets/types/responses/payment-types-response.type';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit,OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private paymentService: PaymentService = inject(PaymentService);
  private fb: FormBuilder = inject(FormBuilder);

  private subscriptions$: Subscription = new Subscription();

  protected deliveryTypes: DeliveryTypeType[] = [];
  protected paymentTypes: PaymentTypeType[] = [];
  protected regionList: Array<string> = Config.regionList;
  protected activeDeliveryType: DeliveryTypeType | null = null;

  get firstName() {
    return this.infoForm.get('firstName');
  }

  get lastName() {
    return this.infoForm.get('lastName');
  }

  get phone() {
    return this.infoForm.get('phone');
  }

  get email() {
    return this.infoForm.get('email');
  }

  get zip() {
    return this.infoForm.get('zip');
  }

  get region() {
    return this.infoForm.get('region');
  }

  get city() {
    return this.infoForm.get('city');
  }

  get street() {
    return this.infoForm.get('street');
  }

  get house() {
    return this.infoForm.get('house');
  }

  protected infoForm = this.fb.group({
    firstName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    lastName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    phone: ['', [Validators.pattern(/^\+[1-9]\d{11,14}$/iu)]],//+14155552671, +497116666777
    email: ['', [Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    region: [''],//Валидация всех полей адреса зависит от выбранного DeliveryType, flag:addressNeed
    zip: [''],
    city: [''],
    street: [''],
    house: [''],
    paymentType: [0],
  });

  protected changeDeliveryType(deliveryType: DeliveryTypeType) {
    if ((this.activeDeliveryType && this.activeDeliveryType.id === deliveryType.id) || deliveryType.disabled) return;
    this.activeDeliveryType = deliveryType;
  }

  protected changeFirstLetter(control:AbstractControl<string | null, string | null> | null) {
    if (control && typeof control.value === 'string' ) {
      control.setValue(control.value.replace(/^\p{L}/u, c => c.toUpperCase()));
    }
  }

  ngOnInit() {
    const getDeliveryTypes$:Observable<DeliveryTypesResponseType|HttpErrorResponse> = this.deliveryService.getDeliveryTypes().pipe(
      catchError((error:HttpErrorResponse):Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const getPaymentTypes$:Observable<PaymentTypesResponseType|HttpErrorResponse> = this.paymentService.getPaymentTypes().pipe(
      catchError((error:HttpErrorResponse):Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const combinedRequest$: Observable<[DeliveryTypesResponseType|HttpErrorResponse,PaymentTypesResponseType|HttpErrorResponse]> =
      combineLatest([getDeliveryTypes$,getPaymentTypes$]);

    this.subscriptions$.add(combinedRequest$.subscribe({
      next: ([deliveryTypesResp,paymentTypesResp]:[DeliveryTypesResponseType|HttpErrorResponse,PaymentTypesResponseType|HttpErrorResponse]) => {
        if ((deliveryTypesResp as HttpErrorResponse).hasOwnProperty('ok') && !(paymentTypesResp as HttpErrorResponse).ok){
          console.error(deliveryTypesResp);
        }else{
          const deliveryTypesResponse:DeliveryTypesResponseType = deliveryTypesResp as DeliveryTypesResponseType;
          if (!deliveryTypesResponse.error && deliveryTypesResponse.deliveryTypes){
            this.deliveryTypes = deliveryTypesResponse.deliveryTypes;
            for (let i = 0; i < this.deliveryTypes.length; i++) {
              if (!this.deliveryTypes[i].disabled) {
                this.activeDeliveryType = this.deliveryTypes[i];
                i = this.deliveryTypes.length;
              }
            }//Установка активного deliveryType
          }
        }

        if ((paymentTypesResp as HttpErrorResponse).hasOwnProperty('ok') && !(paymentTypesResp as HttpErrorResponse).ok){
          console.error(paymentTypesResp);
        }else{
          const paymentTypesResponse = paymentTypesResp as PaymentTypesResponseType;
          if (!paymentTypesResponse.error && paymentTypesResponse.paymentTypes) {
            this.paymentTypes = paymentTypesResponse.paymentTypes;
            //Применение первого доступного метода оплаты и проверка наличия хоть одного доступного метода
            for (let i = 0; i < this.paymentTypes.length; i++) {
              if (i ===0)this.paymentTypes[i].disabled=true;
                if (!this.paymentTypes[i].disabled) {
                this.infoForm.patchValue({paymentType: this.paymentTypes[i].id});
                i = this.paymentTypes.length;
              }
            }//Установка активного paymentType
          }
        }

      }
    }));
  }

  ngOnDestroy() {this.subscriptions$.unsubscribe();}
}
