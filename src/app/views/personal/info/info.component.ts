import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {DeliveryTypeType} from '../../../../assets/types/delivery-type.type';
import {PaymentTypeType} from '../../../../assets/types/payment-type.type';
import {Config} from '../../../shared/config';
import {DeliveryService} from '../../../shared/services/delivery.service';
import {PaymentService} from '../../../shared/services/payment.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {catchError, combineLatest, Observable, of, Subscription, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {DeliveryTypesResponseType} from '../../../../assets/types/responses/delivery-types-response.type';
import {PaymentTypesResponseType} from '../../../../assets/types/responses/payment-types-response.type';
import {UserService} from '../../../shared/services/user.service';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {newPasswordsMatchValidator} from '../../../shared/validators/new-passwords-match.validator';
import {ExtErrorResponseType} from '../../../../assets/types/responses/ext-error-response';
import {ErrorSources} from '../../../../assets/enums/error-sources.enum';
import {UserDataResponseType} from '../../../../assets/types/responses/user-data-response.type';
import {DeliveryInfoType, UserDataType, UserPatchDataType} from '../../../../assets/types/user-data.type';
import {emailExistsValidator} from '../../../shared/validators/email-exists.validator';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {LanguageService} from '../../../core/language.service';
import {InfoTranslationType} from '../../../../assets/types/translations/info-translation.type';
import {infoTranslations} from './info.translations';
import {UserRequestService} from '../../../core/user-request.service';
import {UserActionsResponseType} from '../../../../assets/types/responses/user-actions-response.type';
import {ConverterUtils} from '../../../shared/utils/converter.utils';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private userService: UserService = inject(UserService);
  private userRequestService: UserRequestService = inject(UserRequestService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private paymentService: PaymentService = inject(PaymentService);
  private fb: FormBuilder = inject(FormBuilder);
  private languageService:LanguageService=inject(LanguageService);

  private subscriptions$: Subscription = new Subscription();
  protected appLanguage:AppLanguages;
  protected translations:InfoTranslationType;

  protected deliveryTypes: DeliveryTypeType[] = [];
  protected paymentTypes: PaymentTypeType[] = [];
  protected regionList: Array<string> = Config.regionList;
  protected oldPassChecked: boolean = false;
  protected oldPassFalse: boolean = false;//переменная для окрашивания рамки, если пароль не верен

  protected userData:UserDataType|null=null;
  private stockUserDeliveryInfo: DeliveryInfoType|null=null;//переменная для быстрого сравнения.

  protected emailVerifyNotification:boolean=false;
  protected emailTimer:string|null=null;

  constructor() {
    this.appLanguage = this.languageService.appLang;
    this.translations = infoTranslations[this.appLanguage];
  }

  get firstName() {return this.infoForm.get('firstName');}

  get lastName() {return this.infoForm.get('lastName');}

  get phone() {return this.infoForm.get('phone');}

  get email() {return this.infoForm.get('email');}

  get newPassword() {return this.infoForm.get('newPassword');}

  get newPasswordRepeat() {return this.infoForm.get('newPasswordRepeat');}

  get oldPassword() {return this.infoForm.get('oldPassword');}

  get region() {return this.infoForm.get('region');}

  get zip() {return this.infoForm.get('zip');}

  get city() {return this.infoForm.get('city');}

  get street() {return this.infoForm.get('street');}

  get house() {return this.infoForm.get('house');}

  get deliveryTypeField() {return this.infoForm.get('deliveryType_id');}

  infoForm = this.fb.group({
    firstName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    lastName: ['', [Validators.pattern(/^(?=.{2,50}$)([A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*(?:\s[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+(?:-[A-ZА-ЯЁÄÖÜ][a-zа-яёßäöü]+)*)*)$/u)]],
    phone: ['', [Validators.pattern(/^\+[1-9]\d{11,14}$/iu)]],//+14155552671, +497116666777
    email: this.fb.control(
      { value: '', disabled: true },
      {
        validators: [
          Validators.required,
          Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)
        ],
        asyncValidators: [
          emailExistsValidator(() => this.userData?.email)//для передачи актуального значения
        ],
        updateOn: 'change'
      }
    ),
    oldPassword: [{value: '', disabled: false}, Validators.pattern(/^$|^.{6,}$/)],
    newPassword: [{value: '', disabled: true}, Validators.pattern(/^$|^.{6,}$/)],
    newPasswordRepeat: [{value: '', disabled: true}, Validators.pattern(/^$|^.{6,}$/)],
    deliveryType_id: [0],
    region: [''],//Валидация всех полей адреса зависит от выбранного DeliveryType, flag:addressNeed
    zip: ['', Validators.pattern(/^$|^[0-9]{5}$/)],
    city: [''],
    street: [''],
    house: ['', Validators.pattern(/^$|^\d{1,3}[A-Za-z]?$/)],
    paymentType_id: [0],
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

  protected changeDeliveryType(deliveryType: DeliveryTypeType) {
    if (this.deliveryTypeField?.value === deliveryType.id){
      this.deliveryTypeField?.setValue(0);
      this.infoForm.markAsDirty();
      return;
    }
    this.deliveryTypeField?.setValue(deliveryType.id);
    this.infoForm.markAsDirty();
  }

  protected changeFirstLetter(control: AbstractControl<string | null, string | null> | null) {
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.replace(/^\p{L}/u, c => c.toUpperCase()));
    }
  }

  protected updateUserInfo() {
    if (!this.userData || this.infoForm.invalid || (this.infoForm.untouched && !this.infoForm.dirty)) return;
    let userPatchData:UserPatchDataType = {};
    if (this.firstName && this.firstName.value !== this.userData.firstName) userPatchData.firstName = this.firstName.value;
    if (this.lastName && this.lastName.value !== this.userData.lastName) userPatchData.lastName = this.lastName.value;
    if (this.phone && this.phone.value !== this.userData.phone) userPatchData.phone = this.phone.value;
    if (this.infoForm.value.deliveryType_id !== this.userData.deliveryType_id) userPatchData.deliveryType_id = this.infoForm.value.deliveryType_id;
    if (this.infoForm.value.paymentType_id !== this.userData.paymentType_id) userPatchData.paymentType_id = this.infoForm.value.paymentType_id;
    //формирование адреса доставки "deliveryInfo"
    if (this.region?.value || this.zip?.value || this.city?.value || this.street?.value || this.house?.value){
      let deliveryInfo:DeliveryInfoType = {};
      if (this.region?.value && this.region?.value !=='-') deliveryInfo.region=this.region?.value;
      if (this.zip?.value) deliveryInfo.zip=this.zip?.value;
      if (this.city?.value) deliveryInfo.city=this.city?.value;
      if (this.street?.value) deliveryInfo.street=this.street?.value;
      if (this.house?.value) deliveryInfo.house=this.house?.value;

      if (this.stockUserDeliveryInfo && Object.keys(this.stockUserDeliveryInfo).length === Object.keys(deliveryInfo).length) {
        for (let objKey in deliveryInfo) {
          if (this.stockUserDeliveryInfo.hasOwnProperty(objKey) && this.stockUserDeliveryInfo[objKey as keyof DeliveryInfoType] !== deliveryInfo[objKey as keyof DeliveryInfoType]) {
            userPatchData.deliveryInfo = deliveryInfo;
          }
        }
      }else userPatchData.deliveryInfo = deliveryInfo;

    }else{
      if(this.userData.region || this.userData.zip || this.userData.city || this.userData.street || this.userData.house) userPatchData.deliveryInfo=null;
    }
    if (this.oldPassChecked){
      if (this.email && this.email.value && this.userData.email !== this.email.value ) userPatchData.email = this.email.value;
      if (this.newPassword && this.newPasswordRepeat && this.oldPassword){
        if (this.newPassword.value && this.newPassword.value === this.newPasswordRepeat.value && this.oldPassword.value){
          userPatchData.newPassword = this.newPassword.value;
          userPatchData.newPasswordRepeat = this.newPassword.value;
        }
      }
      if (this.oldPassword?.value && (userPatchData.email || userPatchData.newPassword)) userPatchData.oldPassword = this.oldPassword.value;
    }
    if (Object.keys(userPatchData).length > 0){
      this.subscriptions$.add(
        this.userService.updateUserData(userPatchData).subscribe({
          next: (response:UserDataResponseType) => {
            if (response.error){
              this.showSnackService.error(this.userService.postUserDataError);
              throw new Error(response.message);
            }
            if (response.userData && response.user){
              this.userData = response.userData;
              if (response.user.deliveryInfo) this.stockUserDeliveryInfo = response.user.deliveryInfo;
              this.showSnackService.success(response.message);
              this.resetForm();
              this.infoForm.patchValue(this.userData);

            }
          },
          error: (errorResponse:HttpErrorResponse) => {
            this.showSnackService.errorObj(errorResponse.error,ReqErrorTypes.editUserData);
            console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (updateUserData)! Code:${errorResponse.status}`);
          }
          }));
    }
  }

  private resetForm():void{
    this.email?.disable();
    this.oldPassword?.setValue('');
    this.oldPassword?.enable();
    this.newPassword?.setValue('');
    this.newPassword?.disable();
    this.newPasswordRepeat?.setValue('');
    this.newPasswordRepeat?.disable();
    this.oldPassChecked=false;
    this.oldPassFalse=false;
    this.infoForm.markAsUntouched();
    this.infoForm.markAsPristine();
  }

  private doRequests(changeLanguage:boolean=true):void{
    const getDeliveryTypes$: Observable<DeliveryTypesResponseType | HttpErrorResponse> = this.deliveryService.getDeliveryTypes().pipe(
      catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const getPaymentTypes$: Observable<PaymentTypesResponseType | HttpErrorResponse> = this.paymentService.getPaymentTypes().pipe(
      catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => of(error)));//Ошибка не ломает combineLatest и перенаправляет ошибочный ответ в next

    const getUserData$:Observable<UserDataResponseType|null> = changeLanguage?of(null):this.userService.getUserData().pipe(
      catchError((error:HttpErrorResponse):Observable<ExtErrorResponseType> => {
        return throwError(():ExtErrorResponseType=>{
          return {
            __source:ErrorSources.UserData,
            ...error
          } as ExtErrorResponseType;
        });
      }));//обязательный запрос, без которого летим в error при подписке

    const combinedRequest$: Observable<[DeliveryTypesResponseType | HttpErrorResponse, PaymentTypesResponseType | HttpErrorResponse,UserDataResponseType|null]> =
      combineLatest([getDeliveryTypes$, getPaymentTypes$, getUserData$]);

    this.subscriptions$.add(combinedRequest$.subscribe({
      next: ([deliveryTypesResp, paymentTypesResp, userDataResp]: [DeliveryTypesResponseType | HttpErrorResponse, PaymentTypesResponseType | HttpErrorResponse, UserDataResponseType|null]) => {
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
        if (userDataResp){
          if (userDataResp.error || !userDataResp.user || !userDataResp.userData) {
            this.showSnackService.error(this.userService.getUserDataError);
            throw new Error(userDataResp.message);
          }
          this.userData = userDataResp.userData;
          if (userDataResp.user.deliveryInfo) this.stockUserDeliveryInfo = userDataResp.user.deliveryInfo;
          this.infoForm.patchValue(this.userData);
          if (!Config.verificationEmailClosed) this.emailVerifyNotification=!this.userData.emailVerification;

        }
      },
      error: (extError: ExtErrorResponseType) => {
        this.showSnackService.error(this.userService.getUserDataError);
        console.error(extError.error.message ? extError.error.message : `Unexpected error (getUserData)! Code:${extError.status}`);
      }
    }));
  }

  protected sendVerificationEmail():void{
    if (!this.userData) return;
    this.emailTimer = '';

    this.subscriptions$.add(
      this.userRequestService.verifyEmailCooldown$.subscribe((timer:string|null)=>{
        this.emailTimer = timer ? `(${timer})` : null;
      }));//Подписка на таймер спама

    this.subscriptions$.add(
      this.userRequestService.sendVerificationEmail(this.userData.email).subscribe({
        next:(data:UserActionsResponseType)=>{
          if (data.error){
            this.showSnackService.error(this.userRequestService.sendVerificationEmailError);
            throw new Error(data.timer? `${data.message}, ${data.timer}`:data.message);
          }
          this.closeVerifyNotification();
          this.showSnackService.success(data.message);
          this.emailTimer = null;
        },
        error:(errorResponse:HttpErrorResponse)=>{
          this.emailTimer=null;
          if (errorResponse.status===409) {
              this.showSnackService.infoObj(errorResponse.error.message);
              this.closeVerifyNotification();
              return;
            }//обработка ответа, когда email уде активирован
          if (errorResponse.status === 400 || errorResponse.status === 403 || errorResponse.status === 406 || errorResponse.status === 429) {
            if (errorResponse.error.timer) this.emailTimer = '('+ConverterUtils.secondsToMinutes(errorResponse.error.timer)+')';
            this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.authLogin);
          }else {
            this.showSnackService.error(this.userRequestService.sendVerificationEmailError);
          }
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected error (reset password)! Code:${errorResponse.status}`);
        }
      }));
  }

  protected closeVerifyNotification(){
    this.emailTimer = null;
    this.emailVerifyNotification=false;
    Config.verificationEmailClosed=true;
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages) => {
      if (this.appLanguage !== language) {
        this.appLanguage = language;
        this.translations = infoTranslations[language];
        this.doRequests(true);
      }else{
        //первая загрузка
        this.appLanguage = language;
        this.translations = infoTranslations[language];
        this.doRequests(false);
      }
    }));
    this.subscriptions$.add(
      this.email?.statusChanges.subscribe(status => {
        const ctrl = this.email;
        if (status === 'INVALID' && ctrl?.touched && ctrl?.hasError('emailProblem')) {
          queueMicrotask(() => {
            if (this.userData) ctrl.setValue(this.userData.email, { emitEvent: false });
          });
        }
    })
    );//Подписка на изменение статуса контрола email. В случае невалидности поля по асинхронному валидатору, откат.
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
