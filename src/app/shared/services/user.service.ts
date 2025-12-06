import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LanguageService} from '../../core/language.service';
import {map, Observable} from 'rxjs';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {environment} from '../../../environments/environment';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {UserDataResponseType} from '../../../assets/types/responses/user-data-response.type';
import {ResponseDataValidator} from '../utils/response-data-validator.util';
import {UserDataType, UserType} from '../../../assets/types/user-data.type';

export type userErrorsType = {
  checkPassword:{
    [key in AppLanguages]:string;
  },
  getUserData:{
    [key in AppLanguages]:string;
  },
  postUserData:{
    [key in AppLanguages]:string;
  },
}

@Injectable({providedIn: 'root'})

export class UserService {
  private http: HttpClient = inject(HttpClient);
  private languageService:LanguageService= inject(LanguageService);

  private userDataTemplate:UserType = {
    id: 0,
    email: '',
    paymentType_id: null,
    deliveryType_id: null,
    deliveryInfo: null,
    firstName: null,
    lastName: null,
    phone: null,
    emailVerification: false,
  };

  private userErrors:userErrorsType = {
    checkPassword: {
      [AppLanguages.ru]:'Ошибка проверки пароля.',
      [AppLanguages.en]:'Password verification error.',
      [AppLanguages.de]:'Fehler bei der Passwortprüfung.',
    },//500 error
    getUserData:{
      [AppLanguages.ru]:'Ошибка получения данных пользователя. Попробуйте ещё раз',
      [AppLanguages.en]:'Error retrieving user data. Please try again',
      [AppLanguages.de]:'Fehler beim Abrufen der Benutzerdaten. Bitte versuchen Sie es erneut',
    },
    postUserData:{
      [AppLanguages.ru]:'Ошибка изменения данных пользователя. Попробуйте ещё раз',
      [AppLanguages.en]:'Error changing user data. Please try again',
      [AppLanguages.de]:'Fehler beim Ändern der Benutzerdaten. Bitte versuchen Sie es erneut',
    },
  };
  get checkPasswordError(){
    return this.userErrors.checkPassword[this.languageService.appLang];
  }
  get getUserDataError(){
    return this.userErrors.getUserData[this.languageService.appLang];
  }
  get postUserDataError(){
    return this.userErrors.postUserData[this.languageService.appLang];
  }

  checkPassword(key:string):Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'pwdcheck.php',{key});
  }

  getUserData():Observable<UserDataResponseType>{
    return this.http.get<UserDataResponseType>(environment.api + 'user.php').pipe(
      map((response:UserDataResponseType) => {
        if (response.error) return response;
        if (!response.user || !ResponseDataValidator.validateRequiredFields(this.userDataTemplate,response.user)){
          response.error=true;//Эта ошибка для консоли
          response.message = 'getUserData error. User data was not found in the server response or has an invalid structure.';
          return response;
        }
        response.userData = this.createUserDataProperty(response.user);
        return response;
      })
    );
  }
  /*
  *Функуия распаковывает полученное с сервера поле "deliveryInfo" в json формате
  * и распаковывает данные в отдельные поля для удобства работы
   */
  createUserDataProperty(user: UserType):UserDataType{
    return {
      id: user.id,
      email: user.email,
      paymentType_id: user.paymentType_id?user.paymentType_id:0,
      deliveryType_id: user.deliveryType_id?user.deliveryType_id:0,
      region:user.deliveryInfo?.region?user.deliveryInfo?.region:'',
      zip:user.deliveryInfo?.zip?user.deliveryInfo?.zip:'',
      city:user.deliveryInfo?.city?user.deliveryInfo?.city:'',
      street:user.deliveryInfo?.street?user.deliveryInfo?.street:'',
      house:user.deliveryInfo?.house?user.deliveryInfo?.house:'',
      firstName: user.firstName?user.firstName:'',
      lastName: user.lastName?user.lastName:'',
      phone: user.phone?user.phone:'',
      emailVerification:user.emailVerification,
    }
  }
}
