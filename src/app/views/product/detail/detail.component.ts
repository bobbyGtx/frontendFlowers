import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {ProductType} from '../../../../types/product.type';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProductService} from '../../../shared/services/product.service';
import {RecommendedProductsResponseType} from '../../../../types/responses/recommended-products-response.type';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ActivatedRoute} from '@angular/router';
import {ProductResponseType} from '../../../../types/responses/product-response.type';
import {ResponseDataValidatorService} from '../../../shared/services/response-data-validator.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit,OnDestroy {
  productService: ProductService=inject(ProductService);
  showSnackService:ShowSnackService=inject(ShowSnackService);
  activatedRoute:ActivatedRoute=inject(ActivatedRoute);
  responseDataValidatorService:ResponseDataValidatorService=inject(ResponseDataValidatorService);


  images:string = environment.images;
  recommendedProducts:ProductType[]=[];
  product:ProductType|null=null;
  subscriptions$:Subscription=new Subscription();


  ngOnInit():void {
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        this.productService.getProduct(params['url']).subscribe({
          next: (data:ProductResponseType) => {
            let error:null|string=null;
            if(data.error)error=data.message;
            if (!data.product || !this.responseDataValidatorService.validateRequiredFields(data.product)) error='Unexpected data from server. Product not found!';
            if (error){
              this.showSnackService.error(error);
              throw new Error(error);
            }
            this.product=data.product!;
            this.subscriptions$.add(
              this.productService.getRecommendedProducts(this.product.category_id,this.product.id).subscribe({
                next: (data:RecommendedProductsResponseType) => {
                  let error:null|string=null;
                  if(data.error)error=data.message;
                  if (!data.products || !this.responseDataValidatorService.validateRequiredFields(data.products)) error='Unexpected data from server. Recommended products not found!';
                  if (error){
                    this.showSnackService.error(error);
                    throw new Error(error);
                  }
                  if (data.products)this.recommendedProducts=data.products;
                },
                error: (errorResponse:HttpErrorResponse) => {
                  if (errorResponse.error && errorResponse.error.message){
                    //Если есть ошибка - выводим это пользователю
                    this.showSnackService.error(errorResponse.error.message);
                  }else{
                    this.showSnackService.error(`Unexpected error (getRecommendedProducts)!`,errorResponse.status);
                  }//Если сообщения нет - выводим это
                }
              }));
          },
            error: (errorResponse:HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message){
              //Если есть ошибка - выводим это пользователю
              this.showSnackService.error(errorResponse.error.message);
            }else{
              this.showSnackService.error(`Unexpected error (getRecommendedProducts)!`,errorResponse.status);
            }//Если сообщения нет - выводим это
          }
        });
      })
    );

  }
  ngOnDestroy():void {
    this.subscriptions$.unsubscribe();
  }
}
