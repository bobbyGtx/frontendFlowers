import {inject, Injectable} from '@angular/core';
import {DeliveryTypeType} from '../../../assets/types/delivery-type.type';
import {HttpClient} from '@angular/common/http';
import {distinctUntilChanged, Observable, of, Subscription, tap} from 'rxjs';
import {DeliveryTypesResponseType} from '../../../assets/types/responses/delivery-types-response.type';
import {environment} from '../../../environments/environment';
import {Config} from '../config';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {LanguageService} from '../../core/language.service';

/*
* Описание сервиса:
* Получает от сервера список типов доставок и помещает их в постоянный кэш
* */

export type userErrorsType = {
  getDeliveryTypes: { [key in AppLanguages]: string; },
  deliveryNotAvailable: { [key in AppLanguages]: string; },
}

@Injectable({providedIn: 'root'})
export class DeliveryService {
  private http: HttpClient = inject(HttpClient);
  private languageService: LanguageService = inject(LanguageService);
  private deliveryTypes: DeliveryTypeType[] | null = null;

  private changeLanguage:Subscription = this.languageService.currentLanguage$.pipe(
    distinctUntilChanged(),
    tap(()=>{
      this.clearCache();
    })
  ).subscribe();

  private userErrors:userErrorsType= {
    getDeliveryTypes:{
      [AppLanguages.ru]: 'Ошибка получения типов доставки. Обновите страницу',
      [AppLanguages.en]: 'Error retrieving delivery types. Please refresh the page.',
      [AppLanguages.de]: 'Fehler beim Abrufen der Versandarten. Bitte aktualisieren Sie die Seite.',
    },
    deliveryNotAvailable:{
      [AppLanguages.ru]: 'Передача товара невозможна! Попробуйте оформить заказ позже.',
      [AppLanguages.en]: 'Flowers transfer not possible! Please try placing your order later.',
      [AppLanguages.de]: 'Blumenlieferung ist nicht möglich! Bitte versuchen Sie es später.',
    }
  };

  private clearCache():void{
    this.deliveryTypes = null;
  }

  get getDeliveryError():string {
    return this.userErrors.getDeliveryTypes[this.languageService.appLang];
  }
  get notAvailableError():string {
    return this.userErrors.getDeliveryTypes[this.languageService.appLang];
  }

  getDeliveryTypes(): Observable<DeliveryTypesResponseType> {
    if (this.deliveryTypes) return of({
        error: false,
        message: Config.confirmMsgFromServer,
        deliveryTypes: this.deliveryTypes
      });
    return this.http.get<DeliveryTypesResponseType>(environment.api + 'deliverytypes.php')
      .pipe(
        tap((data: DeliveryTypesResponseType) => {
          if (data.error || !data.deliveryTypes || data.deliveryTypes.length<1) return;
          this.deliveryTypes = data.deliveryTypes;
        })
      );
  }
}
