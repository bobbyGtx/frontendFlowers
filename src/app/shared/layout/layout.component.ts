import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '../services/category.service';
import {CategoryType} from '../../../types/category.type';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {CategoriesResponseType} from '../../../types/responses/categories-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {ShowSnackService} from '../../core/show-snack.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit, OnDestroy {
  showSnackService:ShowSnackService = inject(ShowSnackService);
  categoryService= inject(CategoryService);
  categories:CategoryType[]=[];
  subscriptions$:Subscription=new Subscription();

  ngOnInit() {
    this.subscriptions$.add(this.categoryService.getCategories().subscribe({
      next: (data:DefaultResponseType|CategoriesResponseType) => {
        let error=null;
        if ((data as DefaultResponseType).error) {error=(data as DefaultResponseType).message;}
        const categoriesResponse:CategoriesResponseType = data as CategoriesResponseType;
        if (!categoriesResponse.categories || !Array.isArray(categoriesResponse.categories) || categoriesResponse.categories.length <1) {
          error='Unexpected data from server. Categories not found!';
        }
        if (error){
          alert(error);
          this.showSnackService.error(error);
          throw new Error(error);
        }//Если ошибка есть - выводим её и завершаем функцию
        this.categories = categoriesResponse.categories;
      },
      error: (errorResponse:HttpErrorResponse) => {
        if (errorResponse.error && errorResponse.error.message){
          //Если есть ошибка - выводим это пользователю
          this.showSnackService.error(errorResponse.error.message);
        }else{
          this.showSnackService.error(`Unexpected error (get Categories)!`,errorResponse.status);
        }//Если сообщения нет - выводим это
      }
    }));
  }
  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
