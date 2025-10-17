import {DefaultResponseType} from './default-response.type';
import {CategoryType} from '../category.type';

export interface CategoriesResponseType extends DefaultResponseType {
  categories: Array<CategoryType>;
}
