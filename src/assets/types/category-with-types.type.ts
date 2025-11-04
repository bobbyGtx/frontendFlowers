import {CategoryType} from './category.type';
import {TypeType} from './type.type';

export interface CategoryWithTypesType extends CategoryType {
  types:Array<TypeType>;
  typesUrl?:Array<string>;
}
