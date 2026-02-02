import {AppLanguages} from '../../assets/enums/app-languages.enum';

export class Config {
  static defaultLanguage:AppLanguages = AppLanguages.de;
  static languageList:{code:AppLanguages,label:string}[] = [
    { code: AppLanguages.de, label: 'Deutsch' },
    { code: AppLanguages.en, label: 'English' },
    { code: AppLanguages.ru, label: 'Русский' },
  ];
  static confirmMsgFromServer:string= 'Request success!';//Необходимо для игнорирования или изменения, для использования в качестве заголовка диалогового окна
  static authorisationRequired:string= 'Authorisation error.';//ответ от сервера при ошибке авторизации
  static accessTokenHeader:string = 'x-access-token';
  static reqLanguageHeader:string = 'x-language';//Язык, на котором формируется ответ от сервера
  static regionList:Array<string> = ['Saarland','Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'];
  static verificationEmailClosed:boolean=false;
}
