import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {ProductCardTranslationType} from '../../../../assets/types/translations/product-card-translation.type';

export const productCardTranslations: { [key in AppLanguages]:  ProductCardTranslationType } = {
  [AppLanguages.ru]: {
    favAddButtonHint:'Добавить в избранное',
    favDelButtonHint:'Удалить из избранного',
    addInCartBtnHint:'Добавить в корзину',
    addInCartBtn:'В корзину',
    delFromCartBtnHint:'Удалить из корзины',
    delFromCartBtn:'В корзине',
    delFromCartBtnHover:'Удалить',
    details:'Подробнее',
    detailsHint:'Открыть описание',
  },
  [AppLanguages.en]: {
    favAddButtonHint: 'Add to favorites',
    favDelButtonHint: 'Remove from favorites',
    addInCartBtnHint: 'Add to cart',
    addInCartBtn: 'Add to cart',
    delFromCartBtnHint: 'Remove from cart',
    delFromCartBtn: 'In cart',
    delFromCartBtnHover: 'Remove',
    details: 'Details',
    detailsHint: 'Open description',
  },
  [AppLanguages.de]: {
    favAddButtonHint: 'Zu Favoriten hinzufügen',
    favDelButtonHint: 'Aus Favoriten entfernen',
    addInCartBtnHint: 'In den Warenkorb',
    addInCartBtn: 'In den Warenkorb',
    delFromCartBtnHint: 'Aus dem Warenkorb entfernen',
    delFromCartBtn: 'Im Warenkorb',
    delFromCartBtnHover: 'Entfernen',
    details: 'Details',
    detailsHint: 'Beschreibung öffnen',
  },
};
