import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {Subscription} from 'rxjs';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  showSnackService:ShowSnackService = inject(ShowSnackService);
  router:Router = inject(Router);
  fb:FormBuilder = inject(FormBuilder);
  authService:AuthService=inject(AuthService);
  subscriptions$:Subscription=new Subscription();

  // signUpForm: FormGroup=this.fb.group({
  //   email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
  //   password: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
  //   passwordRepeat: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
  //   agree: [false, Validators.requiredTrue],
  // });
  signUpForm: FormGroup=this.fb.group({
    email: ['', Validators.required ],
    password: ['', Validators.required],
    passwordRepeat: ['', Validators.required],
    agree: [false, Validators.requiredTrue],
  });

  get email() {
    return this.signUpForm.get('email');
  }
  get password() {
    return this.signUpForm.get('password');
  }
  get passwordRepeat() {
    return this.signUpForm.get('passwordRepeat');
  }
  get agree() {
    return this.signUpForm.get('agree');
  }

  signUp(){
    if (this.signUpForm.valid && this.signUpForm.value.email && this.signUpForm.value.password && this.signUpForm.value.passwordRepeat && this.signUpForm.value.agree) {
      this.subscriptions$.add(
        this.authService.signUp(this.signUpForm.value.email,this.signUpForm.value.password,this.signUpForm.value.passwordRepeat)
          .subscribe({
            next: (data:DefaultResponseType)=> {
              if (data.error){
                this.showSnackService.error(data.message);
                throw new Error(data.message);
              }
              this.showSnackService.success('Регистрация прошла успешно. Войдите в систему.');
              this.router.navigate(['/login']);
            },
            error: (errorResponse:HttpErrorResponse)=> {
              if (errorResponse.error && errorResponse.error.message){
                //тут может прийти ответ с массивом ошибок
                this.showSnackService.errorObj(errorResponse.error);
              }else{
                this.showSnackService.error(`Unexpected Sign Up error!`,errorResponse.status);
              }
            },
          })
      );
    }
  }
}
