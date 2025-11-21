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
import {AppLanguages} from '../../assets/enums/app-languages.enum';
import {DefaultResponseType} from '../../assets/types/responses/default-response.type';
import {BehaviorSubject, timer} from 'rxjs';
import {ReqErrorTypes} from '../../assets/enums/auth-req-error-types.enum';
import {Config} from '../shared/config';

type SnackSettingsType = {
  data?: {
    message: string;
    dlgType:string;
    messages: string[]
  },
  duration: number,
  panelClass: string,
};
enum DlgTypes{
  error='error',
  info='info',
  success='success',
}
type MessageType={
  id: number,
  showed:boolean,
  message: string,
  settings:SnackSettingsType|null
}

@Injectable({
  providedIn: 'root'
})
export class ShowSnackService {
  private _snackbar: MatSnackBar = inject(MatSnackBar);
  private languageService:LanguageService=inject(LanguageService);
  private msgStack$:BehaviorSubject<MessageType[]> = new BehaviorSubject<MessageType[]>([]);
  private lastMsgId:number = 0;

  private errorSettings: SnackSettingsType = {
    duration: 4000,
    panelClass: 'snackbar-error',
  };
  private multiErrorSettings: SnackSettingsType = {
    data: {
      message: '',
      dlgType: 'snackbar-error',
      messages: [],
    },
    duration: 5000,
    panelClass: 'snackbar-error',
  };
  private multiInfoSettings: SnackSettingsType = {
    data: {
      message: '',
      dlgType: 'snackbar-info',
      messages: [],
    },
    duration: 4500,
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
        error: 'Email not valid!',
        [AppLanguages.ru]:'Введен некорректный E-Mail!',
        [AppLanguages.en]:'Entered email is incorrect!',
        [AppLanguages.de]:'Falsche E-Mail-Adresse eingegeben!',
      },{
        error: 'Password wrong!',
        [AppLanguages.ru]:'Пароль не верный!',
        [AppLanguages.en]:'Password wrong!',
        [AppLanguages.de]:'Falsches Passwort!',
      },{
        error: 'E-mail not found in DB!',
        [AppLanguages.ru]:'Пользователь с такой почтой не зарегистрирован!',
        [AppLanguages.en]:'User with this email is not registered!',
        [AppLanguages.de]:'Der Benutzer mit dieser E-Mail-Adresse ist nicht registriert!',
      },{
        error: 'User blocked!',
        [AppLanguages.ru]:'Пользователь заблокирован.',
        [AppLanguages.en]:'User blocked!',
        [AppLanguages.de]:'Das Konto wurde gesperrt.',
      },{
        error: 'Refresh token invalid!',
        [AppLanguages.ru]:'Требуется повторная авторизация.',
        [AppLanguages.en]:'Reauthorization required.',
        [AppLanguages.de]:'Erneute Autorisierung erforderlich.',
      },{
        error: Config.authorisationRequired,
        [AppLanguages.ru]:'Необходимо авторизоваться!',
        [AppLanguages.en]:'Authorization required!',
        [AppLanguages.de]:'Autorisierung erforderlich!',
      },{
        error: 'default',
        [AppLanguages.ru]:'Ошибка авторизации. Попробуйте войти ещё раз.',
        [AppLanguages.en]:'Authorization error. Please try again.',
        [AppLanguages.de]:'Autorisierungsfehler. Bitte versuchen Sie, sich erneut anzumelden.',
      },
    ],
    [ReqErrorTypes.authSignUp]: [
      {
        error: 'Data not acceptable!',
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
        error: 'Cart has been cleared by the system.',
        [AppLanguages.ru]:'Корзина очищена системой.',
        [AppLanguages.en]:'Cart has been cleared by the system.',
        [AppLanguages.de]:'Der Warenkorb wurde vom System geleert.',
      },{
        error: 'default',
        [AppLanguages.ru]:'Ошибка при запросе корзины. Обновите страницу.',
        [AppLanguages.en]:'Error requesting cart. Please refresh the page.',
        [AppLanguages.de]:'Fehler beim Anfordern des Warenkorbs. Bitte aktualisieren Sie die Seite.',
      }
    ],
    [ReqErrorTypes.cartUpdate]:[
      {
        error: 'Requested product is currently unavailable!',
        [AppLanguages.ru]:'Один или несколько товаров в корзины не доступен!',
        [AppLanguages.en]:'One or more items in your cart are not available!',
        [AppLanguages.de]:'Mindestens ein Artikel in Ihrem Warenkorb ist nicht verfügbar!',
      },{
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
  ];//сообщения валидации из переменной [messages]
  private userSuccess:Array<UserSuccessMsgType> = [
    {
      success:'Authorization success!',
      [AppLanguages.ru]:'Успешная авторизация!',
      [AppLanguages.en]:'Authorization success!',
      [AppLanguages.de]:'Autorisierung erfolgreich!',
    },{
      success:'You have successfully logged out.',
      [AppLanguages.ru]:'Вы успешно вышли из системы.',
      [AppLanguages.en]:'You have successfully logged out.',
      [AppLanguages.de]:'Sie haben sich erfolgreich abgemeldet.',
    },{
      success:'User registered!',
      [AppLanguages.ru]:'Регистрация прошла успешно. Войдите в систему.',
      [AppLanguages.en]:'You have successfully logged out.',
      [AppLanguages.de]:'Sie haben sich erfolgreich abgemeldet.',
    },{
      success:'Record changed!',
      [AppLanguages.ru]:'Запись изменена.',
      [AppLanguages.en]:'Record has been changed.',
      [AppLanguages.de]:'Der Eintrag wurde geändert.',
    },{
      success:'Record deleted!',
      [AppLanguages.ru]:'Запись удалена',
      [AppLanguages.en]:'Record has been deleted.',
      [AppLanguages.de]:'Der Eintrag wurde gelöscht',
    }
  ];//Подтверждения
  private userInfos:Array<UserInfoMsgType> = [
    {
      info:Config.confirmMsgFromServer,
      [AppLanguages.ru]:'Уведомление:',
      [AppLanguages.en]:'Notification:',
      [AppLanguages.de]:'Benachrichtigung:',
    },{
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
    },{
      info: 'Not enough goods in stock.',
      [AppLanguages.ru]:'Не достаточно товара на складе.',
      [AppLanguages.en]:'Not enough goods in stock.',
      [AppLanguages.de]:'Nicht genügend Ware auf Lager.',
    },{
      info: 'Requested product is currently unavailable!',
      [AppLanguages.ru]:'Один или несколько товаров в корзине не доступен!',
      [AppLanguages.en]:'One or more items in your cart are not available!',
      [AppLanguages.de]:'Mindestens ein Artikel in Ihrem Warenkorb ist nicht verfügbar!',
    },{
      info: Config.authorisationRequired,
      [AppLanguages.ru]:'Необходимо авторизоваться!',
      [AppLanguages.en]:'Authorization required!',
      [AppLanguages.de]:'Autorisierung erforderlich!',
    }

  ];//Информационные сообщения

  private getUserGroupError(reqType: ReqErrorTypes, message: string): string {
    const errorIndex: number = this.userGroupErrors[reqType].findIndex((errorItem: UserErrorType) => message.toLowerCase().includes(errorItem.error.toLowerCase()));
    if (errorIndex === -1) {
      const defaultMsgIndex:number = this.userGroupErrors[reqType].length - 1;
      return this.userGroupErrors[reqType][defaultMsgIndex][this.languageService.appLang]?this.userGroupErrors[reqType][defaultMsgIndex][this.languageService.appLang]:message;
    } else {
      return this.userGroupErrors[reqType][errorIndex][this.languageService.appLang];
    }
  }
  private getUserSuccessMsg(message: string): string {
    const itemIndex:number = this.userSuccess.findIndex(item=>message.toLowerCase().includes(item.success.toLowerCase()));
    if (itemIndex >= 0) message = this.userSuccess[itemIndex][this.languageService.appLang];
    return message;
  }
  private getUserInfoMsg(message: string): string {
    const itemIndex:number = this.userInfos.findIndex(item=>message.toLowerCase().includes(item.info.toLowerCase()));
    if (itemIndex >= 0) message = this.userInfos[itemIndex][this.languageService.appLang];
    return message;
  }
  private getUserValidMessages(messages:string[]):string[]{
    messages = messages.map((message:string)=>{
      const itemIndex:number = this.userMessages.findIndex((errorItem:UserInfoMsgType)=> message.toLowerCase().includes(errorItem.info.toLowerCase()));
      return itemIndex ===-1 ? message:this.userMessages[itemIndex][this.languageService.appLang];
    });
    return messages;
  }
  private getUserinfoMessages(messages:string[]):string[]{
    messages = messages.map((message:string)=>{
      const itemIndex:number = this.userInfos.findIndex((errorItem:UserInfoMsgType)=> message.toLowerCase().includes(errorItem.info.toLowerCase()));
      return itemIndex ===-1 ? message:this.userInfos[itemIndex][this.languageService.appLang];
    });
    return messages;
  }

  constructor() {
    this.msgStack$.subscribe((msgStack:MessageType[])=>{
      if (msgStack.length===0) {
        this.lastMsgId=0;
        return;
      }
      if (msgStack[0].showed) return;//Выходим если отображается первое уведомление
      const actualMessage:MessageType = msgStack[0];

      if (!actualMessage.settings) {
        this.deleteMessage(actualMessage.id);
        return;
      }

      if (actualMessage.settings.data && actualMessage.settings.data.messages){
        this.msgStack$.value[0].showed = true;//Помечаем напрямую сообщение как показываемое
        this._snackbar.openFromComponent(SnackbarMessageComponent, actualMessage.settings);
      }else{
        this.msgStack$.value[0].showed = true;//Помечаем напрямую сообщение как показываемое
        this._snackbar.open(actualMessage.message, 'ok', actualMessage.settings);
      }
      timer(actualMessage.settings.duration+500).subscribe(() => {
        this.deleteMessage(actualMessage.id);
      })
    });
  }//Подписка на поток уведомлений

  addMessage(message:string,type:DlgTypes,messages:string[]|null=null):void {
    let newMessage:MessageType={
      id:1+this.lastMsgId,
      showed:false,
      message:message,
      settings:null
    }
    if (type===DlgTypes.success){
      newMessage.settings = {...this.successSettings};
    }else if(type===DlgTypes.info){
      if (messages && messages.length>0){
        newMessage.settings = structuredClone(this.multiInfoSettings);
        newMessage.settings['data']!['message'] = message;
        newMessage.settings['data']!['messages'] = messages;
      }else{
        newMessage.settings = {...this.infoSettings};
      }
    }else if(type===DlgTypes.error){
      if (messages && messages.length>0){
        newMessage.settings =structuredClone(this.multiErrorSettings);
        newMessage.settings['data']!['message'] = message;
        newMessage.settings['data']!['messages'] = messages;
      }else{
        newMessage.settings = {...this.errorSettings};
      }
    }else{
     console.error('Unexpected DlgType');
      return;
    }

    if (newMessage.settings){
      this.lastMsgId = newMessage.id;
      const equalMsgIndex:number = this.msgStack$.getValue().findIndex(messageItem=>{
        if (messageItem.message === message){
          if (messageItem.settings?.data?.messages && newMessage.settings?.data?.messages && messageItem.settings?.data?.messages.length === newMessage.settings?.data?.messages.length) {
            return messageItem.settings.data.messages.every(strItem=> newMessage.settings!.data!.messages!.includes(strItem));
          }else{
            return false
          }
        }
        return false
      });//Проверяем наличие такого-же сообщения в массиве
      if (equalMsgIndex ===-1) this.msgStack$.next([...this.msgStack$.getValue(),newMessage]);
    }
  }
  deleteMessage(id:number):void {
    this.msgStack$.next(this.msgStack$.getValue().filter((item:MessageType)=>+item.id !== +id));
  }

  error(message: string, reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (!message || message.length<2) return;
    if (reqType) message = this.getUserGroupError(reqType, message);
    code ? message = `${message}  Code: ${code}` : null;
    this.addMessage(message,DlgTypes.error);
    //this._snackbar.open(message, 'ok', this.errorSettings);
  }

  errorObj(error: DefaultResponseType,reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (reqType) error.message = this.getUserGroupError(reqType,error.message);
    const errMessage = code ? `${error.message}  Code: ${code}` : error.message;
    if (error.messages && Array.isArray(error.messages) && error.messages.length > 0) {
      this.addMessage(errMessage,DlgTypes.error,this.getUserValidMessages(error.messages));
    } else {
      this.addMessage(errMessage,DlgTypes.error);
    }
  }//Simple error msg & messages[]?

  /**
   * Детальное описание:
   * - выводт информационное сообщение. Простое если входит строка, расширенное - если есть массив строк
   * - Проверяет @param info на тип, если строка - выводит простое переведенное сообщение
   * если это не строка, обрабатывает данные в объекте.
   * Если в массиве сообщений 1 элемент и info.message = 'Request success!'(Config.confirmMsgFromServer), то выводим простое сообщение,
   * в противном случае заменяем 'Request success!' на "Информация" и выводим сложное сообщение с переведенными элементами
   *
   * @param {DefaultResponseType|string} info Ответ от сервера или строка.;
   * выводит info - если строка, или обрабатывает info.message и info.messages[]
   */
  infoObj(info: DefaultResponseType | string): void {
    if (typeof info === 'string') {
      this.addMessage(this.getUserInfoMsg(info),DlgTypes.info);
      return;
    }
    if (info.message===Config.confirmMsgFromServer && info.messages && info.messages.length === 1){
      this.addMessage(this.getUserInfoMsg(info.messages[0]),DlgTypes.info);
      return;
    }
    let userMsg:string=this.getUserInfoMsg(info.message);
    if (userMsg && Array.isArray(info.messages) && info.messages.length > 0) {
      this.addMessage(userMsg,DlgTypes.info,this.getUserinfoMessages(info.messages));
    } else {
      this.addMessage(userMsg,DlgTypes.info);
    }
  }//Simple error msg & messages[]?

  success(message: string): void {
    this.addMessage(this.getUserSuccessMsg(message),DlgTypes.success);
  }
}
