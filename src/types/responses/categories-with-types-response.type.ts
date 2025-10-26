import {DefaultResponseType} from './default-response.type';
import {CategoryWithTypesType} from '../category.type';

export interface CategoriesWithTypesResponseType extends DefaultResponseType {
  categories?: Array<CategoryWithTypesType>;
}
