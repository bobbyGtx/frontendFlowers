import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackbarMessageComponent} from '../shared/components/snackbar-message/snackbar-message.component';
import {LanguageService} from './language.service';
import {
  UserErrorsGroupType,
  UserErrorType,
  UserInfoMsgType,
  UserSuccessMsgType
} from '../../assets/types/user-errors.type';
import {ReqErrorTypes} from '../../assets/enums/auth-req-error-types.enum';
import {AppLanguages} from '../../assets/enums/app-languages.enum';
import {DefaultResponseType} from '../../assets/types/responses/default-response.type';

type SnackSettingsType = {
  data?: {
    message: string;
    dlgType:string;
    messages: string[]
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
      dlgType: 'snackbar-error',
      messages: [],
    },
    duration: 100000,
    panelClass: 'snackbar-error',
  };
  private multiInfoSettings: SnackSettingsType = {
    data: {
      message: '',
      dlgType: 'snackbar-info',
      messages: [],
    },
    duration: 7000,
    panelClass: 'snackbar-info',
  };
  private successSettings: SnackSettingsType = {
    duration: 2500,
    panelClass: 'snackbar-success',
  };
  private infoSettings: SnackSettingsType = {
    duration: 3500,
    panelClass: 'snackbar-info',
  };

  private userGroupErrors: UserErrorsGroupType = {
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
        [AppLanguages.ru]:'Пользователь с таким E-mail уже зарегистрирован!',
        [AppLanguages.en]:'User with this email is already registered!',
        [AppLanguages.de]:'Dieser Benutzer ist bereits registriert!',
      },
      {
        error: 'default',
        [AppLanguages.ru]:'Введен некорректный E-Mail!',
        [AppLanguages.en]:'Registration error. Please try again.',
        [AppLanguages.de]:'Registrierungsfehler. Bitte versuchen Sie es erneut.',
      }
    ],
    [ReqErrorTypes.cartGetCart]:[
      {
        error: 'default',
        [AppLanguages.ru]:'Ошибка при запросе корзины. Обновите страницу.',
        [AppLanguages.en]:'Error requesting cart. Please refresh the page.',
        [AppLanguages.de]:'Fehler beim Anfordern des Warenkorbs. Bitte aktualisieren Sie die Seite.',
      }
    ],
    [ReqErrorTypes.cartUpdate]:[
      {
        error: 'User with this email is already registered!',
        [AppLanguages.ru]:'Пользователь с таким E-mail уде зарегистрирован!',
        [AppLanguages.en]:'User with this email is already registered!',
        [AppLanguages.de]:'Dieser Benutzer ist bereits registriert!',
      },
      {
        error: 'default',
        [AppLanguages.ru]: 'Ошибка изменения корзины. Повторите попытку.',
        [AppLanguages.en]: 'Error editing cart. Please try again.',
        [AppLanguages.de]: 'Fehler beim Ändern des Warenkorbs. Bitte versuchen Sie es erneut.',
      }
    ],
    [ReqErrorTypes.cartRebase]:[
      {
        error: 'Request parameters not recognized!',
        [AppLanguages.ru]:'Ошибка! Перенос локальной корзины не выполнен.',
        [AppLanguages.en]:'Error! Local Cart Bin migration failed.',
        [AppLanguages.de]:'Fehler! Migration des lokalen Warenkorb fehlgeschlagen.',
      },
      {
        error: 'Cart rebase impossible. User have a cart!',
        [AppLanguages.ru]:'Перебазирование корзины невозможно. У пользователя есть корзина!',
        [AppLanguages.en]:'Cart rebase impossible. User have a cart!',
        [AppLanguages.de]:'Warenkorb-Rebase nicht möglich. Der Nutzer hat einen Warenkorb!',
      },
      {
        error: 'Products not found!',
        [AppLanguages.ru]:'Продукты из локальной корзины не корректны!',
        [AppLanguages.en]:'Products from local cart are incorrect!',
        [AppLanguages.de]:'Die Produkte im lokalen Warenkorb sind falsch!',
      },
      {
        error: 'Unrecognized products were removed.',
        [AppLanguages.ru]:'Найдены и удалены не корректные родукты из корзины!',
        [AppLanguages.en]:'Incorrect products found and removed from cart!',
        [AppLanguages.de]:'Falsche Produkte gefunden und aus dem Warenkorb entfernt!',
      },
      {
        error: 'default',
        [AppLanguages.ru]:'Ошибка переноса корзины на сервер!',
        [AppLanguages.en]:"Error transferring user's cart to the server!",
        [AppLanguages.de]:'Fehler beim Übertragen des Warenkorbs an den Server!',
      }
    ],//Вывод ошибок снакбаром отключен в логине

  };//ошибки сгруппированные по запросам

  private userMessages:Array<UserInfoMsgType> = [
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
      info:"Passwords don't match",
      [AppLanguages.ru]:'Пароли не совпадают',
      [AppLanguages.en]:"Passwords don't match",
      [AppLanguages.de]:'Die Passwörter stimmen nicht überein',
    },
    {
      info:'Agreements not accepted',
      [AppLanguages.ru]:'Условия не приняты',
      [AppLanguages.en]:'Agreements not accepted',
      [AppLanguages.de]:'Bedingungen nicht akzeptiert',
    },
    {//это сообщение дублируется т.к. в разных запросах и в разных переменных
      info:'Unrecognized products were removed.',
      [AppLanguages.ru]:'Нераспознанные продукты были удалены из корзины.',
      [AppLanguages.en]:'Unrecognized products have been removed from cart.',
      [AppLanguages.de]:'Nicht erkannte Produkte wurden aus Ihrem Warenkorb entfernt.',
    },
  ];//сообщения из переменной [messages]
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
    },{
      info:'Cart has been rebased!',
      [AppLanguages.ru]:'Ваша корзина перемещена на сервер!',
      [AppLanguages.en]:'Your cart has been moved to the server!',
      [AppLanguages.de]:'Ihr Warenkorb wurde auf den Server übertragen!',
    },{
      info:'Unrecognized products were removed.',
      [AppLanguages.ru]:'Нераспознанные продукты были удалены из корзины.',
      [AppLanguages.en]:'Unrecognized products have been removed from cart.',
      [AppLanguages.de]:'Nicht erkannte Produkte wurden aus Ihrem Warenkorb entfernt.',
    },
    {
      info:'Cart has been cleared by the system.',
      [AppLanguages.ru]:'Корзина очищена системой.',
      [AppLanguages.en]:'Cart has been cleared by the system.',
      [AppLanguages.de]:'Der Warenkorb wurde vom System geleert.',
    },

  ];//Информационные сообщения

  private getUserGroupError(reqType: ReqErrorTypes, message: string): string {
    const errorIndex: number = this.userGroupErrors[reqType].findIndex((errorItem: UserErrorType) => errorItem.error.toLowerCase() === message.toLowerCase());
    if (errorIndex === -1) {
      return this.userGroupErrors[reqType][this.userGroupErrors[reqType].length - 1][this.languageService.appLang]?this.userGroupErrors[reqType][this.userGroupErrors[reqType].length - 1][this.languageService.appLang]:message;
    } else {
      return this.userGroupErrors[reqType][errorIndex][this.languageService.appLang];
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
      const itemIndex:number = this.userMessages.findIndex((errorItem:UserInfoMsgType)=>errorItem.info.toLowerCase() === message.toLowerCase());
      return itemIndex ===-1 ? message:this.userMessages[itemIndex][this.languageService.appLang];
    });
    return messages;
  }

  error(message: string, reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (message.length<2) return;
    if (reqType) message = this.getUserGroupError(reqType, message);
    code ? message = `${message}  Code: ${code}` : null;
    this._snackbar.open(message, 'ok', this.errorSettings);
  }//Simple error with string

  errorObj(error: DefaultResponseType,reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (reqType) error.message = this.getUserGroupError(reqType,error.message);
    const errMessage = code ? `${error.message}  Code: ${code}` : error.message;
    if (error.messages && Array.isArray(error.messages) && error.messages.length > 0) {
      let multiErrorSettings: SnackSettingsType = this.multiErrorSettings;
      multiErrorSettings['data']!['message'] = error.message;
      multiErrorSettings['data']!['dlgType'] = 'snackbar-info';
      multiErrorSettings['data']!['messages'] = this.getUserValidMessages(error.messages);
      this._snackbar.openFromComponent(SnackbarMessageComponent, multiErrorSettings);
    } else {
      this._snackbar.open(errMessage, 'ok', this.errorSettings);
    }
  }//Simple error msg & messages[]?
  infoObj(info: DefaultResponseType, code: number | null = null): void {
    info.message = this.getUserInfoMsg(info.message);
    const infMessage = code ? `${info.message}  Code: ${code}` : info.message;
    if (info.messages && Array.isArray(info.messages) && info.messages.length > 0) {
      let multiInfoSettings: SnackSettingsType = this.multiInfoSettings;
      multiInfoSettings['data']!['message'] = info.message;
      multiInfoSettings['data']!['messages'] = this.getUserValidMessages(info.messages);
      this._snackbar.openFromComponent(SnackbarMessageComponent, multiInfoSettings);
    } else {
      this._snackbar.open(infMessage, 'ok', this.infoSettings);
    }
  }//Simple error msg & messages[]?

  success(message: string): void {
    this._snackbar.open(this.getUserSuccessMsg(message), 'ok', this.successSettings);
  }

  info(message: string): void {
    this._snackbar.open(this.getUserInfoMsg(message), 'ok', this.infoSettings);
  }//Функция сначала ищет перевод в userInfos
}
