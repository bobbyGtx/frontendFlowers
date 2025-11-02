import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, shareReplay} from 'rxjs';
import {CategoriesResponseType} from '../../../types/responses/categories-response.type';
import {environment} from '../../../environments/environment';
import {CategoriesWithTypesResponseType} from '../../../types/responses/categories-with-types-response.type';
import {CategoryWithTypesType} from '../../../types/category-with-types.type';
import {TypeType} from '../../../types/type.type';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http: HttpClient = inject(HttpClient);
  categoryWithTypesTemplate: CategoryWithTypesType = {
    id: 0,
    name: '',
    url: '',
    types: [
      {
        id: 0,
        name: '',
        url: '',
        category_id: 0,
      },
    ],
  };
  userErrorMessages = {
    catWithTypes: 'Ошибка при запросе категорий. Обновите страницу.',
  }

  categoriesWithTypesCash: CategoryWithTypesType[] | null = null;
  private categoriesWithTypesRequest$?: Observable<CategoriesWithTypesResponseType>;

  getCategoriesWithTypes(): Observable<CategoriesWithTypesResponseType> {
    if (this.categoriesWithTypesCash) {
      return of({
        error: false,
        message: 'Request success!',
        categories: this.categoriesWithTypesCash
      });
    }
    if (this.categoriesWithTypesRequest$) return this.categoriesWithTypesRequest$;
    this.categoriesWithTypesRequest$ = this.http.get<CategoriesWithTypesResponseType>(environment.api + 'categorieswithtypes.php')
      .pipe(
        map((response: CategoriesWithTypesResponseType) => {
            if (response.error) return response;
            if (!response.categories || !ResponseDataValidator.validateRequiredFields(this.categoryWithTypesTemplate, response.categories)) {
              response.error = true;
              response.message = 'Unexpected response from server. Try again!';
              console.log('getCategoriesWithTypes error. Categories or Types not found in response or have invalid structure.')
            }

            if (!response.error && response.categories) {
              response.categories = response.categories!.map(item => {
                return Object.assign({typesUrl: item.types.map((typeItem: TypeType) => typeItem.url)}, item)
              });
              this.categoriesWithTypesCash = response.categories;
            }
            return response;
          }
        ),
        shareReplay(1)// делимся результатом между всеми подписками
      );
    return this.categoriesWithTypesRequest$;
  }

  getCategories(): Observable<DefaultResponseType | CategoriesResponseType> {
    return this.http.get<DefaultResponseType | CategoriesResponseType>(environment.api + 'categories.php');
  }

}
