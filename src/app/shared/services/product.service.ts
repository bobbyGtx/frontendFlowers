import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BestProductsResponseType} from '../../../types/responses/best-products-response.type';
import {ProductsResponseType} from '../../../types/responses/products-response.type';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  http:HttpClient= inject(HttpClient);

  getBestProducts():Observable<BestProductsResponseType>{
    return this.http.get<BestProductsResponseType>(environment.api+'products/best');
  }

  getProducts():Observable<ProductsResponseType>{
    return this.http.get<ProductsResponseType>(environment.api+'products');
  }

}
