import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface SearchProductsResponseType extends DefaultResponseType {
  products?: Array<ProductType>;
}
