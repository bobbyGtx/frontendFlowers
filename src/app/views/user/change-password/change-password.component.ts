import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {UserRequestService} from '../../../core/user-request.service';
import {DlgWindowService} from '../../../shared/services/dlg-window.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private router: Router=inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private fb: FormBuilder = inject(FormBuilder);
  private userRequestService: UserRequestService = inject(UserRequestService);
  private dlgWindowService: DlgWindowService=inject(DlgWindowService);

  private subscriptions$: Subscription = new Subscription();
  protected rToken: string | null = null;
  protected requestSuccessful: boolean = false;
  private dialogContents={
      title:'Пароль изменен',
      content:'<div class="additional-title">Новый пароль успешно сохранен.</div>' +
        '<div class="message-string">Вы можете использовать новый пароль для входа в свою учетную запись.</div>\n',
  }

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
          this.changePassForm.reset();
          this.dlgWindowService.openDialog(this.dialogContents.title,this.dialogContents.content,'/login');
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.showSnackService.error(errorResponse.error.message, ReqErrorTypes.saveNewPassword);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected changePassword error! Code:${errorResponse.status}`);
        }
      }));

  }

  ngOnInit() {

    const lngParam:string|null = this.activatedRoute.snapshot.queryParams['lng']?this.activatedRoute.snapshot.queryParams['lng']:null;
    const rToken:string|null = this.activatedRoute.snapshot.queryParams['rToken']?this.activatedRoute.snapshot.queryParams['rToken']:null;

    if (!rToken || !lngParam) {
      this.router.navigate(['/404']);
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
              this.router.navigate(['/404']);
              return;
            }
          }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
