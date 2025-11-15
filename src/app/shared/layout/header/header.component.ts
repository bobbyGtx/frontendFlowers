import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {Router} from '@angular/router';
import {ShowSnackService} from '../../../core/show-snack.service';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {CartService} from '../../services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() categories: CategoryWithTypesType[] = [];
  authService: AuthService = inject(AuthService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  cartService:CartService = inject(CartService);
  router:Router=inject(Router);
  subscriptions$: Subscription = new Subscription();
  isLogged: boolean=false;
  count:number=0;

  constructor() {}

  ngOnInit() {
    this.subscriptions$.add(
      this.authService.isLogged$.subscribe(isLoggedIn => {
        if (!this.isLogged && isLoggedIn){
          this.subscriptions$.add(
            this.cartService.getCart().subscribe({
              next: (data: CartResponseType) => {
                //Может быть error с нормальным ответом при проблемах с товарами
                if (data.error && !data.cart) {
                  this.showSnackService.error(this.cartService.getCartError);
                  throw new Error(data.message);
                }//Если ошибка есть и нет корзины в ответе - выводим её и завершаем функцию
                //if (data.error && data.cart) this.showSnackService.info(data.message);Инфо сообщение выводим только в сервисе
              },
              error: (errorResponse: HttpErrorResponse) => {
                this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.cartGetCart);
                console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected (get Cart) error! Code:${errorResponse.status}`);
              }
            })
          );
        }//Если мы сменили статус на залогинен, то ищем корзину
        this.isLogged = isLoggedIn;
      }),
    );
    this.subscriptions$.add(
      this.cartService.getCartCount$().subscribe(cartCount => {
        this.count = cartCount;
      }),
    );
  }

  logout(): void {
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
