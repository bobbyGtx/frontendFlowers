import {DefaultResponseType} from './default-response.type';
import {CartType} from '../cart.type';

export interface CartResponseType extends DefaultResponseType {
  cart?: CartType;
}
