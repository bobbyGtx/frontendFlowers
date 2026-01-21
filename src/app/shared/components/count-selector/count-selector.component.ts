import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {debounceTime, filter, Subject, Subscription,} from 'rxjs';
import {CountSelectorTranslationType} from '../../../../assets/types/translations/count-selector-translation.type';
import {countSelectorTranslations} from './count-selector.translations';
import {LanguageService} from '../../../core/language.service';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrl: './count-selector.component.scss'
})
export class CountSelectorComponent implements OnInit, OnDestroy {
  private showSnackService: ShowSnackService=inject(ShowSnackService);
  private languageService:LanguageService=inject(LanguageService);

  @Input() maxCount:number= 0;
  @Input() disabled:boolean = true;
  @Input() count:number = 1;
  @Input() filterOn:boolean|undefined = false;//Отключаем фильтр если товар не в корзине
  @Output() onCountChange:EventEmitter<number> = new EventEmitter<number>();
  filter:Subject<number> = new Subject<number>();
  private lastEmittedValue:number = 1;

  private subscriptions$:Subscription=new Subscription();
  private appLanguage:AppLanguages;
  protected translations:CountSelectorTranslationType;

  constructor() {
    this.appLanguage = this.languageService.appLang;
    this.translations = countSelectorTranslations[this.appLanguage];
  }

  onChangeCount(event:Event){
    if (this.disabled) {
      this.count = 0;
      return
    }
    if (!(event.target as HTMLInputElement).value) this.emitChanges(-1);
    let newValue:number=Number((event.target as HTMLInputElement).value);
    if (!newValue || newValue < 1) return;
    if (newValue > this.maxCount){
      this.count = this.maxCount;
      this.showSnackService.error(`Доступно ${this.maxCount} единиц товара!`);
    }
    this.emitChanges(this.count);
  }

  onBlur(event:Event){
    if (!(event.target as HTMLInputElement).value) (event.target as HTMLInputElement).value=this.lastEmittedValue.toString();
  }

  decreaseCount(){
    if (!this.disabled && this.count>1) {
      this.count--;
      if (this.count > this.maxCount) this.count = this.maxCount;
      this.emitChanges(this.count);
    }
  }

  increaseCount(){
    if (!this.disabled && this.count < this.maxCount) {
      this.count++;
      this.emitChanges(this.count);
    }
  }

  emitChanges(value:number){
    if (value === -1)return;
    if (this.filterOn) this.filter.next(value);
    else this.onCountChange.emit(value);
  }

  ngOnInit() {
    this.subscriptions$.add(this.languageService.currentLanguage$.subscribe((language:AppLanguages) => {
      this.appLanguage = language;
      this.translations = countSelectorTranslations[this.appLanguage];
    }));
    if (this.disabled) {
      this.count = 0;
      this.maxCount=0;
    }
    this.lastEmittedValue = this.count;
    this.filter
      .pipe(
        debounceTime(300),
        filter((cartCount:number) => cartCount !== -1)
      )
      .subscribe(cartCount => {
        this.lastEmittedValue = cartCount;
        this.onCountChange.emit(cartCount);
      });
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
