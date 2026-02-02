import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {CartTranslationType} from '../../../../assets/types/translations/cart-translation.type';

export const cartTranslations: { [key in AppLanguages]:  CartTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Корзина',
    removeFromCartBtnHint:'Удалить из корзины',
    cartDetailsTitle:'Ваш заказ',
    cartProductsTitle:'Товаров',
    cartTotalAmountTitle:'Общая стоимость',
    cartDeliveryInfoText:'без учета доставки',
    continueShoppingBtnCaption:'Продолжить покупки',
    placeOrderBtnCaption:'Оформить заказ',
    cartEmptyMessage:'В корзине нет товаров',
    goToCatalogBtnCaption:'В каталог',
    recommendedProductsTitle:'С этими товарами также покупают',
  },
  [AppLanguages.en]: {
    pageHeader: 'Cart',
    removeFromCartBtnHint: 'Remove from cart',
    cartDetailsTitle: 'Your order',
    cartProductsTitle: 'Items',
    cartTotalAmountTitle: 'Total amount',
    cartDeliveryInfoText: 'excluding delivery',
    continueShoppingBtnCaption: 'Continue shopping',
    placeOrderBtnCaption: 'Place order',
    cartEmptyMessage: 'Your cart is empty',
    goToCatalogBtnCaption: 'Go to catalog',
    recommendedProductsTitle: 'Customers also buy',
  },
  [AppLanguages.de]: {
    pageHeader: 'Warenkorb',
    removeFromCartBtnHint: 'Aus dem Warenkorb entfernen',
    cartDetailsTitle: 'Ihre Bestellung',
    cartProductsTitle: 'Artikel',
    cartTotalAmountTitle: 'Gesamtsumme',
    cartDeliveryInfoText: 'zzgl. Versandkosten',
    continueShoppingBtnCaption: 'Weiter einkaufen',
    placeOrderBtnCaption: 'Bestellung aufgeben',
    cartEmptyMessage: 'Ihr Warenkorb ist leer',
    goToCatalogBtnCaption: 'Zum Katalog',
    recommendedProductsTitle: 'Kunden kauften auch',
  }
};
