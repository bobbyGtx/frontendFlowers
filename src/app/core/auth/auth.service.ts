import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {LoginResponseType} from '../../../types/responses/login-response.type';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http:HttpClient= inject(HttpClient);
  rememberMe:boolean=false;

  constructor() { }
  login(email:string,password:string, rememberMe:boolean):Observable<DefaultResponseType|LoginResponseType>{
    this.rememberMe=rememberMe;
    return this.http.post<DefaultResponseType|LoginResponseType>(environment.api+'/login',{email,password});
  }
}
