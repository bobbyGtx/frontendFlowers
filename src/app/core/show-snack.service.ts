import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DefaultResponseType} from '../../types/responses/default-response.type';
import {SnackbarMessageComponent} from '../shared/components/snackbar-message/snackbar-message.component';
import {UserErrorsGroupType, UserErrorType, UserInfoMsgType, UserSuccessMsgType} from '../../types/user-errors.type';
import {ReqErrorTypes} from '../../enums/auth-req-error-types.enum';
import {AppLanguages} from '../../enums/app-languages.enum';
import {LanguageService} from './language.service';

type SnackSettingsType = {
  data?: {
    message: string;
    errors: string[]
  },
  duration: number,
  panelClass: string,
};

@Injectable({
  providedIn: 'root'
})
export class ShowSnackService {
  private _snackbar: MatSnackBar = inject(MatSnackBar);
  private languageService:LanguageService=inject(LanguageService);
  private errorSettings: SnackSettingsType = {
    duration: 8500,
    panelClass: 'snackbar-error',
  };
  private multiErrorSettings: SnackSettingsType = {
    data: {
      message: '',
      errors: [],
    },
    duration: 100000,
    panelClass: 'snackbar-error',
  };
  private successSettings: SnackSettingsType = {
    duration: 2500,
    panelClass: 'snackbar-success',
  };
  private infoSettings: SnackSettingsType = {
    duration: 2500,
    panelClass: 'snackbar-info',
  };

  private userErrors: UserErrorsGroupType = {
    [ReqErrorTypes.authLogin]: [
      {
        error: 'Email not correct!',
        [AppLanguages.ru]:'Введен некорректный E-Mail!',
        [AppLanguages.en]:'Entered email is incorrect!',
        [AppLanguages.de]:'Falsche E-Mail-Adresse eingegeben!',
      },
      {
        error: 'Password wrong!',
        [AppLanguages.ru]:'Пароль не верный!',
        [AppLanguages.en]:'Password wrong!',
        [AppLanguages.de]:'Falsches Passwort!',
      },
      {
        error: 'E-mail not found in DB!',
        [AppLanguages.ru]:'Пользователь с такой почтой не зарегистрирован!',
        [AppLanguages.en]:'User with this email is not registered!',
        [AppLanguages.de]:'Der Benutzer mit dieser E-Mail-Adresse ist nicht registriert!',
      },
      {
        error: 'User blocked!',
        [AppLanguages.ru]:'Пользователь заблокирован.',
        [AppLanguages.en]:'User blocked!',
        [AppLanguages.de]:'Das Konto wurde gesperrt.',
      },
      {
        error: 'default',
        [AppLanguages.ru]:'Ошибка авторизации. Обратитесь в поддержку.',
        [AppLanguages.en]:'Authorization error. Please contact support.',
        [AppLanguages.de]:'Autorisierungsfehler. Bitte wenden Sie sich an den Support.',
      },
    ],
    [ReqErrorTypes.authSignUp]: [
      {
        error: 'Data not Acceptable!',
        [AppLanguages.ru]:'Данные не соответствуют требованиям!',
        [AppLanguages.en]:'Data does not meet the requirements!',
        [AppLanguages.de]:'Die Daten erfüllen die Anforderungen nicht!',
      },
      {
        error: 'User with this email is already registered!',
        [AppLanguages.ru]:'Пользователь с таким E-mail уде зарегистрирован!',
        [AppLanguages.en]:'User with this email is already registered!',
        [AppLanguages.de]:'Dieser Benutzer ist bereits registriert!',
      },
      {
        error: 'default',
        [AppLanguages.ru]:'Введен некорректный E-Mail!',
        [AppLanguages.en]:'Registration error. Please try again.',
        [AppLanguages.de]:'Registrierungsfehler. Bitte versuchen Sie es erneut.',
      }
    ]
  };//ошибки
  private userValidMessages:Array<UserInfoMsgType> = [
    {
      info:'E-Mail is incorrect',
      [AppLanguages.ru]:'E-Mail не корректен',
      [AppLanguages.en]:'E-Mail is incorrect',
      [AppLanguages.de]:'Die E-Mail-Adresse ist falsch',
    },
    {
      info:'Password is too short',
      [AppLanguages.ru]:'Пароль слишком короткий',
      [AppLanguages.en]:'Password is too short',
      [AppLanguages.de]:'Das Passwort ist zu kurz',
    },
    {
      info:'Passwords don\'t match',
      [AppLanguages.ru]:'Пароли не совпадают',
      [AppLanguages.en]:'Passwords don\'t match',
      [AppLanguages.de]:'Die Passwörter stimmen nicht überein',
    },
    {
      info:'Agreements not accepted',
      [AppLanguages.ru]:'Условия не приняты',
      [AppLanguages.en]:'greements not accepted',
      [AppLanguages.de]:'Bedingungen nicht akzeptiert',
    },
  ];//сообщения валидации
  private userSuccess:Array<UserSuccessMsgType> = [
    {
      success:'Authorization success!',
      [AppLanguages.ru]:'Успешная авторизация!',
      [AppLanguages.en]:'Authorization success!',
      [AppLanguages.de]:'Autorisierung erfolgreich!',
    },
    {
      success:'You have successfully logged out.',
      [AppLanguages.ru]:'Вы успешно вышли из системы.',
      [AppLanguages.en]:'You have successfully logged out.',
      [AppLanguages.de]:'Sie haben sich erfolgreich abgemeldet.',
    },
    {
      success:'User registered!',
      [AppLanguages.ru]:'Регистрация прошла успешно. Войдите в систему.',
      [AppLanguages.en]:'You have successfully logged out.',
      [AppLanguages.de]:'Sie haben sich erfolgreich abgemeldet.',
    }
  ];//Подтверждения
  private userInfos:Array<UserInfoMsgType> = [
    {
      info:'You have successfully logged out.',
      [AppLanguages.ru]:'Вы успешно вышли из системы.',
      [AppLanguages.en]:'You have successfully logged out.',
      [AppLanguages.de]:'Sie haben sich erfolgreich abgemeldet.',
    },

  ];//Информационные сообщения

