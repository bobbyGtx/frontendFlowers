import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {debounceTime, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BestProductsResponseType} from '../../../types/responses/best-products-response.type';
import {ProductsResponseType} from '../../../types/responses/products-response.type';
import {ActiveParamsType} from '../../../types/active-params.type';

type RequestParamsType={
  types?: string;
  diameterFrom?: string;
  diameterTo?: string;
  heightFrom?: string;
  heightTo?: string;
  priceFrom?: string;
  priceTo?: string;
  sort?:string;
  page?:number;
};

@Injectable({
  providedIn: 'root'
})


export class ProductService {
  http:HttpClient= inject(HttpClient);

  getBestProducts():Observable<BestProductsResponseType>{
    return this.http.get<BestProductsResponseType>(environment.api+'products/best');
  }

  getProducts(activeParams:ActiveParamsType):Observable<ProductsResponseType>{
    const params:RequestParamsType = this.prepareParameters(activeParams);
    return this.http.get<ProductsResponseType>(environment.api+'products',{params});
  }

  private prepareParameters(activeParams:ActiveParamsType):RequestParamsType {
    return Object.entries(activeParams).reduce((acc, [key, value]) => {
      if (value) {
        if (key === 'types' && Array.isArray(value) && value.length>0 ) acc.types = (value as string[]).join(',');
        else (acc as any)[key] = value;
      }
      return acc;
    }, {} as RequestParamsType);
  }

}
