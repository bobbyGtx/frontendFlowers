import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {FavoriteTranslationType} from '../../../../assets/types/translations/favorite-translation.type';

export const favoriteTranslations: { [key in AppLanguages]:  FavoriteTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader:"Избранное",
    favEmptyText:'В избранном нет товаров',
    toCatalogButton:'В каталог',
    productEndsTooltip:'Товар заканчивается! Доступно ',
    productEndsTooltipUnits:' единиц',
    addInCartBtnHint:'Добавить в корзину',
    addInCartBtn:'В корзину',
    delFromCartBtnHint:'Удалить из корзины',
    delFromCartBtn:'В корзине',
    delFromCartBtnHover:'Удалить',
    favDelButtonHint:'Удалить из избранного',
  },
  [AppLanguages.en]: {
    pageHeader: 'Favorites',
    favEmptyText: 'No products in favorites',
    toCatalogButton: 'Go to catalog',
    productEndsTooltip: 'Product is running low! Available ',
    productEndsTooltipUnits: ' units',
    addInCartBtnHint: 'Add to cart',
    addInCartBtn: 'Add to cart',
    delFromCartBtnHint: 'Remove from cart',
    delFromCartBtn: 'In cart',
    delFromCartBtnHover: 'Remove',
    favDelButtonHint: 'Remove from favorites',
  },
  [AppLanguages.de]: {
    pageHeader: 'Favoriten',
    favEmptyText: 'Keine Produkte in den Favoriten',
    toCatalogButton: 'Zum Katalog',
    productEndsTooltip: 'Produkt ist fast ausverkauft! Verfügbar ',
    productEndsTooltipUnits: ' Stück',
    addInCartBtnHint: 'In den Warenkorb',
    addInCartBtn: 'In den Warenkorb',
    delFromCartBtnHint: 'Aus dem Warenkorb entfernen',
    delFromCartBtn: 'Im Warenkorb',
    delFromCartBtnHover: 'Entfernen',
    favDelButtonHint: 'Aus Favoriten entfernen',
  }
};
