import {DefaultResponseType} from './default-response.type';
import {CartProductType} from '../cart-product.type';

export interface TranslateCartProductsResponseType extends DefaultResponseType {
  products?: Array<CartProductType>;
}
