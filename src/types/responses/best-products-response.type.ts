import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface BestProductsResponseType extends DefaultResponseType {
  products?: Array<ProductType>;
}
