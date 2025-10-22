import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../shared/services/product.service';
import {Subscription} from 'rxjs';
import {ProductsResponseType} from '../../../types/responses/products-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../core/show-snack.service';
import {ProductType} from '../../../types/product.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  productService: ProductService=inject(ProductService);
  showSnackService: ShowSnackService=inject(ShowSnackService);
  subscriptions$: Subscription=new Subscription();
  bestProducts:ProductType[]=[];

  ngOnInit() {
    this.subscriptions$.add(
      this.productService.getBestProducts().subscribe({
        next: (data:ProductsResponseType) => {
          let error:null|string=null;
          if(data.error)error=data.message;
          if (!data.products || !Array.isArray(data.products) || data.products.length===0) error='Unexpected data from server. Best products not found!';
          if (error){
            this.showSnackService.error(error);
            throw new Error(error);
          }
          this.bestProducts=data.products!;
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
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
