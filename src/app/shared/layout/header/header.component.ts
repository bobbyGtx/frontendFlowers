import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {debounceTime, distinctUntilChanged, fromEvent, map, Subscription} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {Router} from '@angular/router';
import {ShowSnackService} from '../../../core/show-snack.service';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {CartService} from '../../services/cart.service';
import {ProductService} from '../../services/product.service';
import {ProductsResponseType} from '../../../../assets/types/responses/products-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {SearchProductsResponseType} from '../../../../assets/types/responses/search-products-response.type';
import {ProductType} from '../../../../assets/types/product.type';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchBox') private searchBox: ElementRef<HTMLInputElement>|null = null;
  @Input() categories: CategoryWithTypesType[] = [];
  imagesPath:string=environment.images;
  authService: AuthService = inject(AuthService);
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private cartService:CartService = inject(CartService);
  private productService:ProductService = inject(ProductService);
  router:Router=inject(Router);
  private subscriptions$: Subscription = new Subscription();
  isLogged: boolean=false;
  count:number=0;

  searchProducts:ProductType[]=[];
  showSearchResult:boolean=false;


  constructor() {}

  openProduct(productUrl:string):void {
    this.router.navigate(['/product/'+ productUrl]);
    this.searchProducts=[];
    if (this.searchBox) this.searchBox.nativeElement.value = '';
  }
  openSearchResult(showed:boolean):void {
    const timeout:ReturnType<typeof setInterval> = setTimeout(() => {
      this.showSearchResult = showed;
      clearTimeout(timeout);
    },100);//Откладывание закрытия бокса для срабатывания навигации
  }

  ngOnInit() {
    this.subscriptions$.add(
      this.authService.isLogged$.subscribe(isLoggedIn => {
        this.isLogged = isLoggedIn;
      }),
    );
    this.subscriptions$.add(
      this.cartService.getCartCount$().subscribe(cartCount => {
        this.count = cartCount;
      }),
    );
    this.subscriptions$.add(this.cartService.getCart().subscribe());//запрос корзины для рассчёта кол-ва.
  }
  ngAfterViewInit() {
    if (this.searchBox) {
      const inputEl:HTMLInputElement = this.searchBox.nativeElement;
      this.subscriptions$.add(
        fromEvent<InputEvent>(inputEl, 'input').pipe(
          map(event=> (event.target as HTMLInputElement).value),
          debounceTime(500),
          distinctUntilChanged()
        ).subscribe((searchStr) => {
          if (searchStr.length>2){
            this.subscriptions$.add(
              this.productService.searchProduct(searchStr).subscribe({
                next:(data:SearchProductsResponseType)=>{
                  if (data.error || !data.products){
                    this.showSnackService.error(this.productService.getSearchProductsError);
                    throw new Error(data.message);
                  }
                  if (Array.isArray(data.products)) this.searchProducts = data.products;
                  console.log(data.products);
                },
                error:(errorResponse:HttpErrorResponse)=>{
                  this.showSnackService.error(this.productService.getSearchProductsError);
                  console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (searchProducts)! Code:${errorResponse.status}`);
                }
              }));
          }
          else if (searchStr.length===0){
            this.searchProducts=[];
          }
        })
      );
    }
  }

  logout(): void {

    this.cartService.resetCartCount();
    this.subscriptions$.add(
      this.authService.logout()
        .subscribe({
          next: () => {this.doLogout();},
          error: () => {this.doLogout();}
        })
    );
  }

  doLogout():void{
    this.authService.removeTokens();
    this.authService.userId=null;
    this.showSnackService.success(`You have successfully logged out.`);
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

}
