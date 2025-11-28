import {DefaultResponseType} from './default-response.type';
import {OrderType} from '../order.type';

export interface OrderResponseType extends DefaultResponseType {
  order?: OrderType;
}