  private getUserError(reqType: ReqErrorTypes, message: string): string {
    const errorIndex: number = this.userErrors[reqType].findIndex((errorItem: UserErrorType) => errorItem.error.toLowerCase() === message.toLowerCase());
    if (errorIndex === -1) {
      return this.userErrors[reqType][this.userErrors[reqType].length - 1][this.languageService.appLang]?this.userErrors[reqType][this.userErrors[reqType].length - 1][this.languageService.appLang]:message;
    } else {
      return this.userErrors[reqType][errorIndex][this.languageService.appLang];
    }
  }
  private getUserSuccessMsg(message: string): string {
    const itemIndex:number = this.userSuccess.findIndex(item=>item.success.toLowerCase() === message.toLowerCase());
    if (itemIndex >= 0) message = this.userSuccess[itemIndex][AppLanguages.de];
    return message;
  }
  private getUserInfoMsg(message: string): string {
    const itemIndex:number = this.userInfos.findIndex(item=>item.info.toLowerCase() === message.toLowerCase());
    if (itemIndex >= 0) message = this.userInfos[itemIndex][this.languageService.appLang];
    return message;
  }
  private getUserValidMessages(messages:string[]):string[]{
    messages = messages.map((message:string)=>{
      const itemIndex:number = this.userValidMessages.findIndex((errorItem:UserInfoMsgType)=>errorItem.info.toLowerCase() === message.toLowerCase());
      return itemIndex ===-1 ? message:this.userValidMessages[itemIndex][this.languageService.appLang];
    });
    return messages;
  }

  error(message: string, reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (reqType) message = this.getUserError(reqType, message);
    code ? message = `${message}  Code: ${code}` : null;
    this._snackbar.open(message, 'ok', this.errorSettings);
  }//Simple error with string

  errorObj(error: DefaultResponseType,reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (reqType) error.message = this.getUserError(reqType,error.message);
    const errMessage = code ? `${error.message}  Code: ${code}` : error.message;
    if (error.messages && Array.isArray(error.messages) && error.messages.length > 0) {
      let multiErrorSettings: SnackSettingsType = this.multiErrorSettings;
      multiErrorSettings['data']!['message'] = error.message;
      multiErrorSettings['data']!['errors'] = this.getUserValidMessages(error.messages);
      this._snackbar.openFromComponent(SnackbarMessageComponent, multiErrorSettings);
    } else {
      this._snackbar.open(errMessage, 'ok', this.errorSettings);
    }
  }//Simple error msg & messages[]?

  success(message: string): void {
    this._snackbar.open(this.getUserSuccessMsg(message), 'ok', this.successSettings);
  }

  info(message: string): void {
    this._snackbar.open(this.getUserInfoMsg(message), 'ok', this.infoSettings);
  }
}
