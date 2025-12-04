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
import {UserService} from '../../../shared/services/user.service';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {newPasswordsMatchValidator} from '../../../shared/validators/new-passwords-match.validator';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private userService: UserService = inject(UserService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private paymentService: PaymentService = inject(PaymentService);
  private fb: FormBuilder = inject(FormBuilder);

  private subscriptions$: Subscription = new Subscription();

  protected deliveryTypes: DeliveryTypeType[] = [];
  protected paymentTypes: PaymentTypeType[] = [];
  protected regionList: Array<string> = Config.regionList;
  protected oldPassChecked: boolean = false;
  protected oldPassFalse: boolean = false;//переменная для окрашивания рамки, если пароль не верен

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

  get newPassword() {
    return this.infoForm.get('newPassword');
  }

  get newPasswordRepeat() {
    return this.infoForm.get('newPasswordRepeat');
  }

  get oldPassword() {
    return this.infoForm.get('oldPassword');
  }

  get region() {
    return this.infoForm.get('region');
  }

  get zip() {
    return this.infoForm.get('zip');
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

  get deliveryTypeField() {
    return this.infoForm.get('deliveryType');
  }

  infoForm = this.fb.group({
    firstName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    lastName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    phone: ['', [Validators.pattern(/^\+[1-9]\d{11,14}$/iu)]],//+14155552671, +497116666777
    email: [{
      value: 'bobbygtx@gmail.com',
      disabled: true
    }, [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    oldPassword: [{value: '', disabled: false}, Validators.pattern(/^$|^.{6,}$/)],
    newPassword: [{value: '', disabled: true}, Validators.pattern(/^$|^.{6,}$/)],
    newPasswordRepeat: [{value: '', disabled: true}, Validators.pattern(/^$|^.{6,}$/)],
    deliveryType: [0],
    region: [''],//Валидация всех полей адреса зависит от выбранного DeliveryType, flag:addressNeed
    zip: ['', Validators.pattern(/^$|^[0-9]{5}$/)],
    city: [''],
    street: [''],
    house: ['', Validators.pattern(/^$|^\d{1,3}[A-Za-z]?$/)],
    paymentType: [0],
  });

  checkOldPassword(oldPasswordElement:HTMLInputElement) {
    if (this.oldPassword?.invalid || !this.oldPassword?.value || this.oldPassChecked) return;
    this.subscriptions$.add(
      this.userService.checkPassword(this.oldPassword.value).subscribe({
          next: (response: DefaultResponseType) => {
            if (!response.error) {
              this.oldPassChecked = true;
              this.oldPassword?.disable();
              this.email?.enable();
              this.newPassword?.enable();
              this.newPasswordRepeat?.enable();
              this.oldPassFalse = false;
              this.infoForm.setValidators(newPasswordsMatchValidator);
              this.infoForm.updateValueAndValidity();
              this.showSnackService.success('old password is correct');
            }else{
              this.showSnackService.error(this.userService.checkPasswordError);
              this.oldPassFalse = true;
              oldPasswordElement.focus();
            }
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.oldPassFalse = true;
           if (errorResponse.status === 400) {
             this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.authLogin);
           }else this.showSnackService.error(this.userService.checkPasswordError);
            oldPasswordElement.focus();
          }
        }
      )
    );
  }

  oldPassKeyDwnFunc(event:KeyboardEvent,oldPasswordElement:HTMLInputElement){
    this.oldPassFalse = false;
    if (this.oldPassword?.valid && event.key === 'Enter') this.checkOldPassword(oldPasswordElement);
  }

  protected showHidePassword(event:MouseEvent) {
    const svg = event.currentTarget as HTMLElement;
    const wrapper = svg.parentElement;
    const input = wrapper?.querySelector('input') as HTMLInputElement;
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  protected changeDeliveryType(deliveryType: DeliveryTypeType) {
    this.deliveryTypeField?.setValue(deliveryType.id);
    this.infoForm.markAsDirty();
  }

  protected changeFirstLetter(control: AbstractControl<string | null, string | null> | null) {
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.replace(/^\p{L}/u, c => c.toUpperCase()));
    }
  }

  protected updateUserInfo() {

  }

  ngOnInit() {
    const getDeliveryTypes$: Observable<DeliveryTypesResponseType | HttpErrorResponse> = this.deliveryService.getDeliveryTypes().pipe(
      catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const getPaymentTypes$: Observable<PaymentTypesResponseType | HttpErrorResponse> = this.paymentService.getPaymentTypes().pipe(
      catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const combinedRequest$: Observable<[DeliveryTypesResponseType | HttpErrorResponse, PaymentTypesResponseType | HttpErrorResponse]> =
      combineLatest([getDeliveryTypes$, getPaymentTypes$]);

    this.subscriptions$.add(combinedRequest$.subscribe({
      next: ([deliveryTypesResp, paymentTypesResp]: [DeliveryTypesResponseType | HttpErrorResponse, PaymentTypesResponseType | HttpErrorResponse]) => {
        if ((deliveryTypesResp as HttpErrorResponse).hasOwnProperty('ok') && !(paymentTypesResp as HttpErrorResponse).ok) {
          console.error(deliveryTypesResp);
        } else {
          const deliveryTypesResponse: DeliveryTypesResponseType = deliveryTypesResp as DeliveryTypesResponseType;
          if (!deliveryTypesResponse.error && deliveryTypesResponse.deliveryTypes) {
            this.deliveryTypes = deliveryTypesResponse.deliveryTypes;
          }
        }
        if ((paymentTypesResp as HttpErrorResponse).hasOwnProperty('ok') && !(paymentTypesResp as HttpErrorResponse).ok) {
          console.error(paymentTypesResp);
        } else {
          const paymentTypesResponse = paymentTypesResp as PaymentTypesResponseType;
          if (!paymentTypesResponse.error && paymentTypesResponse.paymentTypes) {
            this.paymentTypes = paymentTypesResponse.paymentTypes;
          }
        }

      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
