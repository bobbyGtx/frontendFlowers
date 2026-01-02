import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {UserRequestService} from '../../../core/user-request.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private fb: FormBuilder = inject(FormBuilder);
  private userRequestService: UserRequestService = inject(UserRequestService);
  private subscriptions$: Subscription = new Subscription();
  private rToken: string | null = null;
  protected requestSuccessful: boolean = false;

  changePassForm = this.fb.group({
    password: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
    passwordRepeat: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]]
  });

  get password() {
    return this.changePassForm.get('password');
  }

  get passwordRepeat() {
    return this.changePassForm.get('passwordRepeat');
  }

  changePassword() {
    if (this.changePassForm.invalid || !this.password || !this.password.value || !this.passwordRepeat || !this.passwordRepeat.value || !this.rToken) return;
    this.subscriptions$.add(
      this.userRequestService.changeUserPassword(this.password.value, this.passwordRepeat.value, this.rToken).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.userRequestService.changeUserPasswordError);
            throw new Error(data.message);
          }
          this.showSnackService.success(data.message);
          this.requestSuccessful = true;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(errorResponse.error.message, ReqErrorTypes.saveNewPassword);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected changePassword error! Code:${errorResponse.status}`);
        }
      }));

  }

  protected showHidePassword(event: MouseEvent) {
    const svg = event.currentTarget as HTMLElement;
    const wrapper = svg.parentElement;
    const input = wrapper?.querySelector('input') as HTMLInputElement;
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  ngOnInit() {
    const lngParam:string|null = this.activatedRoute.snapshot.params['lng']?this.activatedRoute.snapshot.params['lng']:null;
    const rToken:string|null = this.activatedRoute.snapshot.params['rToken']?this.activatedRoute.snapshot.params['rToken']:null;
    if (!rToken || !lngParam) {
      this.showSnackService.error(this.userRequestService.checkChangePassTokenError);
      //Переход на страницу 404
      return;
    }
    //Проверка токена на сервере
    this.subscriptions$.add(
      this.userRequestService.checkResetPasswordToken(rToken).subscribe({
            next: (data: DefaultResponseType) => {
              if (data.error) {
                this.showSnackService.error(this.userRequestService.checkChangePassTokenError);
                throw new Error(data.message);
              }
              this.rToken = rToken;
            },
            error: () => {
              this.showSnackService.error(this.userRequestService.checkChangePassTokenError);
              //Переход на страницу 404
            }
          }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
