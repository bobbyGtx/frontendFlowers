import {DefaultResponseType} from './default-response.type';
import {OrderType} from '../order.type';

export interface OrdersResponseType extends DefaultResponseType {
  orders?: OrderType[];
}
