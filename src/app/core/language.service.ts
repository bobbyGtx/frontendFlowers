import {Injectable} from '@angular/core';
import {AppLanguages} from '../../assets/enums/app-languages.enum';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private appLanguage: AppLanguages=AppLanguages.ru;

  get appLang():AppLanguages{
    return this.appLanguage;
  }

  constructor() { }
}
