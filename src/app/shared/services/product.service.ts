import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BestProductsResponseType} from '../../../types/responses/best-products-response.type';
import {ProductsResponseType} from '../../../types/responses/products-response.type';
import {ActiveParamsType} from '../../../types/active-params.type';
import {RecommendedProductsResponseType} from '../../../types/responses/recommended-products-response.type';
import {ProductResponseType} from '../../../types/responses/product-response.type';
import {ProductType} from '../../../types/product.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';

type RequestParamsType = {
  types?: string;
  diameterFrom?: string;
  diameterTo?: string;
  heightFrom?: string;
  heightTo?: string;
  priceFrom?: string;
  priceTo?: string;
  sort?: string;
  page?: number;
};

@Injectable({
  providedIn: 'root'
})


export class ProductService {
  http: HttpClient = inject(HttpClient);

  productTemplate: ProductType = {
    id: 0,
    name: '',
    price: 0,
    image: '',
    lightning: '',
    humidity: '',
    temperature: '',
    height: 0,
    diameter: 0,
    url: '',
    category_id: 0,
    count: 0,
    disabled: false,
    type: {
      id: 0,
      name: '',
      url: ''
    }
  };
  userErrors = {
    getBestProducts: 'Лучшие продукты не найдены, обновите страницу.',
    getRecommendedProducts: 'Рекомендуемые продукты не найдены, обновите страницу.',
    getProducts: 'Ошибка при запросе товаров. Обновите страницу.',
    getProduct: 'Запрашиваемый товар не найден.',
  };

  getBestProducts(): Observable<BestProductsResponseType> {
    return this.http.get<BestProductsResponseType>(environment.api + 'products/best')
      .pipe(
        map((response: BestProductsResponseType) => {
          if (response.error) return response;
          if (!response.products || !ResponseDataValidator.validateRequiredFields(this.productTemplate, response.products)) {
            response.error = true;
            response.message = 'getBestProducts error. Products not found in response or have invalid structure.';
          }
          return response;
        })
      );
  }

  getRecommendedProducts(categoryId: number, productId: number): Observable<RecommendedProductsResponseType> {
    return this.http.get<RecommendedProductsResponseType>(environment.api + 'products/recommended', {
      params: {categoryId, productId}
    }).pipe(
      map((response: RecommendedProductsResponseType) => {
        if (response.error) return response;
        if (!response.products || !ResponseDataValidator.validateRequiredFields(this.productTemplate, response.products)) {
          response.error = true;
          response.message = 'getRecommendedProducts error. Products not found in response or have invalid structure.';
        }
        return response;
      })
    );
  }

  getProducts(activeParams: ActiveParamsType): Observable<ProductsResponseType> {
    const params: RequestParamsType = this.prepareParameters(activeParams);
    return this.http.get<ProductsResponseType>(environment.api + 'products', {params})
      .pipe(
        map((response: ProductsResponseType) => {
          if (response.error) return response;
          if (!response.response || !response.response.page || !response.response.totalPages || !(response.response.totalProducts >= 0)) {
            response.error = true;
            response.message = 'getProducts error. Response parameters not found in response or have invalid structure.';
          } else if (response.response.totalProducts > 0) {
            if (!response.response.products || !ResponseDataValidator.validateRequiredFields(this.productTemplate, response.response.products)) {
              response.error = true;
              response.message = 'getProducts error. Products not found in response or have invalid structure.';
            }
          }
          return response;
        })
      );
  }

  getProduct(url: string): Observable<ProductResponseType> {
    return this.http.get<ProductResponseType>(environment.api + 'products/' + url)
      .pipe(
        map((response: ProductResponseType) => {
          if (response.error) return response;
          if (!response.product || !ResponseDataValidator.validateRequiredFields(this.productTemplate, response.product)) {
            response.error = true;
            response.message = 'getRecommendedProducts error. Products not found in response or have invalid structure.';
          }
          return response;
        })
      );
  }

  private prepareParameters(activeParams: ActiveParamsType): RequestParamsType {
    return Object.entries(activeParams).reduce((acc, [key, value]) => {
      if (value) {
        if (key === 'types' && Array.isArray(value) && value.length > 0) acc.types = (value as string[]).join(',');
        else (acc as any)[key] = value;
      }
      return acc;
    }, {} as RequestParamsType);
  }

}
