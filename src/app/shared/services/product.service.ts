import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BestProductsResponseType} from '../../../types/responses/best-products-response.type';
import {ProductsResponseType} from '../../../types/responses/products-response.type';
import {ActiveParamsType} from '../../../types/active-params.type';
import {RecommendedProductsResponseType} from '../../../types/responses/recommended-products-response.type';
import {ProductResponseType} from '../../../types/responses/product-response.type';

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

  getRecommendedProducts(categoryId:number,productId:number):Observable<RecommendedProductsResponseType>{
    return this.http.get<RecommendedProductsResponseType>(environment.api+'products/recommended',{
      params:{categoryId,productId}
    });
  }

  getProducts(activeParams:ActiveParamsType):Observable<ProductsResponseType>{
    const params:RequestParamsType = this.prepareParameters(activeParams);
    return this.http.get<ProductsResponseType>(environment.api+'products',{params});
  }

  getProduct(url:string):Observable<ProductResponseType>{
    return this.http.get<ProductsResponseType>(environment.api+'products/'+url);
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
