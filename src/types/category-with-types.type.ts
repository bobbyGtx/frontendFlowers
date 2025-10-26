import {CategoryType} from './category.type';
import {ProductTypeType} from './product-type.type';

export interface CategoryWithTypesType extends CategoryType {
  types:Array<ProductTypeType>;
}
