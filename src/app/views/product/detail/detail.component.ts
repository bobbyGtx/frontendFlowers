import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProductService} from '../../../shared/services/product.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ActivatedRoute} from '@angular/router';
import {ProductType} from '../../../../assets/types/product.type';
import {ProductResponseType} from '../../../../assets/types/responses/product-response.type';
import {RecommendedProductsResponseType} from '../../../../assets/types/responses/recommended-products-response.type';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  productService: ProductService = inject(ProductService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  images: string = environment.images;
  recommendedProducts: ProductType[] = [];
  product: ProductType | null = null;
  subscriptions$: Subscription = new Subscription();

  count:number = 1;

  updateCount(value:number) {
    this.count = value;
  }

  addToCart() {
    if (!this.product?.disabled) {
      alert(`Добавлено в карзину: ${this.count} шт`);
    }
  }

  ngOnInit(): void {
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        this.productService.getProduct(params['url']).subscribe({
          next: (data: ProductResponseType) => {
            if (data.error) {
              this.showSnackService.error(this.productService.getProductError);
              throw new Error(data.message);
            }
            if (!data.product) throw new Error(data.message);
            this.product = data.product;
            this.subscriptions$.add(
              this.productService.getRecommendedProducts(this.product.category_id, this.product.id).subscribe({
                next: (data: RecommendedProductsResponseType) => {
                  if (data.error) {
                    this.showSnackService.error(this.productService.getRecommendedProductsError);
                    throw new Error(data.message);
                  }
                  if (data.products) this.recommendedProducts = data.products;
                },
                error: (errorResponse: HttpErrorResponse) => {
                  this.showSnackService.error(this.productService.getRecommendedProductsError);
                  console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getRecommendedProducts)! Code:${errorResponse.status}`);
                }
              }));
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.showSnackService.error(this.productService.getProductError);
            console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getProduct)! Code:${errorResponse.status}`);
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
