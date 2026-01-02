import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UserActionsResponseType} from '../../../../assets/types/responses/user-actions-response.type';
import {ConverterUtils} from '../../../shared/utils/converter.utils';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {UserRequestService} from '../../../core/user-request.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private showSnackService:ShowSnackService = inject(ShowSnackService);
  protected router:Router = inject(Router);
  private fb:FormBuilder = inject(FormBuilder);
  private subscriptions$:Subscription = new Subscription();
  private userRequestService: UserRequestService = inject(UserRequestService);
  protected resetPassLink:string|null = null;

  protected timer:string|null = null;

  protected requestSuccess:boolean = false;

  resetPassForm = this.fb.group({
    email:['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
  });
  get email() {
    return this.resetPassForm.get('email');
  }

  resetPassword():void{
    if (this.resetPassForm.invalid || !this.email || !this.email.value) return;
    this.timer = '...';
    this.subscriptions$.add(this.userRequestService.resetPassword(this.email.value).subscribe({
      next: (data:UserActionsResponseType) => {
        if (data.error) {
          this.showSnackService.error(this.userRequestService.resetPasswordError);
          throw new Error(data.message);
        }
        if (data.timer) this.timer = ConverterUtils.secondsToMinutes(data.timer);
        this.requestSuccess = true;
        this.resetPassLink = data.mailLink?data.mailLink:null;

      },
      error: (errorResponse:HttpErrorResponse) => {
        this.requestSuccess = false;
        if (errorResponse.error.timer)this.timer = ConverterUtils.secondsToMinutes(errorResponse.error.timer);
        this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.authLogin);
        console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (reset password)! Code:${errorResponse.status}`);
      }
    }));
    }


  ngOnInit() {
    this.subscriptions$.add(this.userRequestService.resetPasswordCooldown$.subscribe((timer:string|null)=>{
      this.timer = `(${timer})`;
    }));
  }
  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

}
