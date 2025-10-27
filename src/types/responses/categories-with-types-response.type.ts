import {DefaultResponseType} from './default-response.type';
import {CategoryWithTypesType} from '../category-with-types.type';


export interface CategoriesWithTypesResponseType extends DefaultResponseType {
  categories?: Array<CategoryWithTypesType>;
}
