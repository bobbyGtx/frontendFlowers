import {CanActivateFn, Router} from '@angular/router';
import {LanguageService} from './language.service';
import {inject} from '@angular/core';
import {AppLanguages} from '../../assets/enums/app-languages.enum';

export const languageGuard: CanActivateFn = (route) => {
  const languageService: LanguageService=inject(LanguageService);
  const router:Router = inject(Router);
  const lang:AppLanguages|null = languageService.strToAppLanguage(route.paramMap.get('lang'));

  if (!lang) return router.createUrlTree(['/', languageService.appLang]);

  if (languageService.appLang !==lang) languageService.setAppLanguage(lang);
  return true;
};
