import {inject, Injectable} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {LoginResponseType} from '../../../types/responses/login-response.type';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserType} from '../../../types/user.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http:HttpClient= inject(HttpClient);
  rememberMe:boolean=false;
  public accessTokenKey:string='accessToken';
  public refreshTokenKey:string='refreshToken';
  public userIdKey:string='userId';
  public isLogged$:Subject<boolean>=new Subject<boolean>();
  private isLogged:boolean=false;

  constructor() {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);

  }

  get userId():number|null{
    let userId:number|null=null;
    if (localStorage.getItem(this.userIdKey)) {
      userId = Number(localStorage.getItem(this.userIdKey))>0?Number(localStorage.getItem(this.userIdKey)):null;
    }else{
      userId = Number(sessionStorage.getItem(this.userIdKey))>0?Number(sessionStorage.getItem(this.userIdKey)):null;
    }
    return userId;
  }

  set userId(userId:number|null){
    if (userId){
      this.rememberMe?localStorage.setItem(this.userIdKey,String(userId)):sessionStorage.setItem(this.userIdKey,String(userId));
    }else{
      localStorage.removeItem(this.userIdKey);
      sessionStorage.removeItem(this.userIdKey);
    }
  }
  signUp(email:string,password:string, passwordRepeat:string):Observable<DefaultResponseType>{
        return this.http.post<DefaultResponseType>(environment.api+'register.php',{email,password,passwordRepeat});
  }
  login(email:string,password:string, rememberMe:boolean):Observable<DefaultResponseType|LoginResponseType>{
    this.rememberMe=rememberMe;
    return this.http.post<DefaultResponseType|LoginResponseType>(environment.api+'login.php',{email,password});
  }
  logout():Observable<DefaultResponseType>{
    const tokens = this.getTokens();
    if (tokens.refreshToken){
      return this.http.post<DefaultResponseType>(environment.api+'logout.php',{refreshToken:tokens.refreshToken});
    }
    throw throwError(()=>'Can not find token.');
  }
  public getIsLoggedIn(){
    return this.isLogged;
  }
  public setTokens(accessToken:string, refreshToken:string){
    if(this.rememberMe){
      localStorage.setItem(this.accessTokenKey,accessToken);
      localStorage.setItem(this.refreshTokenKey,refreshToken);
    }else{
      sessionStorage.setItem(this.accessTokenKey,accessToken);
      sessionStorage.setItem(this.refreshTokenKey,refreshToken);
    }
    this.isLogged=true;
    this.isLogged$.next(this.isLogged);
  }
  public getTokens():{accessToken:string|null, refreshToken:string|null}{
    if (!!localStorage.getItem(this.accessTokenKey)) {
      this.rememberMe=true;
      return{
        accessToken:localStorage.getItem(this.accessTokenKey),
        refreshToken:localStorage.getItem(this.refreshTokenKey)
      };
    } else {
      return {
        accessToken: localStorage.getItem(this.accessTokenKey),
        refreshToken: localStorage.getItem(this.refreshTokenKey)
      };
    }
  }

  public removeTokens(){
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.isLogged=false;
    this.rememberMe=false;
    this.isLogged$.next(this.isLogged);
  }
}
