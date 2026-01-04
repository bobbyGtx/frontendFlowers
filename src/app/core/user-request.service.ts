import {inject, Injectable, OnDestroy} from '@angular/core';
import {AppLanguages} from '../../assets/enums/app-languages.enum';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {LanguageService} from './language.service';
import {
  BehaviorSubject, catchError,
  distinctUntilChanged,
  EMPTY,
  interval,
  Observable,
  Subject,
  Subscription,
  switchMap, tap, throwError
} from 'rxjs';
import {ConverterUtils} from '../shared/utils/converter.utils';
import {DefaultResponseType} from '../../assets/types/responses/default-response.type';
import {environment} from '../../environments/environment';
import {UserActionsResponseType} from '../../assets/types/responses/user-actions-response.type';
import {UserOperationsEnum} from '../../assets/enums/user-operations.enum';

export type userErrorsType = {
  resetPassword: { [key in AppLanguages]: string; },
  checkChangePassToken: { [key in AppLanguages]: string; },
  changeUserPassword: { [key in AppLanguages]: string; },
}

@Injectable({
  providedIn: 'root'
})
export class UserRequestService implements OnDestroy {
  private http: HttpClient = inject(HttpClient);
  private languageService: LanguageService = inject(LanguageService);
  private subscriptions$:Subscription = new Subscription();

  //Работа с обратным отсчётом по кд
  private resetPassCounter:number = 0;
  private verifyEmailCounter:number = 0;
  public resetPasswordCooldown$:Subject<string|null>=new Subject<string|null>();
  public verifyEmailCooldown$:Subject<string|null>=new Subject<string|null>();
  private timerActive$:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private interval$:Observable<number> = this.timerActive$.pipe(
    distinctUntilChanged(),
    switchMap((active:boolean) => {
      if (!active) return EMPTY;
      return interval(1000).pipe(
        tap(()=>{
          let stillActive = false;
          if (this.resetPassCounter > 0) {
            this.resetPassCounter--;
            this.resetPasswordCooldown$.next(this.resetPassCounter > 0 ? ConverterUtils.secondsToMinutes(this.resetPassCounter) : null);
            stillActive = true;
          }
          if (this.verifyEmailCounter > 0) {
            this.verifyEmailCounter--;
            this.verifyEmailCooldown$.next(this.verifyEmailCounter > 0 ? ConverterUtils.secondsToMinutes(this.verifyEmailCounter) : null);
            stillActive = true;
          }

          if (!stillActive) {
            this.timerActive$.next(false);
          }

        })
      )
    }),
  );
  //-------------------------------------------------------

  private userErrors: userErrorsType = {
    resetPassword: {
      [AppLanguages.ru]: 'Ошибка сброса пароля. Обратитесь в поддержку.',
      [AppLanguages.en]: 'Password reset error. Please contact support.',
      [AppLanguages.de]: 'Fehler beim Zurücksetzen des Passworts. Bitte wenden Sie sich an den Support.',
    },
    checkChangePassToken: {
      [AppLanguages.ru]: 'Запрашиваемая страница не найдена!',
      [AppLanguages.en]: 'The requested page was not found!',
      [AppLanguages.de]: 'Die angeforderte Seite wurde nicht gefunden!',
    },
    changeUserPassword: {
      [AppLanguages.ru]: 'Ошибка сохранения пароля! Обратитесь в поддержку.',
      [AppLanguages.en]: 'Error saving password! Please contact support.',
      [AppLanguages.de]: 'Fehler beim Speichern des Passworts! Bitte wenden Sie sich an den Support.',
    },
  };

  get resetPasswordError():string{
    return this.userErrors.resetPassword[this.languageService.appLang];
  }
  get checkChangePassTokenError():string{
    return this.userErrors.checkChangePassToken[this.languageService.appLang];
  }
  get changeUserPasswordError():string{
    return this.userErrors.changeUserPassword[this.languageService.appLang];
  }

  constructor() {
    this.subscriptions$.add(this.interval$.subscribe());//Разовая подписка на интервал
  }

  resetPassword(email:string):Observable<UserActionsResponseType> {
    return this.http.post<UserActionsResponseType>(environment.api + 'authActions.php', {
      operation:UserOperationsEnum.resetPass,
      email: email
    }).pipe(
      //Если есть интервал - запускаем обратный отсчет
      tap((data: UserActionsResponseType) => {
        if (data.timer){
          this.resetPassCounter = data.timer;
          this.timerActive$.next(true);
        } else this.resetPasswordCooldown$.next(null);
      }),
      catchError((errorResponse:HttpErrorResponse)=>{
        if (errorResponse.error.timer){
          ConverterUtils.secondsToMinutes(errorResponse.error.timer);
          this.resetPassCounter = errorResponse.error.timer;
          this.timerActive$.next(true);
        }else this.resetPasswordCooldown$.next(null);
        return throwError(()=>errorResponse);
      })
    );
  }

  checkResetPasswordToken(rToken:string):Observable<DefaultResponseType> {
    let params:HttpParams = new HttpParams();
    params = params.set('rToken', rToken);
    return this.http.get<DefaultResponseType>(environment.api + 'confirm.php', {params});
  }

  changeUserPassword(newPassword:string,newPasswordRepeat:string,rToken:string):Observable<DefaultResponseType> {
    let params:HttpParams = new HttpParams();
    params = params.set('rToken', rToken);
    return this.http.post<DefaultResponseType>(environment.api + 'confirm.php',{
      newPassword: newPassword,
      newPasswordRepeat: newPasswordRepeat
    },{params});
  }

  ngOnDestroy() {this.subscriptions$.unsubscribe();}
}
