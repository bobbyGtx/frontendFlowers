import {UrlParamsEnum} from '../../../enums/url-params.enum';
import {ActiveParamsType} from '../../../types/active-params.type';
import {Params} from '@angular/router';

export class ActiveParamsUtil{
  static processParams(params:Params):ActiveParamsType{
    const activeParams: ActiveParamsType = {types: []};
    if (params.hasOwnProperty(UrlParamsEnum.types)) {
      activeParams.types = Array.isArray(params[UrlParamsEnum.types]) ? params[UrlParamsEnum.types] : [params[UrlParamsEnum.types]];
    }
    if (params.hasOwnProperty(UrlParamsEnum.heightFrom)) {
      activeParams.heightFrom = params[UrlParamsEnum.heightFrom];
    }
    if (params.hasOwnProperty(UrlParamsEnum.heightTo)) {
      activeParams.heightTo = params[UrlParamsEnum.heightTo];
    }
    if (params.hasOwnProperty(UrlParamsEnum.diameterFrom)) {
      activeParams.diameterFrom = params[UrlParamsEnum.diameterFrom];
    }
    if (params.hasOwnProperty(UrlParamsEnum.diameterTo)) {
      activeParams.diameterTo = params[UrlParamsEnum.diameterTo];
    }
    if (params.hasOwnProperty(UrlParamsEnum.priceFrom)) {
      activeParams.priceFrom = params[UrlParamsEnum.priceFrom];
    }
    if (params.hasOwnProperty(UrlParamsEnum.priceTo)) {
      activeParams.priceTo = params[UrlParamsEnum.priceTo];
    }
    if (params.hasOwnProperty(UrlParamsEnum.sort)) {
      activeParams.sort = params[UrlParamsEnum.sort];
    }
    if (params.hasOwnProperty(UrlParamsEnum.page)) {
      activeParams.page = +params[UrlParamsEnum.page];
    }
    return activeParams;
  }
}
