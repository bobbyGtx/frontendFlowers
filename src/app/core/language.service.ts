import {Injectable} from '@angular/core';
import {AppLanguages} from '../../assets/enums/app-languages.enum';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private appLanguage: AppLanguages=AppLanguages.ru;

  private appLanguage$:BehaviorSubject<AppLanguages> = new BehaviorSubject(this.appLanguage);

  constructor(private activatedRoute: ActivatedRoute) {
    const language:AppLanguages|null = this.strToAppLanguage(this.activatedRoute.snapshot.params['lng']);
    if (language && this.appLanguage !== language) this.setAppLanguage(language);
  }

  get currentLanguage$():Observable<AppLanguages> {
    return this.appLanguage$.asObservable()
      .pipe(
        tap((appLanguage:AppLanguages) => this.appLanguage = appLanguage),
      );
  }

  setAppLanguage(appLanguage:AppLanguages):void {
    this.appLanguage = appLanguage;
    if (appLanguage !== this.appLanguage$.value) this.appLanguage$.next(appLanguage);
  }

  get appLang():AppLanguages{
    return this.appLanguage;
  }

  private strToAppLanguage(value: string): AppLanguages | null {
    return Object.values(AppLanguages).includes(value as AppLanguages)
      ? value as AppLanguages
      : null;
  }
}
