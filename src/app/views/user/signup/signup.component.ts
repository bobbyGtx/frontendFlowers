import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {emailExistsValidator} from '../../../shared/validators/email-exists.validator';

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

  signUpForm: FormGroup=this.fb.group({
    email: ['', {
      validators:[Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)],
      asyncValidators: [
        emailExistsValidator(()=>undefined)//для передачи актуального значения
      ],
      updateOn: 'blur'
    }
    ],
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

  protected showHidePassword(event:MouseEvent) {
    const svg = event.currentTarget as HTMLElement;
    const wrapper = svg.parentElement;
    const input = wrapper?.querySelector('input') as HTMLInputElement;
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  signUp(){
    if (this.signUpForm.valid && this.signUpForm.value.email && this.signUpForm.value.password && this.signUpForm.value.passwordRepeat && this.signUpForm.value.agree) {
      this.subscriptions$.add(
        this.authService.signUp(this.signUpForm.value.email,this.signUpForm.value.password,this.signUpForm.value.passwordRepeat,this.signUpForm.value.agree)
          .subscribe({
            next: (data:DefaultResponseType)=> {
              if (data.error){
                this.showSnackService.error(data.message,ReqErrorTypes.authSignUp);
                throw new Error(data.message);
              }
              this.showSnackService.success(data.message);
              this.router.navigate(['/login']);
            },
            error: (errorResponse:HttpErrorResponse)=> {
              console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected Sign Up error! Code:${errorResponse.status}`);
              this.showSnackService.errorObj(errorResponse.error,ReqErrorTypes.authSignUp);
            },
          })
      );
    }
  }
}
