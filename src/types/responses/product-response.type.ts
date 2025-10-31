import {DefaultResponseType} from './default-response.type';
import {ProductType} from '../product.type';

export interface ProductResponseType extends DefaultResponseType {
    product?: ProductType;
}
