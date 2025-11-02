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

  ngOnInit(): void {
    this.subscriptions$.add(
      this.activatedRoute.params.subscribe(params => {
        this.productService.getProduct(params['url']).subscribe({
          next: (data: ProductResponseType) => {
            if (data.error) {
              this.showSnackService.error(this.productService.userErrors.getProduct);
              throw new Error(data.message);
            }
            if (!data.product) throw new Error(data.message);
            this.product = data.product;

            this.subscriptions$.add(
              this.productService.getRecommendedProducts(this.product.category_id, this.product.id).subscribe({
                next: (data: RecommendedProductsResponseType) => {
                  if (data.error) {
                    this.showSnackService.error(this.productService.userErrors.getRecommendedProducts);
                    throw new Error(data.message);
                  }
                  if (data.products) this.recommendedProducts = data.products;
                },
                error: (errorResponse: HttpErrorResponse) => {
                  this.showSnackService.error(this.productService.userErrors.getRecommendedProducts);
                  if (errorResponse.error && errorResponse.error.message) console.log(errorResponse.error.message);
                  else console.log('Unexpected error (getRecommendedProducts)!' + ` Code:${errorResponse.status}`);
                }
              }));
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.showSnackService.error(this.productService.userErrors.getProduct);
            if (errorResponse.error && errorResponse.error.message) this.showSnackService.error(errorResponse.error.message);
            else console.log(`Unexpected error (getRecommendedProducts)!` + ` Code:${errorResponse.status}`);
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
