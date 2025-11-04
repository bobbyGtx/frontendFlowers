import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface ProductsResponseType extends DefaultResponseType {
  response?:{
    page: number;
    totalPages: number;
    totalProducts: number;
    products: Array<ProductType>;
  }
}
