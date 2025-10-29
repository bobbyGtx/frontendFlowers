import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {CategoryWithTypesType} from '../../../../types/category-with-types.type';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveParamsType} from '../../../../types/active-params.type';
import {Subscription} from 'rxjs';
import {UrlParamsEnum} from '../../../../enums/url-params.enum';
import {CategoryFiltersEnum} from '../../../../enums/category-filters.enum';
import {TypeType} from '../../../../types/type.type';
import {ActiveParamsUtil} from '../../utils/active-params.util';


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
export class CategoryFilterComponent implements OnInit, OnDestroy {
  router: Router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  @Input() categoryWithTypes: CategoryWithTypesType | null = null;
  @Input() type: CategoryFiltersEnum | null = null;

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
      if (this.type === CategoryFiltersEnum.height) {
        return 'Высота';
      } else if (this.type === CategoryFiltersEnum.diameter) {
        return 'Диаметр';
      } else if (this.type === CategoryFiltersEnum.price) {
        return 'Цена';
      }
    }
    return 'Нет заголовка!';
  }

  get units(): string {
    return this.type === CategoryFiltersEnum.price ? 'евро' : 'см'
  }

  ngOnInit() {
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
    this.router.navigate(['/catalog'], {
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
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
