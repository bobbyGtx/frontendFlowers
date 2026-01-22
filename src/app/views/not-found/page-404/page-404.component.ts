import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {LanguageService} from '../../../core/language.service';
import {Subscription} from 'rxjs';
import {Page404TranslationType} from '../../../../assets/types/translations/page-404-translation.type';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {page404Translations} from './page-404.translations';

@Component({
  selector: 'app-page-404',
  templateUrl: './page-404.component.html',
  styleUrl: './page-404.component.scss'
})
export class Page404Component implements OnInit, OnDestroy {
  private languageService: LanguageService=inject(LanguageService);

  private subscriptions$: Subscription=new Subscription();

  private appLanguage:AppLanguages;
  protected translations:Page404TranslationType;


  constructor() {
    this.appLanguage = this.languageService.appLang;
    this.translations = page404Translations[this.appLanguage];
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((appLang:AppLanguages)=>{
      this.appLanguage = appLang;
      this.translations = page404Translations[this.appLanguage];
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

}
