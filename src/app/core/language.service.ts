import {inject, Injectable} from '@angular/core';
import {AppLanguages} from '../../assets/enums/app-languages.enum';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Config} from '../shared/config';
import {Router, UrlSegment, UrlTree} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private appLanguage: AppLanguages=Config.defaultLanguage;
  private appLanguage$:BehaviorSubject<AppLanguages> = new BehaviorSubject(this.appLanguage);
  private router:Router = inject(Router);

  get currentLanguage$():Observable<AppLanguages> {
    return this.appLanguage$.asObservable()
      .pipe(
        tap((appLanguage:AppLanguages) => this.appLanguage = appLanguage),
      );
  }

  setAppLanguage(appLanguage:AppLanguages):void {
    if (appLanguage !== this.appLanguage$.value) {
      this.appLanguage = appLanguage;
      this.appLanguage$.next(appLanguage);
    }
  }
  changeAppLanguage(appLanguage:AppLanguages):void {
    if (appLanguage !== this.appLanguage) {
      this.appLanguage = appLanguage;
      this.appLanguage$.next(appLanguage);

      const urlTree:UrlTree = this.router.parseUrl(this.router.url);
      const segments = urlTree.root.children['primary']?.segments ?? [];

      if (!segments.length) return;
      segments[0] = new UrlSegment(appLanguage, {});
      const newTree = this.router.createUrlTree(
        segments.map(s => s.path),
        {
          queryParams: urlTree.queryParams,
          fragment: urlTree.fragment?urlTree.fragment:undefined,
        }
      );

      this.router.navigateByUrl(newTree);

    }
  }

  get appLang():AppLanguages{
    return this.appLanguage;
  }

  strToAppLanguage(value: string|null): AppLanguages | null {
    return Object.values(AppLanguages).includes(value as AppLanguages)
      ? value as AppLanguages
      : null;
  }
}
