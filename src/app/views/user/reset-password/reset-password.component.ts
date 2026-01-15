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
import {DlgWindowService} from '../../../shared/services/dlg-window.service';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private showSnackService:ShowSnackService = inject(ShowSnackService);
  private languageService:LanguageService=inject(LanguageService);
  protected router:Router = inject(Router);
  private fb:FormBuilder = inject(FormBuilder);
  private dlgWindowService: DlgWindowService=inject(DlgWindowService);

  private subscriptions$:Subscription = new Subscription();
  appLanguage:AppLanguages;

  private userRequestService: UserRequestService = inject(UserRequestService);
  protected resetPassLink:string|null = null;
  private dialogContents={
    success:{
      title:'Письмо отправлено',
      content:'<div class="additional-title">Вы запустили процедуру сброса пароля.</div>' +
        '<div class="message-string">На указанный адрес электронной почты было отправлено письмо, содержащее ссылку для установки нового пароля.</div>\n' +
        '<div class="message-string">Если письмо не пришло в течение <u>нескольких минут</u>, пожалуйста, проверьте папку «Спам». В случае отсутствия письма, Вы можете повторить отправку через некоторое время.</div>',
    }
  }

  protected timer:string|null = null;

  protected requestSuccess:boolean = false;

  resetPassForm = this.fb.group({
    email:['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
  });

  constructor() {
    this.appLanguage = this.languageService.appLang;
  }
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
        this.dlgWindowService.openDialog(this.dialogContents.success.title,this.dialogContents.success.content);
        this.resetPassLink = data.mailLink?data.mailLink:null;

      },
      error: (errorResponse:HttpErrorResponse) => {
        this.requestSuccess = false;
        this.timer = null;
        if (errorResponse.error.timer)this.timer = ConverterUtils.secondsToMinutes(errorResponse.error.timer);
        this.showSnackService.error(errorResponse.error.message,ReqErrorTypes.authLogin);
        console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected error (reset password)! Code:${errorResponse.status}`);
      }
    }));
    }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
      if (this.appLanguage!==language)this.appLanguage = language;
    }));
    this.subscriptions$.add(this.userRequestService.resetPasswordCooldown$.subscribe((timer:string|null)=>{
      this.timer = timer?`(${timer})`:null;
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
