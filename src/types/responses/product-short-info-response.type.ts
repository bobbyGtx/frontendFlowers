import {DefaultResponseType} from './default-response.type';
import {ProductShortInfoType} from '../product-short-info.type';

export interface ProductShortInfoResponseType extends DefaultResponseType {
  info?:ProductShortInfoType
}
