import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoriesResponseType} from '../../../types/responses/categories-response.type';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {environment} from '../../../environments/environment';
import {CategoryWithTypesType} from '../../../types/category-with-types.type';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http:HttpClient= inject(HttpClient);

  getCategories():Observable<DefaultResponseType | CategoriesResponseType>{
    return this.http.get<DefaultResponseType | CategoriesResponseType>(environment.api+'categories.php');
  }
  getCategoriesWithTypes():Observable<CategoryWithTypesType>{
    return this.http.get<CategoryWithTypesType>(environment.api+'categorieswithtypes.php');
  }
}
