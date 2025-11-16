import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '../services/category.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {ShowSnackService} from '../../core/show-snack.service';
import {CategoryWithTypesType} from '../../../assets/types/category-with-types.type';
import {CategoriesWithTypesResponseType} from '../../../assets/types/responses/categories-with-types-response.type';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit, OnDestroy {
  showSnackService: ShowSnackService = inject(ShowSnackService);
  categoryService = inject(CategoryService);
  categories: CategoryWithTypesType[] = [];
  subscriptions$: Subscription = new Subscription();

  ngOnInit() {
    this.subscriptions$.add(
      this.categoryService.getCategoriesWithTypes().subscribe({
        next: (data: CategoriesWithTypesResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.categoryService.userErrorMessages.catWithTypes);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          if (data.categories) this.categories = data.categories;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(this.categoryService.userErrorMessages.catWithTypes);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (update Cart)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
