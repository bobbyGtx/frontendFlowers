import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoriesResponseType} from '../../../types/responses/categories-response.type';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {environment} from '../../../environments/environment';
import {CategoriesWithTypesResponseType} from '../../../types/responses/categories-with-types-response.type';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http:HttpClient= inject(HttpClient);

  getCategories():Observable<DefaultResponseType | CategoriesResponseType>{
    return this.http.get<DefaultResponseType | CategoriesResponseType>(environment.api+'categories.php');
  }
  getCategoriesWithTypes():Observable<CategoriesWithTypesResponseType>{
    return this.http.get<CategoriesWithTypesResponseType>(environment.api+'categorieswithtypes.php');
  }
}
