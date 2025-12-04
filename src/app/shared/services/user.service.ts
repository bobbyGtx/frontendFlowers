import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LanguageService} from '../../core/language.service';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';

export type userErrorsType = {
  checkPassword:{
    [key in AppLanguages]:string;
  },
}

@Injectable({providedIn: 'root'})

export class UserService {
  private http: HttpClient = inject(HttpClient);
  private languageService:LanguageService= inject(LanguageService);

  private userErrors:userErrorsType = {
    checkPassword: {
      [AppLanguages.ru]:'Ошибка проверки пароля.',
      [AppLanguages.en]:'Password verification error.',
      [AppLanguages.de]:'Fehler bei der Passwortprüfung.',
    }//500 error
    ,
  };
  get checkPasswordError(){
    return this.userErrors.checkPassword[this.languageService.appLang];
  }

  checkPassword(key:string):Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'pwdcheck.php',{key});
  }

}
