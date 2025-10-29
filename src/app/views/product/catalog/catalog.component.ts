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
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveParamsUtil} from '../../../shared/utils/active-params.util';
import {ActiveParamsType} from '../../../../types/active-params.type';
import {AppliedFilterType} from '../../../../types/applied-filter.type';
import {TypeType} from '../../../../types/type.type';
import {UrlParamsEnum} from '../../../../enums/url-params.enum';
import {SortingOptionsType} from '../../../../types/sorting-options.type';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  productService: ProductService=inject(ProductService);
  categoryService: CategoryService=inject(CategoryService);
  showSnackService: ShowSnackService=inject(ShowSnackService);
  activatedRoute: ActivatedRoute=inject(ActivatedRoute);
  router:Router=inject(Router);
  subscriptions$: Subscription=new Subscription();

  activeParams:ActiveParamsType={types:[]};
  appliedFilters:Array<AppliedFilterType>=[];

  products:Array<ProductType>=[];
  categoriesWithTypes:Array<CategoryWithTypesType> = [];

  activePage:number = 1;
  pages:Array<number>=[];
  totalProducts:number=0;
  sortingOpened:boolean=false;
  sortingOptions:Array<SortingOptionsType>=[
    {name:'От А до Я',value:'name-asc'},
    {name:'От Я до А',value:'name-desc'},
    {name:'По возрастанию цены',value:'price-asc'},
    {name:'По убыванию цены',value:'price-desc'},
  ];

  ngOnInit() {
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

          this.subscriptions$.add(
            this.activatedRoute.queryParams.subscribe(params => {
              this.activeParams = ActiveParamsUtil.processParams(params);
              this.appliedFilters=[];
              this.activeParams.types.forEach((urlItem:string)=> {
                for (let i = 0; i < this.categoriesWithTypes.length; i++) {
                  const foundType:TypeType|undefined = this.categoriesWithTypes[i].types.find((typeItem:TypeType)=>typeItem.url===urlItem);
                  if (foundType){
                    this.appliedFilters.push({
                      name:foundType.name,
                      urlParam:foundType.url,
                    });
                    break;
                  }
                }
              });
              if (this.activeParams.diameterFrom){
                this.appliedFilters.push({
                  name:'Диаметр от: '+this.activeParams.diameterFrom+'см',
                  urlParam:UrlParamsEnum.diameterFrom,
                });
              }
              if (this.activeParams.diameterTo){
                this.appliedFilters.push({
                  name:'Диаметр до: '+this.activeParams.diameterTo+'см',
                  urlParam:UrlParamsEnum.diameterTo,
                });
              }
              if (this.activeParams.heightFrom){
                this.appliedFilters.push({
                  name:'Высота от: '+this.activeParams.heightFrom+'см',
                  urlParam:UrlParamsEnum.heightFrom,
                });
              }
              if (this.activeParams.heightTo){
                this.appliedFilters.push({
                  name:'Высота до: '+this.activeParams.heightTo+'см',
                  urlParam:UrlParamsEnum.heightTo,
                });
              }
              if (this.activeParams.priceFrom){
                this.appliedFilters.push({
                  name:'Цена от: '+this.activeParams.priceFrom,
                  urlParam:UrlParamsEnum.priceFrom,
                });
              }
              if (this.activeParams.priceTo){
                this.appliedFilters.push({
                  name:'Цена до: '+this.activeParams.priceTo,
                  urlParam:UrlParamsEnum.priceTo,
                });
              }

              this.subscriptions$.add(
                this.productService.getProducts(this.activeParams).subscribe({
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
                      this.pages=[];
                      for (let i:number = 1; i <= data.response.totalPages; i++) this.pages.push(i);
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
            })
          );
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

  toggleSorting(){
    this.sortingOpened = !this.sortingOpened;
  }

  removeAppliedFilter(appliedFilter:AppliedFilterType){
    const param:string = appliedFilter.urlParam;
    if (param === UrlParamsEnum.diameterFrom || param === UrlParamsEnum.diameterTo || param=== UrlParamsEnum.heightFrom || param=== UrlParamsEnum.heightTo || param=== UrlParamsEnum.priceFrom || param=== UrlParamsEnum.priceTo) {
      if (this.activeParams[param]) {
        delete this.activeParams[param];
      }
    }else{
      this.activeParams.types= this.activeParams.types.filter((typeItem:string)=>typeItem !== param);
    }
    if (this.activeParams.page)this.activeParams.page=1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  sort(sortValue:string){
    if (this.activeParams.sort && this.activeParams.sort == sortValue){
      delete this.activeParams.sort;
    }else{
      this.activeParams.sort = sortValue;
    }
    this.sortingOpened = false;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  openNextPage(){
    if ((this.activePage+1)<=this.pages.length){
      this.openPage(this.activePage+1);
    }
  }
  openPrevPage(){
    if (this.activePage>1)this.openPage(this.activePage-1);
  }
  openPage(page:number){
    if (page >= 1 && page <= this.pages.length && page !== this.activePage){
      this.activeParams.page = page;
      this.activePage = page;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  protected readonly CategoryFiltersEnum = CategoryFiltersEnum;
}
