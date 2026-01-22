import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {OrdersTranslationType} from '../../../../assets/types/translations/orders-translation.type';

export const ordersTranslations: { [key in AppLanguages]:  OrdersTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader:'Личный кабинет',
    menuProfileButton:'Личные данные',
    menuOrdersButton:'Ваши заказы',
    orderListText:'Здесь отображается история ваших заказов.',
    orderListEmptyText:'У Вас ещё нет заказов',
    orderListEmptyButton:'В каталог',
    orderNumber:'Заказ №',
    orderDate:'от ',
    orderProductCount:'Кол-во товаров: ',
    orderProductUnits:' шт.',
    orderStatusHint:'Изменение статуса от ',
  },
  [AppLanguages.en]: {
    pageHeader: 'Account',
    menuProfileButton: 'Personal details',
    menuOrdersButton: 'Your orders',
    orderListText: 'Here you can see the history of your orders.',
    orderListEmptyText: 'You have no orders yet',
    orderListEmptyButton: 'Go to catalog',
    orderNumber: 'Order #',
    orderDate: 'from ',
    orderProductCount: 'Items: ',
    orderProductUnits: ' pcs',
    orderStatusHint: 'Status changed on ',
  },
  [AppLanguages.de]: {
    pageHeader: 'Mein Konto',
    menuProfileButton: 'Persönliche Daten',
    menuOrdersButton: 'Ihre Bestellungen',
    orderListText: 'Hier sehen Sie die Historie Ihrer Bestellungen.',
    orderListEmptyText: 'Sie haben noch keine Bestellungen',
    orderListEmptyButton: 'Zum Katalog',
    orderNumber: 'Bestellung Nr. ',
    orderDate: 'vom ',
    orderProductCount: 'Anzahl der Artikel: ',
    orderProductUnits: ' Stk.',
    orderStatusHint: 'Status geändert am ',
  }
};
