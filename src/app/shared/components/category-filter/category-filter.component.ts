import {Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ActiveParamsUtil} from '../../utils/active-params.util';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {CategoryFilters} from '../../../../assets/enums/category-filters.enum';
import {ActiveParamsType} from '../../../../assets/types/active-params.type';
import {TypeType} from '../../../../assets/types/type.type';
import {UrlParamsEnum} from '../../../../assets/enums/url-params.enum';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {CategoryFilterTranslationType} from '../../../../assets/types/translations/category-filtter-translation.type';
import {categoryFilterTranslations} from './category-filter.translations';


@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
  animations: [
    trigger('expandCollapse', [
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
          paddingTop: '0px',
          paddingBottom: '0px',
          overflow: 'hidden'
        })
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          paddingTop: '12px',
          paddingBottom: '12px',
          overflow: 'hidden'
        })
      ),
      transition('closed <=> open', [animate('250ms ease-in-out')])
    ])
  ]
})
export class CategoryFilterComponent implements OnInit, OnChanges, OnDestroy {
  router: Router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  @Input() categoryWithTypes: CategoryWithTypesType | null = null;
  @Input() type: CategoryFilters | null = null;
  @Input() appLanguage:AppLanguages | null = null;

  translations:CategoryFilterTranslationType|null = null;

  subscriptions$: Subscription = new Subscription();

  activeParams: ActiveParamsType = {types: []};
  to: number | null = null;
  from: number | null = null;


  open: boolean = false;
  manualClosed: boolean = false;

  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === CategoryFilters.height) {
        return this.translations?this.translations.heightTitle:'Height';
      } else if (this.type === CategoryFilters.diameter) {
        return this.translations?this.translations.diameterTitle:'Diameter';
      } else if (this.type === CategoryFilters.price) {
        return this.translations?this.translations.priceTitle:'Price';
      }
    }
    return this.translations?this.translations.noTitle:'No title';
  }

  get units(): string {
    if (this.translations) {
      if (this.type === CategoryFilters.price ){
        return this.translations.priceUnits;
      }else if (this.type === CategoryFilters.height){
        return this.translations.heightUnits;
      }else{
        return this.translations.diameterUnits;
      }
    } else return 'units';
  }

  toggle(): void {
    this.open = !this.open;
    this.manualClosed = !this.open;
  }

  updateFilterParam(url: string, checked: boolean): void {
    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams: number = this.activeParams.types.findIndex((item: string) => item === url);
      if (existingTypeInParams > -1 && !checked) {
        this.activeParams.types.splice(existingTypeInParams, 1);
      } else if (existingTypeInParams == -1 && checked) {
        this.activeParams.types=[...this.activeParams.types,url];//dont use push
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }
    if (this.activeParams.page)this.activeParams.page=1;
    this.router.navigate(['/',this.appLanguage,'catalog'], {
      queryParams: this.activeParams
    });
  }

  updateFilterFromTo(param: string, value: string): void {
    if (param === UrlParamsEnum.diameterFrom || param === UrlParamsEnum.diameterTo || param === UrlParamsEnum.heightFrom || param === UrlParamsEnum.heightTo || param === UrlParamsEnum.priceFrom || param === UrlParamsEnum.priceTo) {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }
    }
      if (this.activeParams.page)this.activeParams.page=1;
      this.router.navigate(['/',this.appLanguage,'catalog'], {
        queryParams: this.activeParams
      });
  }

  ngOnInit() {
    if (this.type && this.appLanguage) this.translations = categoryFilterTranslations[this.appLanguage];
    this.subscriptions$.add(
      this.activatedRoute.queryParams.subscribe((params) => {
        this.activeParams = ActiveParamsUtil.processParams(params);
        if (this.type) {
          if (params.hasOwnProperty(this.type + 'From') || params.hasOwnProperty(this.type + 'To')) this.open = !this.manualClosed;//только отображает если есть данные
          //this.open = (params.hasOwnProperty(this.type + 'From') || params.hasOwnProperty(this.type + 'To'));//скрывает компонент при очистке
          this.from = params.hasOwnProperty(this.type + 'From')?params[this.type + 'From']:null;
          this.to = params.hasOwnProperty(this.type + 'To')?params[this.type + 'To']:null;
        }else{
          if(this.categoryWithTypes && this.categoryWithTypes.types && this.categoryWithTypes.types.length > 0) {
            this.categoryWithTypes.types.some((typeItem:TypeType) => {
              if (this.activeParams.types.indexOf(typeItem.url)!==-1){
                this.open = !this.manualClosed;
                return true;
              }else {
                return false;
              }
            });
          }
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( this.type && changes['appLanguage'] && this.appLanguage) this.translations=categoryFilterTranslations[this.appLanguage];
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
