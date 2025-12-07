import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';
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
import {BehaviorSubject, Subscription, timer} from 'rxjs';
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
      },{
        error: 'User with this email is already registered!',
        [AppLanguages.ru]:'Пользователь с таким E-mail уже зарегистрирован!',
        [AppLanguages.en]:'User with this email is already registered!',
        [AppLanguages.de]:'Dieser Benutzer ist bereits registriert!',
      },{
        error: 'E-Mail is busy!',
        [AppLanguages.ru]:'Указанный E-mail занят!',
        [AppLanguages.en]:'Specified email is busy!',
        [AppLanguages.de]:'Die angegebene E-Mail-Adresse ist nicht erreichbar!',
      },{
        error: 'E-Mail not recognized!',
        [AppLanguages.ru]:'E-Mail не найден!',
        [AppLanguages.en]:'E-Mail not found!',
        [AppLanguages.de]:'E-Mail nicht gefunden!',
      },{
        error: 'Email not valid!',
        [AppLanguages.ru]:'Введен некорректный E-Mail!',
        [AppLanguages.en]:'Incorrect email entered!',
        [AppLanguages.de]:'Falsche E-Mail-Adresse eingegeben!',
      },{
        error: 'default',
        [AppLanguages.ru]:'Ошибка регистрации. Попробуйте позже.',
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
    [ReqErrorTypes.createOrder]:[
      {
        error:'User cart empty!',
        [AppLanguages.ru]:'Корзина пользователя пустая. Не возможно создать заказ.',
        [AppLanguages.en]:"The user's cart is empty. Unable to create an order.",
        [AppLanguages.de]:'Der Warenkorb des Nutzers ist leer. Eine Bestellung konnte nicht erstellt werden.',
      },{
        error:'Create order error.',
        [AppLanguages.ru]:'Ошибка создания заказа.',
        [AppLanguages.en]:"Error creating order.",
        [AppLanguages.de]:'Fehler beim Erstellen der Bestellung.',
      },{
        error:'Delivery identifier not found!',
        [AppLanguages.ru]:'Выбран неизвестный способ доставки. Выберите доступный.',
        [AppLanguages.en]:'An unknown delivery method has been selected. Please select an available one.',
        [AppLanguages.de]:'Es wurde eine unbekannte Versandart ausgewählt. Bitte wählen Sie eine verfügbare Versandart.',
      },{
        error:'Selected Delivery Type not possible now!',
        [AppLanguages.ru]:'Выбранный метод доставки недоступен. Выберите другой.',
        [AppLanguages.en]:'The selected delivery method is unavailable. Please choose another one.',
        [AppLanguages.de]:'Die gewählte Versandart ist nicht verfügbar. Bitte wählen Sie eine andere.',
      },{
        error:'Payment method identifier not found!',
        [AppLanguages.ru]:'Выбран несуществующий метод оплаты.',
        [AppLanguages.en]:'An inexistent payment method has been selected.',
        [AppLanguages.de]:'Es wurde eine nicht existierende Zahlungsmethode ausgewählt.',
      },{
        error:'Selected Payment method not possible now!',
        [AppLanguages.ru]:'Выбранный метод оплаты заказа не доступен. Используйте другой.',
        [AppLanguages.en]:'The selected payment method is not available. Please use another one.',
        [AppLanguages.de]:'Die gewählte Zahlungsmethode ist nicht verfügbar. Bitte wählen Sie eine andere.',
      },{
        error:'Unrecognized products were removed.',
        [AppLanguages.ru]:'Нераспознанные продукты были удалены из корзины.',
        [AppLanguages.en]:'Unrecognized products have been removed from cart.',
        [AppLanguages.de]:'Nicht erkannte Produkte wurden aus Ihrem Warenkorb entfernt.',
      },{
        error:'All products from cart were not found in the database and were removed from the cart.',
        [AppLanguages.ru]:'Не найден ни один товар из корзины в базу данных. Корзина очищена.',
        [AppLanguages.en]:'None of the items in your cart were found in the database. Your cart has been cleared.',
        [AppLanguages.de]:'Keiner der Artikel in Ihrem Warenkorb wurde in der Datenbank gefunden. Ihr Warenkorb wurde geleert.',
      },{
        error:'Data not acceptable!',
        [AppLanguages.ru]:'Введенные данные не корректны.',
        [AppLanguages.en]:'The entered data is incorrect.',
        [AppLanguages.de]:'Die eingegebenen Daten sind falsch.',
      },{
        error: 'default',
        [AppLanguages.ru]: 'Ошибка при создании заказа. Повторите попытку.',
        [AppLanguages.en]: 'Error creating order. Please try again.',
        [AppLanguages.de]: 'Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut.',
      }
    ],
    [ReqErrorTypes.editUserData]:[
      {
        error:'Nothing to change!',
        [AppLanguages.ru]:'Данных для изменения не найдено.',
        [AppLanguages.en]:"Nothing to change!",
        [AppLanguages.de]:'Nichts zu ändern!',
      },{
        error:'Data not acceptable!',
        [AppLanguages.ru]:'Введенные данные не корректны.',
        [AppLanguages.en]:'The entered data is incorrect.',
        [AppLanguages.de]:'Die eingegebenen Daten sind falsch.',
      },{
        error: 'default',
        [AppLanguages.ru]: 'Ошибка изменения данных. Повторите попытку.',
        [AppLanguages.en]: 'Error changing data. Please try again.',
        [AppLanguages.de]: 'Fehler beim Ändern der Daten.',
      }
    ],

  };//ошибки сгруппированные по запросам

  private userMessages:Array<UserInfoMsgType> = [
    {
      info:'E-Mail is incorrect',
      [AppLanguages.ru]:'E-Mail не корректен',
      [AppLanguages.en]:'E-Mail is incorrect',
      [AppLanguages.de]:'Die E-Mail-Adresse ist falsch',
    },{
      info:'Password is too short',
      [AppLanguages.ru]:'Пароль слишком короткий',
      [AppLanguages.en]:'Password is too short',
      [AppLanguages.de]:'Das Passwort ist zu kurz',
    },{
      info:"Passwords don't match",
      [AppLanguages.ru]:'Пароли не совпадают',
      [AppLanguages.en]:"Passwords don't match",
      [AppLanguages.de]:'Die Passwörter stimmen nicht überein',
    },{
      info:'Agreements not accepted',
      [AppLanguages.ru]:'Условия не приняты',
      [AppLanguages.en]:'Agreements not accepted',
      [AppLanguages.de]:'Bedingungen nicht akzeptiert',
    },{
      info:'Invalid delivery type!',
      [AppLanguages.ru]:'Выберите действующий способ доставки.',
      [AppLanguages.en]:'Please select a valid delivery method.',
      [AppLanguages.de]:'Bitte wählen Sie eine gültige Versandart.',
    },{
      info:'Invalid first name!',
      [AppLanguages.ru]:'Указано некорректное имя.',
      [AppLanguages.en]:'Incorrect name specified.',
      [AppLanguages.de]:'Falscher Name angegeben.',
    },{
      info:'Invalid last name!',
      [AppLanguages.ru]:'Указана некорректная фамилия.',
      [AppLanguages.en]:'The last name specified is incorrect.',
      [AppLanguages.de]:'Der angegebene Nachname ist falsch.',
    },{
      info:'Invalid phone!',
      [AppLanguages.ru]:'Указан некорректный номер телефона.',
      [AppLanguages.en]:'The phone number provided is incorrect.',
      [AppLanguages.de]:'Die angegebene Telefonnummer ist falsch.',
    },{
      info:'Invalid payment type!',
      [AppLanguages.ru]:'Выберите действующий метод оплаты.',
      [AppLanguages.en]:'Please select a valid payment method.',
      [AppLanguages.de]:'Bitte wählen Sie eine gültige Zahlungsmethode.',
    },{
      info:'Invalid ZIP code!',
      [AppLanguages.ru]:'Указан некорректный почтовый индекс.',
      [AppLanguages.en]:'Incorrect postal code specified.',
      [AppLanguages.de]:'Falsche Postleitzahl angegeben.',
    },{
      info:'Invalid region!',
      [AppLanguages.ru]:'Указан некорректный регион.',
      [AppLanguages.en]:'Invalid region specified.',
      [AppLanguages.de]:'Ungültige Region angegeben.',
    },{
      info:'Invalid city!',
      [AppLanguages.ru]:'Указана некорректный город.',
      [AppLanguages.en]:'Incorrect City specified.',
      [AppLanguages.de]:'Falsche Stadt angegeben.',
    },{
      info:'Invalid street!',
      [AppLanguages.ru]:'Указана некорректная улица.',
      [AppLanguages.en]:'Incorrect street specified.',
      [AppLanguages.de]:'Falsche Straße angegeben.',
    },{
      info:'Invalid house!',
      [AppLanguages.ru]:'Указан некорректный номер дома.',
      [AppLanguages.en]:'Incorrect house number indicated.',
      [AppLanguages.de]:'Falsche Hausnummer angegeben.',
    },{
      info:'Not enough product in stock.',
      [AppLanguages.ru]:'Не достаточное количество продукта на складе. Проверьте корзину.',
      [AppLanguages.en]:'There is not enough product in stock. Please check your cart.',
      [AppLanguages.de]:'Es ist nicht genügend Produkt auf Lager. Bitte überprüfen Sie Ihren Warenkorb.',
    },{
      info:'Product from cart is not available.',
      [AppLanguages.ru]:'Продукт(ы) в корзине недоступны для продажи. Проверьте корзину.',
      [AppLanguages.en]:'The products in your cart are not available for sale. Check your cart.',
      [AppLanguages.de]:'Die Produkte in Ihrem Warenkorb stehen nicht zum Verkauf.Bitte überprüfen Sie Ihren Warenkorb.',
    },{//это сообщение дублируется т.к. в разных запросах и в разных переменных
      info:'Unrecognized products were removed.',
      [AppLanguages.ru]:'Нераспознанные продукты были удалены из корзины.',
      [AppLanguages.en]:'Unrecognized products have been removed from cart.',
      [AppLanguages.de]:'Nicht erkannte Produkte wurden aus Ihrem Warenkorb entfernt.',
    },{
      info:'Current password not found!',
      [AppLanguages.ru]:'Действующий пароль не указан.',
      [AppLanguages.en]:'The current password is not specified.',
      [AppLanguages.de]:'Das aktuelle Passwort ist nicht angegeben.',
    },{
      info:'Current password wrong.',
      [AppLanguages.ru]:'Действующий пароль не верен.',
      [AppLanguages.en]:'The current password is incorrect.',
      [AppLanguages.de]:'Das aktuelle Passwort ist falsch.',
    },{
      info:'New passwords do not match!',
      [AppLanguages.ru]:'Новые пароли не совпадают.',
      [AppLanguages.en]:'The new passwords do not match.',
      [AppLanguages.de]:'Die neuen Passwörter stimmen nicht überein.',
    },{
      info:'New password not acceptable!',
      [AppLanguages.ru]:'Новый пароль не соответствует требованиям.',
      [AppLanguages.en]:'The new password does not meet the requirements.',
      [AppLanguages.de]:'Das neue Passwort erfüllt die Anforderungen nicht.',
    },{
      info:'ZIP code not valid!',
      [AppLanguages.ru]:'Почтовый индекс не корректен.',
      [AppLanguages.en]:'The postal code is incorrect.',
      [AppLanguages.de]:'Die Postleitzahl ist falsch.',
    },{
      info:'House number not valid!',
      [AppLanguages.ru]:'Номер дома некорректный!',
      [AppLanguages.en]:'The house number is incorrect!',
      [AppLanguages.de]:'Die Hausnummer ist falsch!',
    },{
      info:'E-Mail is busy!',
      [AppLanguages.ru]:'Указанный E-Mail уже занят.',
      [AppLanguages.en]:'The specified email is already in use.',
      [AppLanguages.de]:'Die angegebene E-Mail-Adresse ist bereits vergeben.',
    },{
      info:'Delivery identifier not found!',
      [AppLanguages.ru]:'Такого способа доставки не существует.',
      [AppLanguages.en]:'This delivery method does not exist.',
      [AppLanguages.de]:'Diese Zustellungsart existiert nicht.',
    },{
      info:'Payment method identifier not found!',
      [AppLanguages.ru]:'Такого способа оплаты не существует.',
      [AppLanguages.en]:'This payment method does not exist.',
      [AppLanguages.de]:'Diese Zahlungsmethode existiert nicht.',
    },{
      info:'Invalid delivery type!',
      [AppLanguages.ru]:'Способ доставки не корректен.',
      [AppLanguages.en]:'The delivery method is incorrect.',
      [AppLanguages.de]:'Die Liefermethode ist falsch.',
    },{
      info:'Invalid payment type!',
      [AppLanguages.ru]:'Способ оплаты не корректен.',
      [AppLanguages.en]:'The payment method is incorrect.',
      [AppLanguages.de]:'Die Zahlungsmethode ist falsch.',
    },{
      info:'Old and new passwords are the same!',
      [AppLanguages.ru]:'Старый и новый пароли одинаковые!',
      [AppLanguages.en]:'Old and new passwords are the same!',
      [AppLanguages.de]:'Das alte und das neue Passwort sind identisch!',
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
    },{
      success:'old password is correct',
      [AppLanguages.ru]:'Пароль принят. Разблокировано изменение Е-Mail и пароля',
      [AppLanguages.en]:'Password accepted. Email and password changes unlocked.',
      [AppLanguages.de]:'Passwort akzeptiert. E-Mail- und Passwortänderungen freigeschaltet.',
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
    },{
      info: "Saved delivery type unavailable",
      [AppLanguages.ru]:'Сохраненный способ доставки сейчас недоступен.',
      [AppLanguages.en]:'Saved shipping method is currently unavailable.',
      [AppLanguages.de]:'Die gespeicherte Versandart ist momentan nicht verfügbar.',
    },{
      info: "Saved payment type unavailable",
      [AppLanguages.ru]:'Сохраненный способ оплаты сейчас недоступен.',
      [AppLanguages.en]:'Saved payment method is currently unavailable.',
      [AppLanguages.de]:'Die gespeicherte Zahlungsmethode ist momentan nicht verfügbar.',
    }

  ];//Информационные сообщения

  private getUserGroupError(reqType: ReqErrorTypes, message: string): string {
    const errorIndex: number = this.userGroupErrors[reqType].findIndex((errorItem: UserErrorType) => message.toLowerCase().includes(errorItem.error.toLowerCase()));
    if (errorIndex === -1) {
      const defaultMsgIndex:number = this.userGroupErrors[reqType].length - 1;
      return this.userGroupErrors[reqType][defaultMsgIndex][this.languageService.appLang]?this.userGroupErrors[reqType][defaultMsgIndex][this.languageService.appLang]:message;
    } else {
      let msg:string = this.userGroupErrors[reqType][errorIndex][this.languageService.appLang];
      if (message.indexOf('(')>=0 && message.indexOf(')')>0){
        msg += message.slice(message.indexOf('('),message.indexOf(')'));
      }
      return msg;
    }
  }
  private getUserSuccessMsg(message: string): string {
    const itemIndex:number = this.userSuccess.findIndex(item=>message.toLowerCase().includes(item.success.toLowerCase()));
    if (itemIndex >= 0) message = this.userSuccess[itemIndex][this.languageService.appLang];
    return message;
  }
  private getUserInfoMsg(message: string): string {
    const itemIndex:number = this.userInfos.findIndex(item=>message.toLowerCase().includes(item.info.toLowerCase()));
    if (itemIndex >= 0) {
      let msg:string = this.userInfos[itemIndex][this.languageService.appLang];
      if (message.indexOf('(')>=0 && message.indexOf(')')>0){
        msg += message.slice(message.indexOf('('),message.indexOf(')'));
      }
      return msg;
    }
    return message;
  }
  private getUserMessages(messages:string[]):string[]{
    messages = messages.map((message:string)=>{
      const itemIndex:number = this.userMessages.findIndex((errorItem:UserInfoMsgType)=> message.toLowerCase().includes(errorItem.info.toLowerCase()));
      //обработка вывода сообщения в скобках, например названия товара
      if (itemIndex >= 0){
        let msg:string = this.userMessages[itemIndex][this.languageService.appLang];
        if (message.indexOf('(')>=0 && message.indexOf(')')>0){
          msg += message.slice(message.indexOf('('),message.indexOf(')'));
        }
        return msg;
      }
      return message;
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

      let snackRef:MatSnackBarRef<SnackbarMessageComponent>|MatSnackBarRef<TextOnlySnackBar>|null;

      if (actualMessage.settings.data && actualMessage.settings.data.messages){
        this.msgStack$.value[0].showed = true;//Помечаем напрямую сообщение как показываемое
        snackRef = this._snackbar.openFromComponent(SnackbarMessageComponent, actualMessage.settings);
      }else{
        this.msgStack$.value[0].showed = true;//Помечаем напрямую сообщение как показываемое
        snackRef = this._snackbar.open(actualMessage.message, 'ok', actualMessage.settings);
      }

      const tmrDelMsg:Subscription = timer(actualMessage.settings.duration+500).subscribe(() => {
        this.deleteMessage(actualMessage.id);
      });
      const msgDismissSubscription$:Subscription = snackRef.afterDismissed().subscribe(()=>{
        tmrDelMsg.unsubscribe();
        msgDismissSubscription$.unsubscribe();
        this.deleteMessage(actualMessage.id);
      });

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
        newMessage.settings = structuredClone(this.multiErrorSettings);
        if (messages.length>2)newMessage.settings.duration=newMessage.settings.duration+messages.length*1000;
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

  errorObj(error: DefaultResponseType|string,reqType: ReqErrorTypes | null = null, code: number | null = null): void {
    if (typeof error === "string") {
      this.error(error,reqType);
      return;
    }
    if (reqType) error.message = this.getUserGroupError(reqType,error.message);
    const errMessage = code ? `${error.message}  Code: ${code}` : error.message;
    if (error.messages && Array.isArray(error.messages) && error.messages.length > 0) {
      this.addMessage(errMessage,DlgTypes.error,this.getUserMessages(error.messages));
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
