import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {OrderParamsType} from '../../../assets/types/order-params.type';
import {environment} from '../../../environments/environment';
import {OrderResponseType} from '../../../assets/types/responses/order-response.type';
import {map, Observable} from 'rxjs';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {LanguageService} from '../../core/language.service';
import {OrderType} from '../../../assets/types/order.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';
import {OrderProductType} from '../../../assets/types/order-product.type';
import {OrdersResponseType} from '../../../assets/types/responses/orders-response.type';

export type userErrorsType = {
  getOrders: { [key in AppLanguages]: string; },
  createOrder: { [key in AppLanguages]: string; },
}

@Injectable({providedIn: 'root'})
export class OrderService {
  private http:HttpClient=inject(HttpClient);
  private languageService: LanguageService = inject(LanguageService);

  private orderTemplate:OrderType = {
    id: 0,
    deliveryCost:0,
    deliveryType_id: 0,
    deliveryType: '',
    deliveryInfo:undefined,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    paymentType_id: 0,
    paymentType: '',
    comment:null,//может прити пустая строка
    status_id: 0,
    statusName:'',
    class:'',
    items:[{
        id: 0,
        url: '',
        name: '',
        price: 0,
        quantity: 0
      } as OrderProductType],
    createdAt: '',
    updatedAt:null,//может прити null
    totalAmount: 0,
  };

  private userErrors: userErrorsType = {
    getOrders: {
      [AppLanguages.ru]: 'Ошибка при запросе заказов. Обновите страницу.',
      [AppLanguages.en]: 'Error while requesting orders. Please refresh the page.',
      [AppLanguages.de]: 'Fehler beim Anfordern der Bestellungen. Bitte aktualisieren Sie die Seite.',
    },
    createOrder: {
      [AppLanguages.ru]: 'Ошибка при создании заказа. Повторите попытку.',
      [AppLanguages.en]: 'Error creating order. Please try again. Refresh the page.',
      [AppLanguages.de]: 'Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut.',
    }
  };
  get getOrdersError(): string {
    return this.userErrors.getOrders[this.languageService.appLang];
  }
  get createOrderError(): string {
    return this.userErrors.createOrder[this.languageService.appLang];
  }

  createOrder(params:OrderParamsType):Observable<OrderResponseType> {
    return this.http.post<OrderResponseType>(environment.api+'orders.php', params)
      .pipe(
        map((response:OrderResponseType)=>{
          if (response.error) return response;
          if(!response.order || !ResponseDataValidator.validateRequiredFields(this.orderTemplate,response.order)){
            response.error=true;
            response.message = 'createOrder error. Order not found in response or have invalid structure.';
          }
          return response;
          })
      );
  }

  getOrders():Observable<OrdersResponseType>{
    return this.http.get<OrdersResponseType>(environment.api+'orders.php').pipe(
      map((response:OrdersResponseType)=>{
        if (response.error) return response;
        if (!response.orders || !Array.isArray(response.orders)){
          response.error=true;
          response.message = 'Orders not found in response or have invalid structure.';
        }
        return response;
      })
    );
  }

}
