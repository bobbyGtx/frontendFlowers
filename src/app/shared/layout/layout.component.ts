import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '../services/category.service';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {ShowSnackService} from '../../core/show-snack.service';
import {CategoriesWithTypesResponseType} from '../../../types/responses/categories-with-types-response.type';
import {CategoryWithTypesType} from '../../../types/category-with-types.type';
import {TypeType} from '../../../types/type.type';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit, OnDestroy {
  showSnackService:ShowSnackService = inject(ShowSnackService);
  categoryService= inject(CategoryService);
  categories:CategoryWithTypesType[]=[];
  subscriptions$:Subscription=new Subscription();

  ngOnInit() {
    this.subscriptions$.add(this.categoryService.getCategoriesWithTypes().subscribe({
      next: (data:DefaultResponseType|CategoriesWithTypesResponseType) => {
        let error:null|string=null;
        if ((data as DefaultResponseType).error) {error=(data as DefaultResponseType).message;}
        const categoriesWithTypesResponse:CategoriesWithTypesResponseType = data as CategoriesWithTypesResponseType;
        if (!categoriesWithTypesResponse.categories || !Array.isArray(categoriesWithTypesResponse.categories) || categoriesWithTypesResponse.categories.length <1) {
          error='Unexpected data from server. Categories not found!';
        }
        if (error){
          this.showSnackService.error(error);
          throw new Error(error);
        }//Если ошибка есть - выводим её и завершаем функцию
        if (categoriesWithTypesResponse.categories){
          this.categories = categoriesWithTypesResponse.categories.map(item=>{
            return Object.assign({typesUrl:item.types.map((typeItem:TypeType)=>typeItem.url)},item)
          });
        }
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
