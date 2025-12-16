import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler, HttpHeaders,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {catchError, finalize, Observable, switchMap, throwError} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {Config} from '../../shared/config';
import {LanguageService} from '../language.service';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {LoginResponseType} from '../../../assets/types/responses/login-response.type';
import {ShowSnackService} from '../show-snack.service';
import {ReqErrorTypes} from '../../../assets/enums/auth-req-error-types.enum';
import {Router} from '@angular/router';
import {LoaderService} from '../../shared/services/loader.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService: AuthService = inject(AuthService);
  private loaderService: LoaderService = inject(LoaderService);
  private languageService: LanguageService = inject(LanguageService);
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private router: Router = inject(Router);

  /*
  * Добавление language хедера к запросу и accessToken,
  * если получаем в ответе ошибку 401, то пробуем отправить рефреш токен и повторить запрос
  * с новым accessToken
  * */

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.loaderShow();
    const tokens: { accessToken: string | null, refreshToken: string | null } = this.authService.getTokens();
    const language: AppLanguages = this.languageService.appLang;
    let headers:HttpHeaders = req.headers.set(Config.reqLanguageHeader, language);
    if (!tokens || !tokens.accessToken || req.url.includes('/login')||req.url.includes('/signup')||req.url.includes('/refresh')){
      return next.handle(req.clone({headers})).pipe(finalize(() => {this.loaderService.loaderHide();}));
    }
    headers = headers.set(Config.accessTokenHeader, tokens.accessToken);
    const newReq = req.clone({headers});//Клонируем запрос и добавляем хедер языка
    return next.handle(newReq).pipe(
      catchError((error: HttpErrorResponse) => {
        //берем ошибочный ответ и проверяем на 401 код
        if (error.status === 401 && !newReq.url.includes('/login.php') && !newReq.url.includes('/signup.php') && !newReq.url.includes('/refresh')) {
          this.loaderService.loaderHide();
          return this.handle401Error(newReq, next);
        }
        if (error.status === 403){
          this.showSnackService.error(error.message,ReqErrorTypes.authLogin);
          this.authService.removeTokens();
          this.router.navigate(['/']);
          return throwError(() => error);
        }//Обработка блокировки пользователя
        return throwError(() => error);//Возврат ошибки
      }),
      finalize(() => {
        this.loaderService.loaderHide();
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.refresh()
      .pipe(
        switchMap((data:LoginResponseType)=>{
          if (data.error || !data.user) {
            this.showSnackService.error(data.message, ReqErrorTypes.authLogin);
            return throwError(()=>new Error(data.message));//генерация observable ошибки
          }//Если ошибка есть и нет пользователя - выводим её и завершаем функцию
          this.authService.setTokens(data.user.accessToken, data.user.refreshToken);

          const newReq = req.clone({
            headers: req.headers.set(Config.accessTokenHeader, data.user.accessToken),
          });//Клонируем запрос и добавляем новый accessToken
          return next.handle(newReq);
        }),
        catchError(error=>{
          if (error.status === 401) {
            this.showSnackService.error(error.message,ReqErrorTypes.authLogin);
          }
          this.authService.removeTokens();
          this.router.navigate(['/']);
          return throwError(() => error);
        }),
        finalize(() => {
          this.loaderService.loaderHide();
        })
      );
  }

}
