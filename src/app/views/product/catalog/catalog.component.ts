import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {Subscription} from 'rxjs';
import {ProductType} from '../../../../types/product.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ProductsResponseType} from '../../../../types/responses/products-response.type';
import {CategoryService} from '../../../shared/services/category.service';
import {CategoriesWithTypesResponseType} from '../../../../types/responses/categories-with-types-response.type';
import {CategoryWithTypesType} from '../../../../types/category-with-types.type';
import {CategoryFiltersEnum} from '../../../../enums/category-filters.enum';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  productService: ProductService=inject(ProductService);
  categoryService: CategoryService=inject(CategoryService);
  showSnackService: ShowSnackService=inject(ShowSnackService);
  subscriptions$: Subscription=new Subscription();

  products:Array<ProductType>=[];
  categoriesWithTypes:Array<CategoryWithTypesType> = [];

  activePage:number = 1;
  totalPages:number=1;
  totalProducts:number=0;
  sortOpened:boolean=false;

  ngOnInit() {
    this.subscriptions$.add(
      this.productService.getProducts().subscribe({
        next: (data:ProductsResponseType) => {
          let error:null|string=null;
          if(data.error)error=data.message;
          if (!data.response || !data.response.page || !data.response.totalPages || !data.response.totalProducts
            || !data.response.products || !Array.isArray(data.response.products) || data.response.products.length===0){
            error='Unexpected data from server. Products not found!';
          }
          if (error){
            this.showSnackService.error(error);
            throw new Error(error);
          }
          if (data.response){
            this.products=data.response.products;
            this.activePage=data.response.page;
            this.totalPages=data.response.totalPages;
            this.totalProducts=data.response.totalProducts;
          }
        },
        error: (errorResponse:HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message){
            //Если есть ошибка - выводим это пользователю
            this.showSnackService.error(errorResponse.error.message);
          }else{
            this.showSnackService.error(`Unexpected error (getBestProducts)!`,errorResponse.status);
          }//Если сообщения нет - выводим это
        }
      }));
    this.subscriptions$.add(
      this.categoryService.getCategoriesWithTypes().subscribe({
        next:(data:CategoriesWithTypesResponseType)=>{
          let error:null|string=null;
          if(data.error)error=data.message;
          if(!data.categories || !Array.isArray(data.categories) || data.categories.length<1){
            error='Unexpected data from server. Categories and Types not found!';
          }
          if (error){
            this.showSnackService.error(error);
            throw new Error(error);
          }
          if (data.categories) this.categoriesWithTypes = data.categories;
        },
        error: (errorResponse:HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message){
            //Если есть ошибка - выводим это пользователю
            this.showSnackService.error(errorResponse.error.message);
          }else{
            this.showSnackService.error(`Unexpected error (getCategoriesWithTypes)!`,errorResponse.status);
            console.log('Unexpected error (getCategoriesWithTypes)!','Code:'+errorResponse.status);
          }//Если сообщения нет - выводим это
        }
      })
    );
  }

  openSort(){
    this.sortOpened = !this.sortOpened;
  }


  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  protected readonly CategoryFiltersEnum = CategoryFiltersEnum;
}
