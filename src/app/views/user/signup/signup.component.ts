import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {DefaultResponseType} from '../../../../assets/types/responses/default-response.type';
import {ReqErrorTypes} from '../../../../assets/enums/auth-req-error-types.enum';
import {emailExistsValidator} from '../../../shared/validators/email-exists.validator';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {SignupTranslationType} from '../../../../assets/types/translations/signup-translation.type';
import {signupDialogTranslations, signupTranslations} from './signup.translations';
import {DialogBoxType} from '../../../../assets/types/dialog-box.type';
import {DlgWindowService} from '../../../shared/services/dlg-window.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy {
  private showSnackService:ShowSnackService = inject(ShowSnackService);
  private languageService:LanguageService=inject(LanguageService);
  private fb:FormBuilder = inject(FormBuilder);
  private authService:AuthService=inject(AuthService);
  private dlgWindowService: DlgWindowService = inject(DlgWindowService);

  private subscriptions$:Subscription=new Subscription();
  protected appLanguage:AppLanguages;
  protected translations:SignupTranslationType;
  private dialogContents: DialogBoxType;

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

  constructor() {
    this.appLanguage = this.languageService.appLang;
    this.translations = signupTranslations[this.appLanguage];
    this.dialogContents = signupDialogTranslations[this.appLanguage];
  }

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
        this.authService.signUp(this.signUpForm.value.email,this.signUpForm.value.password,this.signUpForm.value.passwordRepeat,this.signUpForm.value.agree)
          .subscribe({
            next: (data:DefaultResponseType)=> {
              if (data.error){
                this.showSnackService.error(data.message,ReqErrorTypes.authSignUp);
                throw new Error(data.message);
              }
              this.showSnackService.success(data.message);
              this.showDialog();
            },
            error: (errorResponse:HttpErrorResponse)=> {
              console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected Sign Up error! Code:${errorResponse.status}`);
              this.showSnackService.errorObj(errorResponse.error,ReqErrorTypes.authSignUp);
            },
          })
      );
    }
  }

  showDialog(redirect:boolean=true) {
    this.dlgWindowService.openDialog(this.dialogContents.title, this.dialogContents.content,redirect?['/',this.appLanguage,'login']:null);
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages)=>{
      if (this.appLanguage!==language){
        this.appLanguage = language;
        this.translations = signupTranslations[language];
        this.dialogContents = signupDialogTranslations[this.appLanguage];
        //this.showDialog(false);
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
