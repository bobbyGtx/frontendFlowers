import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {FooterTranslationType} from '../../../../assets/types/translations/footer-translation.type';

export const footerTranslations: { [key in AppLanguages]:  FooterTranslationType } = {
  [AppLanguages.ru]: {
    menuHeader:'Меню',
    home: 'Главная',
    catalog: 'Каталог',
    deliveryAndPay: 'Доставка и оплата',
    reviews: 'Отзывы',
    categoryHeader: 'Категории',
    socialHeader: 'Мы в социальных сетях',
    contactsHeader: 'Контакты',
    addressTitle: 'Адрес',
    address:'г. Саарбрюккен, ул. Триерер 1, ТЦ "Европа Галерея", 1 этаж',
    phoneTitle: 'Телефон',
  },
  [AppLanguages.en]: {
    menuHeader: 'Menu',
    home: 'Home',
    catalog: 'Catalog',
    deliveryAndPay: 'Delivery & Payment',
    reviews: 'Reviews',
    categoryHeader: 'Categories',
    socialHeader: 'Follow us on social media',
    contactsHeader: 'Contacts',
    addressTitle: 'Address',
    address: 'Saarbrücken, Trierer Street 1, Europa-Galerie, 1st Floor',
    phoneTitle: 'Phone',
  },
  [AppLanguages.de]: {
    menuHeader: 'Menü',
    home: 'Startseite',
    catalog: 'Katalog',
    deliveryAndPay: 'Lieferung & Zahlung',
    reviews: 'Bewertungen',
    categoryHeader: 'Kategorien',
    socialHeader: 'Wir sind in den sozialen Netzwerken',
    contactsHeader: 'Kontakte',
    addressTitle: 'Adresse',
    address: 'Saarbrücken, Trierer Straße 1, Europa-Galerie, 1. Etage',
    phoneTitle: 'Telefon',
  }
};
