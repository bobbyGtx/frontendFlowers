import {Injectable} from '@angular/core';
import {AppLanguages} from '../../enums/app-languages.enum';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private appLanguage: AppLanguages=AppLanguages.de;

  get appLang():AppLanguages{
    return this.appLanguage;
  }

  constructor() { }
}
