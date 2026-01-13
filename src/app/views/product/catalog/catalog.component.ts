import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product.service';
import {ShowSnackService} from '../../../core/show-snack.service';
import {catchError, combineLatest, debounce, fromEvent, Observable, of, Subscription, timer} from 'rxjs';
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
import {CartService} from '../../../shared/services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {CartItemType} from '../../../../assets/types/cart-item.type';
import {FavoriteService} from '../../../shared/services/favorite.service';
import {FavoriteProductType} from '../../../../assets/types/favorite-product.type';
import {FavoritesResponseType} from '../../../../assets/types/responses/favorites-response.type';
import {AuthService} from '../../../core/auth/auth.service';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private authService: AuthService=inject(AuthService);
  private languageService: LanguageService = inject(LanguageService);
  private productService: ProductService = inject(ProductService);
  private categoryService: CategoryService = inject(CategoryService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private cartService: CartService = inject(CartService);
  private favoriteService: FavoriteService = inject(FavoriteService);
  protected router: Router = inject(Router);

  private subscriptions$: Subscription = new Subscription();
  protected appLanguage:AppLanguages;

  protected activeParams: ActiveParamsType = {types: []};
  protected appliedFilters: Array<AppliedFilterType> = [];

  protected products: Array<ProductType> = [];
  protected categoriesWithTypes: Array<CategoryWithTypesType> = [];
  protected cartItems:CartItemType[]=[];
  protected favoriteProducts:FavoriteProductType[]=[];

  protected activePage: number = 1;
  protected pages: Array<number> = [];
  protected totalProducts: number = 0;
  protected sortingOpened: boolean = false;
  private debounce: boolean = false;
  protected sortingOptions: Array<SortingOptionsType> = [
    {name: 'От А до Я', value: 'name-asc'},
    {name: 'От Я до А', value: 'name-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];
  constructor() {
    this.appLanguage = this.languageService.appLang;
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages) => {
      if (this.appLanguage !== language) this.appLanguage = language;
    }));
    const clicks:Observable<Event> = fromEvent(document, 'click');
    this.subscriptions$.add(clicks.subscribe(() => this.sortingOpened = false));

    this.subscriptions$.add(this.categoryService.getCategoriesWithTypes().subscribe({
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
                  if (this.debounce) return timer(500);
                  this.debounce = true;
                  return timer(0);
                })
              )
              .subscribe(params => {
                this.activeParams = ActiveParamsUtil.processParams(params);
                this.fillAppliedFilters();
                this.debounce = true;
                this.requestProducts();
              })
          );
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(this.categoryService.getCategoriesWithTypesError);
          console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (get Categories)! Code:${errorResponse.status}`);
        }
      }));
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
    this.router.navigate(['/',this.appLanguage,'catalog'], {
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
    this.router.navigate(['/',this.appLanguage,'catalog'], {
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
      window.scrollTo({top: 200, behavior: 'smooth'})
      this.router.navigate(['/',this.appLanguage,'catalog'], {
        queryParams: this.activeParams
      });

    }
  }

  clearFilters() {
    let clearParams: ActiveParamsType = {types: []};
    if (this.activeParams.sort) clearParams.sort = this.activeParams.sort;

    this.router.navigate(['/',this.appLanguage,'catalog'], {
      queryParams: clearParams
    });
  }

  requestProducts(){
    this.subscriptions$.add(this.productService.getProducts(this.activeParams).subscribe({
      next: (data: ProductsResponseType) => {
        if (data.error) {
          this.showSnackService.error(this.productService.getProductsError);
          throw new Error(data.message);
        }
        if (!data.response) return;
        this.products = data.response.products;
        this.activePage = data.response.page;
        this.pages = [];
        for (let i: number = 1; i <= data.response.totalPages; i++) this.pages.push(i);
        this.totalProducts = data.response.totalProducts;
        this.requestCartAndFavorites();
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.showSnackService.error(this.productService.getProductsError);
        console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (getProducts)! Code:${errorResponse.status}`);
      }
    }));
  }

  requestCartAndFavorites(){
    //Запрос корзины и избранного
    const cart$:Observable<CartResponseType|any> = this.cartService.getCart().pipe(catchError((err: HttpErrorResponse):Observable<any> => of({ __error: true, err } as any)));
    const favorites$:Observable<FavoritesResponseType|any> = this.authService.getIsLoggedIn()?this.favoriteService.getFavorites().pipe(catchError((err: HttpErrorResponse):Observable<any> => of({ __error: true, err } as any))):of(null);
    //Favorites of(null) если пользователь не залогинен
    const combinedRequest$: Observable<[CartResponseType | any, FavoritesResponseType | any]> = combineLatest([cart$,favorites$]);
    this.subscriptions$.add(combinedRequest$.subscribe({
      next:([cartResponse,favoritesResponse]:[CartResponseType | any, FavoritesResponseType | any])=>{
        if (cartResponse.__error) {
          const httpErr: HttpErrorResponse = cartResponse.err;
          if (httpErr.status !==401 && httpErr.status !== 403)this.showSnackService.error(httpErr.error.message, ReqErrorTypes.cartGetCart);
          console.error(httpErr.error.message?httpErr.error.message:`Unexpected error (GetCart)! Code:${httpErr.status}`);
        }else{
          const userCart: CartResponseType = (cartResponse as CartResponseType);
          if (userCart.cart) this.cartItems = userCart.cart.items;
        }
        if (favoritesResponse){
          if (favoritesResponse.__error) {
            const httpFavErr: HttpErrorResponse = favoritesResponse.err;
            console.error(httpFavErr.error.message ? httpFavErr.error.message : `Unexpected (get Favorites) error! Code:${httpFavErr.status}`);
          }else{
            const favoriteList:FavoritesResponseType = (favoritesResponse as FavoritesResponseType);
            if (favoriteList.favorites)this.favoriteProducts = favoriteList.favorites;
          }
        }//Если пользователь залогинен, то favoritesResponse != null
        this.showCartAndFavorites();
      },
      error:(error: HttpErrorResponse) => {
        this.showSnackService.error("Unexpected Request Error!");
        console.error(error.message);
      }
    }));
  }

  showCartAndFavorites(){
    if (!this.products.length) return;
    if ((this.cartItems && this.cartItems.length > 0) || (this.favoriteProducts && this.favoriteProducts.length > 0)) {
      this.products=this.products.map((productItem:ProductType)=>{
        if (this.cartItems && this.cartItems.length > 0){
          const productIndexInCart:number = this.cartItems.findIndex((cartItem:CartItemType)=>cartItem.product.id===productItem.id);
          if (productIndexInCart!==-1){
            productItem.countInCart = this.cartItems[productIndexInCart].quantity;
          }
        }//Обработка корзины
        if (this.favoriteProducts && this.favoriteProducts.length > 0){
          const productIndexInFav:number = this.favoriteProducts.findIndex((favItem:FavoriteProductType)=>favItem.id===productItem.id);
          if (productIndexInFav!==-1) productItem.isInFavorite = true;
        }//Обработка избранного
        return productItem;
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  protected readonly CategoryFilters = CategoryFilters;
}
