import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface ProductsResponseType extends DefaultResponseType {
  products?: Array<ProductType>;
}
