import {DefaultResponseType} from './default-response.type';
import {FavoriteProductType} from '../favorite-product.type';

export interface FavoritesResponseType extends DefaultResponseType {
  favorites?: Array<FavoriteProductType>;
}
