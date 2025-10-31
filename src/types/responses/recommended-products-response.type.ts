import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface RecommendedProductsResponseType extends DefaultResponseType {
  products?: Array<ProductType>;
}
