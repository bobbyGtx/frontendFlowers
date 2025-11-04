import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {debounce, fromEvent, Subscription, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {CategoryService} from '../../../shared/services/category.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveParamsUtil} from '../../../shared/utils/active-params.util';
import {ActiveParamsType} from '../../../../assets/types/active-params.type';
import {AppliedFilterType} from '../../../../assets/types/applied-filter.type';
import {ProductType} from '../../../../assets/types/product.type';
import {SortingOptionsType} from '../../../../assets/types/sorting-options.type';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {CategoriesWithTypesResponseType} from '../../../../assets/types/responses/categories-with-types-response.type';
import {ProductsResponseType} from '../../../../assets/types/responses/products-response.type';
import {UrlParamsEnum} from '../../../../assets/enums/url-params.enum';
import {TypeType} from '../../../../assets/types/type.type';
import {CategoryFilters} from '../../../../assets/enums/category-filters.enum';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  productService: ProductService = inject(ProductService);
  categoryService: CategoryService = inject(CategoryService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  subscriptions$: Subscription = new Subscription();

  activeParams: ActiveParamsType = {types: []};
  appliedFilters: Array<AppliedFilterType> = [];

  products: Array<ProductType> = [];
  categoriesWithTypes: Array<CategoryWithTypesType> = [];

  activePage: number = 1;
  pages: Array<number> = [];
  totalProducts: number = 0;
  sortingOpened: boolean = false;
  debounce: boolean = false;
  sortingOptions: Array<SortingOptionsType> = [
    {name: 'От А до Я', value: 'name-asc'},
    {name: 'От Я до А', value: 'name-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];

  ngOnInit() {
    const clicks = fromEvent(document, 'click');
    this.subscriptions$.add(clicks.subscribe(() => this.sortingOpened = false));
    this.subscriptions$.add(
      this.categoryService.getCategoriesWithTypes().subscribe({
        next: (data: CategoriesWithTypesResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.categoryService.getCategoriesWithTypesError);
            throw new Error(data.message);
          }
          if (data.categories) this.categoriesWithTypes = data.categories;
          this.subscriptions$.add(
            this.activatedRoute.queryParams
              .pipe(
                debounce(() => {
                  if (this.debounce) return timer(600);
                  this.debounce = true;
                  return timer(0);
                })
              )
              .subscribe(params => {
                this.activeParams = ActiveParamsUtil.processParams(params);
                this.fillAppliedFilters();
                this.debounce = true;
                this.subscriptions$.add(
                  this.productService.getProducts(this.activeParams).subscribe({
                    next: (data: ProductsResponseType) => {
                      if (data.error) {
                        this.showSnackService.error(this.productService.getProductsError);
                        throw new Error(data.message);
                      }
                      if (data.response) {
                        this.products = data.response.products;
                        this.activePage = data.response.page;
                        this.pages = [];
                        for (let i: number = 1; i <= data.response.totalPages; i++) this.pages.push(i);
                        this.totalProducts = data.response.totalProducts;
                      }
                    },
                    error: (errorResponse: HttpErrorResponse) => {
                      this.showSnackService.error(this.productService.getProductsError);
                      console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getProducts)! Code:${errorResponse.status}`);
                    }
                  }));
              })
          );
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(this.categoryService.getCategoriesWithTypesError);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (get Categories)! Code:${errorResponse.status}`);
        }
      })
    );
  }

  toggleSorting(event: MouseEvent) {
    this.sortingOpened = !this.sortingOpened;
    event.stopPropagation();
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    const param: string = appliedFilter.urlParam;
    if (param === UrlParamsEnum.diameterFrom || param === UrlParamsEnum.diameterTo || param === UrlParamsEnum.heightFrom || param === UrlParamsEnum.heightTo || param === UrlParamsEnum.priceFrom || param === UrlParamsEnum.priceTo) {
      if (this.activeParams[param]) {
        delete this.activeParams[param];
      }
    } else {
      this.activeParams.types = this.activeParams.types.filter((typeItem: string) => typeItem !== param);
    }
    if (this.activeParams.page) this.activeParams.page = 1;
    this.debounce = false;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  fillAppliedFilters() {
    this.appliedFilters = [];
    this.activeParams.types.forEach((urlItem: string) => {
      for (let i = 0; i < this.categoriesWithTypes.length; i++) {
        const foundType: TypeType | undefined = this.categoriesWithTypes[i].types.find((typeItem: TypeType) => typeItem.url === urlItem);
        if (foundType) {
          this.appliedFilters.push({
            name: foundType.name,
            urlParam: foundType.url,
          });
          break;
        }
      }
    });
    if (this.activeParams.diameterFrom) {
      this.appliedFilters.push({
        name: 'Диаметр от: ' + this.activeParams.diameterFrom + 'см',
        urlParam: UrlParamsEnum.diameterFrom,
      });
    }
    if (this.activeParams.diameterTo) {
      this.appliedFilters.push({
        name: 'Диаметр до: ' + this.activeParams.diameterTo + 'см',
        urlParam: UrlParamsEnum.diameterTo,
      });
    }
    if (this.activeParams.heightFrom) {
      this.appliedFilters.push({
        name: 'Высота от: ' + this.activeParams.heightFrom + 'см',
        urlParam: UrlParamsEnum.heightFrom,
      });
    }
    if (this.activeParams.heightTo) {
      this.appliedFilters.push({
        name: 'Высота до: ' + this.activeParams.heightTo + 'см',
        urlParam: UrlParamsEnum.heightTo,
      });
    }
    if (this.activeParams.priceFrom) {
      this.appliedFilters.push({
        name: 'Цена от: ' + this.activeParams.priceFrom,
        urlParam: UrlParamsEnum.priceFrom,
      });
    }
    if (this.activeParams.priceTo) {
      this.appliedFilters.push({
        name: 'Цена до: ' + this.activeParams.priceTo,
        urlParam: UrlParamsEnum.priceTo,
      });
    }
  }

  sort(sortValue: string) {
    if (this.activeParams.sort && this.activeParams.sort == sortValue) {
      delete this.activeParams.sort;
    } else {
      this.activeParams.sort = sortValue;
    }
    this.sortingOpened = false;
    this.debounce = false;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  openNextPage() {
    if ((this.activePage + 1) <= this.pages.length) {
      this.openPage(this.activePage + 1);
    }
  }

  openPrevPage() {
    if (this.activePage > 1) this.openPage(this.activePage - 1);
  }

  openPage(page: number) {
    if (page >= 1 && page <= this.pages.length && page !== this.activePage) {
      this.activeParams.page = page;
      this.activePage = page;
      this.debounce=false;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

  clearFilters() {
    let clearParams: ActiveParamsType = {types: []};
    if (this.activeParams.sort) clearParams.sort = this.activeParams.sort;

    this.router.navigate(['/catalog'], {
      queryParams: clearParams
    });
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  protected readonly CategoryFilters = CategoryFilters;
}
