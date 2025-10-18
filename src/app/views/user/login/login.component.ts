import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {LoginResponseType} from '../../../../types/responses/login-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  _snackbar:MatSnackBar = inject(MatSnackBar);
  router:Router = inject(Router);
  fb:FormBuilder = inject(FormBuilder);
  authService:AuthService=inject(AuthService);

  loginForm: FormGroup=this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^(([^<>()[\\].,;:\\s@"]+(\\.[^<>()[\\].,;:\\s@"]+)*)|(".+"))@(([^<>()[\\].,;:\\s@"]+\\.)+[^<>()[\\].,;:\\s@"]{2,})$/iu')]],
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
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email,this.loginForm.value.password, !!this.loginForm.value.rememberMe)
      .subscribe({
        next:(data:DefaultResponseType|LoginResponseType)=>{
          let error=null;
          if ((data as DefaultResponseType).error) {error=(data as DefaultResponseType).message;}
          const loginResponse:LoginResponseType = data as LoginResponseType;
          if (!loginResponse.user || !loginResponse.user.userId || !loginResponse.user.accessToken || !loginResponse.user.refreshToken || !loginResponse.user.firstName || !loginResponse.user.lastName) {
            error='Unexpected data from server. User section not found!';
          }
          if (error){
            this._snackbar.open(error,'ok');
            throw new Error(error);
          }//Если ошибка есть - выводим её и завершаем функцию

          this._snackbar.open('Успешная авторизация!','ok');
          this.router.navigate(['/']).then();
        },
        error: (errorResponse:HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message){
            this._snackbar.open(`Error: ${errorResponse.status} ${errorResponse.error.message}`,'Ok')
          }else{
            this._snackbar.open(`Error: ${errorResponse.status} Unexpected Login error!`, 'ok');
          }
        }
      })
    }


  }
}
