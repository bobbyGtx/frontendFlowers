import {DefaultResponseType} from './default-response.type';
import {FavoriteProductType} from '../favorite-product.type';

export interface AddToFavoritesResponseType extends DefaultResponseType {
  product?: FavoriteProductType;
}
