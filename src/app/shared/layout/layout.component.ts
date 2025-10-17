import {Component, inject, OnInit} from '@angular/core';
import {CategoryService} from '../services/category.service';
import {CategoryType} from '../../../types/category.type';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {CategoriesResponseType} from '../../../types/responses/categories-response.type';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  categoryService= inject(CategoryService);
  categories:CategoryType[]=[];

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (data:DefaultResponseType|CategoriesResponseType) => {
        let error=null;
        if ((data as DefaultResponseType).error) {error=(data as DefaultResponseType).message;}
        const categoriesResponse:CategoriesResponseType = data as CategoriesResponseType;
        if (!categoriesResponse.categories || !Array.isArray(categoriesResponse.categories) || categoriesResponse.categories.length <1) {
          error='Unexpected data from server. Categories not found!';
        }
        if (error){
          alert(error);
          throw new Error(error);
        }//Если ошибка есть - выводим её и завершаем функцию
        this.categories = categoriesResponse.categories;
      },
      error: (errorResponse:HttpErrorResponse) => {
        if (errorResponse.error && errorResponse.error.message){
          //Если есть ошибка - выводим это пользователю
          alert(errorResponse.error.message);
        }else{
          alert('Ошибка запроса категорий!');
        }//Если сообщения нет - выводим это
      }
    });
  }
}
