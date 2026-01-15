import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {distinctUntilChanged, finalize, map, Observable, of, shareReplay, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ResponseDataValidator} from '../utils/response-data-validator.util';
import {LanguageService} from '../../core/language.service';
import {CategoryWithTypesType} from '../../../assets/types/category-with-types.type';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {CategoriesWithTypesResponseType} from '../../../assets/types/responses/categories-with-types-response.type';
import {TypeType} from '../../../assets/types/type.type';

export type userErrorsType = {
  getCategoriesWithTypes:{
    [key in AppLanguages]:string;
  },
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http: HttpClient = inject(HttpClient);
  languageService:LanguageService = inject(LanguageService);
  private changeLanguage = this.languageService.currentLanguage$.pipe(
    distinctUntilChanged(),
    tap(()=>{
      this.clearCache();
      this.categoriesWithTypesRequest$ = undefined;
    })
  ).subscribe();
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
  userErrors:userErrorsType = {
    getCategoriesWithTypes: {
      [AppLanguages.ru]:'Ошибка при запросе категорий. Обновите страницу.',
      [AppLanguages.en]:'Error retrieving categories. Please refresh the page.',
      [AppLanguages.de]:'Fehler beim Abrufen der Kategorien. Bitte aktualisieren Sie die Seite.',
    },
  };

  get getCategoriesWithTypesError():string{
    return this.userErrors.getCategoriesWithTypes[this.languageService.appLang];
  }

  private categoriesWithTypesCash: CategoryWithTypesType[] | null = null;
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
              response.message = 'getCategoriesWithTypes error. Categories or Types not found in response or have invalid structure.';
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
        shareReplay(1),// делимся результатом между всеми подписками
        finalize(() => {
          this.categoriesWithTypesRequest$ = undefined;
        })
      );
    return this.categoriesWithTypesRequest$;
  }

  clearCache(): void {
    this.categoriesWithTypesCash = null;
  }

}
