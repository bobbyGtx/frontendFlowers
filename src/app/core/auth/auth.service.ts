import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponseDataValidator} from '../../shared/utils/response-data-validator.util';
import {UserType} from '../../../assets/types/user.type';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {LoginResponseType} from '../../../assets/types/responses/login-response.type';

@Injectable({providedIn: 'root'})

export class AuthService {
  http: HttpClient = inject(HttpClient);
  rememberMe: boolean = false;
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';
  public isLogged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  userTemplate: UserType = {
    userId: 0,
    accessToken: '',
    refreshToken: '',
  }

  constructor() {
    this.isLogged$.next(!!localStorage.getItem(this.accessTokenKey));
  }

  get userId(): number | null {
    let userId: number | null;
    if (localStorage.getItem(this.userIdKey)) {
      userId = Number(localStorage.getItem(this.userIdKey)) > 0 ? Number(localStorage.getItem(this.userIdKey)) : null;
    } else {
      userId = Number(sessionStorage.getItem(this.userIdKey)) > 0 ? Number(sessionStorage.getItem(this.userIdKey)) : null;
    }
    return userId;
  }

  set userId(userId: number | null) {
    if (userId) {
      this.rememberMe ? localStorage.setItem(this.userIdKey, String(userId)) : sessionStorage.setItem(this.userIdKey, String(userId));
    } else {
      localStorage.removeItem(this.userIdKey);
      sessionStorage.removeItem(this.userIdKey);
    }
  }

  signUp(email: string, password: string, passwordRepeat: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'register.php', {email, password, passwordRepeat});
  }

  login(email: string, password: string, rememberMe: boolean): Observable<LoginResponseType> {
    this.rememberMe = rememberMe;
    return this.http.post<LoginResponseType>(environment.api + 'login.php', {email, password})
      .pipe(
        map((response: LoginResponseType): LoginResponseType => {
          if (response.error) return response
          //Если от сервера пришел нормальный ответ, но данные потеряны
          if (!response.user || !ResponseDataValidator.validateRequiredFields(this.userTemplate, response.user)) {
            response.error = true;
            response.message = 'Login error. User data not found in response or have invalid structure.';
          }
          return response;
        })
      );
  }

  logout(): Observable<DefaultResponseType> {

    const tokens = this.getTokens();
    if (tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + 'logout.php', {refreshToken: tokens.refreshToken});
    }
    throw throwError(() => 'Can not find token.');
  }

  public setTokens(accessToken: string, refreshToken: string) {
    if (this.rememberMe) {
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } else {
      sessionStorage.setItem(this.accessTokenKey, accessToken);
      sessionStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    this.isLogged$.next(true);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    if (!!localStorage.getItem(this.accessTokenKey)) {
      this.rememberMe = true;
      return {
        accessToken: localStorage.getItem(this.accessTokenKey),
        refreshToken: localStorage.getItem(this.refreshTokenKey)
      };
    } else {
      return {
        accessToken: sessionStorage.getItem(this.accessTokenKey),
        refreshToken: sessionStorage.getItem(this.refreshTokenKey)
      };
    }
  }

  public removeTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.isLogged$.next(false);
    this.rememberMe = false;
  }
}
