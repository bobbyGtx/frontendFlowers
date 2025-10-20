import {Component, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {Subscription} from 'rxjs';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  _snackbar:MatSnackBar = inject(MatSnackBar);
  router:Router = inject(Router);
  fb:FormBuilder = inject(FormBuilder);
  authService:AuthService=inject(AuthService);
  subscriptions$:Subscription=new Subscription();

  signUpForm: FormGroup=this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    password: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
    passwordRepeat: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
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
                if (data.messages && Array.isArray(data.messages.length) && data.messages.length > 0){
                  console.log(data.message,data.messages);
                  this._snackbar.open(`${data.message}. ${data.messages}`,'ok');
                }else{
                  this._snackbar.open(data.message,'ok');
                }
                throw new Error(data.message);
              }

              this._snackbar.open('Регистрация прошла успешно. Войдите в систему.','ok');
              this.router.navigate(['/login']);
            },
            error: (errorResponse:HttpErrorResponse)=> {
              if (errorResponse.error && errorResponse.error.message){
                this._snackbar.open(`${errorResponse.error.message}`,'Ok')
              }else{
                this._snackbar.open(`Error: ${errorResponse.status} Unexpected Sign Up error!`, 'ok');
              }
            },
          })
      );
    }
  }
}
