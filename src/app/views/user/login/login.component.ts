import {Component, inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ShowSnackService} from '../../../core/show-snack.service';
import {LoginResponseType} from '../../../../assets/types/responses/login-response.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {CartService} from '../../../shared/services/cart.service';
import {CartResponseType} from '../../../../assets/types/responses/cart-response.type';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  showSnackService:ShowSnackService = inject(ShowSnackService);
  router:Router = inject(Router);
  fb:FormBuilder = inject(FormBuilder);
  authService:AuthService=inject(AuthService);
  cartService:CartService=inject(CartService);
  subscriptions$:Subscription=new Subscription();

  loginForm: FormGroup=this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    password: ['', Validators.required],
    rememberMe: [false],
  });
  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  login():void{
    if (this.loginForm.valid && this.loginForm.value.email) {
      if (this.loginForm.value.password) {
        this.subscriptions$.add(this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
          .subscribe({
            next: (data: LoginResponseType) => {
              if (data.error || !data.user) {
                this.showSnackService.error(data.message, ReqErrorTypes.authLogin);
                throw new Error(data.message);
              }//Если ошибка есть - выводим её и завершаем функцию

              this.authService.setTokens(data.user.accessToken, data.user.refreshToken);
              this.authService.userId = data.user.userId;

              if (this.cartService.checkLSCart()){
                const request$ = this.cartService.rebaseCart(data.user.accessToken).subscribe({
                  next: (data: CartResponseType) => {
                    if (data.messages) this.showSnackService.infoObj(data);
                    else this.showSnackService.info(data.message);
                    request$.unsubscribe();
                  },
                  error: (data: CartResponseType) => {
                    console.error(data.message);
                  },
                });
              }
              this.showSnackService.success(data.message);
              this.router.navigate(['/']).then();
            },
            error: (errorResponse: HttpErrorResponse) => {
              console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected Login error! Code:${errorResponse.status}`);
              this.showSnackService.error(errorResponse.error.message, ReqErrorTypes.authLogin);
            }
          }));
      }
    }
  }
  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
