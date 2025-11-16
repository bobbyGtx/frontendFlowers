import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ResponseDataValidator} from '../utils/response-data-validator.util';
import {LanguageService} from '../../core/language.service';
import {ProductType} from '../../../assets/types/product.type';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {BestProductsResponseType} from '../../../assets/types/responses/best-products-response.type';
import {RecommendedProductsResponseType} from '../../../assets/types/responses/recommended-products-response.type';
import {ActiveParamsType} from '../../../assets/types/active-params.type';
import {ProductResponseType} from '../../../assets/types/responses/product-response.type';
import {ProductsResponseType} from '../../../assets/types/responses/products-response.type';

export type userErrorsType = {
  getBestProducts:{
    [key in AppLanguages]:string;
  },
  getRecommendedProducts:{
    [key in AppLanguages]:string;
  },
  getProducts:{
    [key in AppLanguages]:string;
  },
  getProduct:{
    [key in AppLanguages]:string;
  },
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private http: HttpClient = inject(HttpClient);
  private languageService:LanguageService= inject(LanguageService);

  private productTemplate: ProductType = {
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
  userErrors:userErrorsType = {
    getBestProducts: {
      [AppLanguages.ru]:'Ошибка получения списка лучших продуктов.',
      [AppLanguages.en]:'Error retrieving list of top products.',
      [AppLanguages.de]:'Fehler beim Abrufen der Liste der Top-Produkte.',
    },
    getRecommendedProducts: {
      [AppLanguages.ru]:'Рекомендуемые продукты не найдены, обновите страницу.',
      [AppLanguages.en]:'Recommended products not found, try refresh the page.',
      [AppLanguages.de]:'Empfohlene Produkte nicht gefunden, bitte aktualisieren Sie die Seite.',
    },
    getProducts:{
      [AppLanguages.ru]:'Ошибка при запросе товаров. Обновите страницу.',
      [AppLanguages.en]:'Error while requesting products. Refresh the page.',
      [AppLanguages.de]:'Fehler beim Anfordern der Produkte. Bitte aktualisieren Sie die Seite.',
    },
    getProduct: {
      [AppLanguages.ru]:'Запрашиваемый товар не найден.',
      [AppLanguages.en]:'Requested product was not found.',
      [AppLanguages.de]:'Das angeforderte Produkt wurde nicht gefunden.',
    },
  };

  get getBestProductsError():string{
    return this.userErrors.getBestProducts[this.languageService.appLang];
  };
  get getRecommendedProductsError():string{
    return this.userErrors.getRecommendedProducts[this.languageService.appLang];
  };
  get getProductsError():string{
    return this.userErrors.getProducts[this.languageService.appLang];
  }
  get getProductError():string{
    return this.userErrors.getProduct[this.languageService.appLang];
  }

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
    return this.http.get<ProductsResponseType>(environment.api + 'products', {params:this.buildQueryParams(activeParams)})
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

  private buildQueryParams(params: ActiveParamsType): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === 'types' && Array.isArray(value)) {
        // для массива types используем types[]=val
        value.forEach(val => {
          httpParams = httpParams.append('types[]', val);
        });
      } else {
        httpParams = httpParams.set(key, value as string);
      }
    });
    return httpParams;
  }

}
