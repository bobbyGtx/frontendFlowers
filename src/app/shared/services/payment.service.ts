import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LanguageService} from '../../core/language.service';
import {distinctUntilChanged, Observable, of, Subscription, tap} from 'rxjs';
import {PaymentTypesResponseType} from '../../../assets/types/responses/payment-types-response.type';
import {PaymentTypeType} from '../../../assets/types/payment-type.type';
import {Config} from '../config';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';

/*
* Описание сервиса:
* Получает от сервера список методов оплат и помещает их в постоянный кэш
* */

export type userErrorsType = {
  getPaymentTypes: { [key in AppLanguages]: string; },
  paymentNotAvailable: { [key in AppLanguages]: string; },
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http: HttpClient = inject(HttpClient);
  private languageService: LanguageService = inject(LanguageService);
  private paymentTypes:PaymentTypeType[]|null=null;
  private changeLanguage:Subscription = this.languageService.currentLanguage$.pipe(
    distinctUntilChanged(),
    tap(()=>{
      this.clearCache();
    })
  ).subscribe();

  private userErrors:userErrorsType= {
    getPaymentTypes:{
      [AppLanguages.ru]: 'Ошибка получения методов оплаты. Обновите страницу',
      [AppLanguages.en]: 'Error receiving payment methods. Please refresh the page.',
      [AppLanguages.de]: 'Fehler beim Empfang von Zahlungsmethoden. Bitte aktualisieren Sie die Seite.',
    },
    paymentNotAvailable:{
      [AppLanguages.ru]: 'В данный момент оплата невозможна! Попробуйте оформить заказ позже.',
      [AppLanguages.en]: 'Payment is currently unavailable.! Please try placing your order later.',
      [AppLanguages.de]: 'Die Zahlung ist momentan nicht möglich.! Bitte versuchen Sie es später.',
    }
  };

  get getPaymentError():string {
    return this.userErrors.getPaymentTypes[this.languageService.appLang];
  }
  get notAvailableError():string {
    return this.userErrors.paymentNotAvailable[this.languageService.appLang];
  }

  private clearCache():void{
    this.paymentTypes=null;
  }

  getPaymentTypes():Observable<PaymentTypesResponseType>{
    if (this.paymentTypes && this.paymentTypes.length > 0) return of({
      error:false,
      message:Config.confirmMsgFromServer,
      paymentTypes:this.paymentTypes
    });
  return this.http.get<PaymentTypesResponseType>(environment.api + 'paymenttypes.php')
    .pipe(
      tap((data: PaymentTypesResponseType) => {
        if (data.error || !data.paymentTypes || data.paymentTypes.length<1) return;
        this.paymentTypes=data.paymentTypes;
      })
    )
  }
}
