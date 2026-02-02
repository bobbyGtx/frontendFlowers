import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {CategoryFilterTranslationType} from '../../../../assets/types/translations/category-filtter-translation.type';

export const categoryFilterTranslations: { [key in AppLanguages]:  CategoryFilterTranslationType } = {
  [AppLanguages.ru]: {
    diameterTitle: 'Диаметр',
    heightTitle: 'Высота',
    priceTitle: 'Цена',
    diameterUnits:'см',
    heightUnits:'см',
    priceUnits:'евро',
    fromText:'от',
    toText:'до',
    noTitle:'Нет заголовка'
  },
  [AppLanguages.en]: {
    diameterTitle: 'Diameter',
    heightTitle: 'Height',
    priceTitle: 'Price',
    diameterUnits: 'cm',
    heightUnits: 'cm',
    priceUnits: 'euro',
    fromText: 'from',
    toText: 'to',
    noTitle:'No title'
  },
  [AppLanguages.de]: {
    diameterTitle: 'Durchmesser',
    heightTitle: 'Höhe',
    priceTitle: 'Preis',
    diameterUnits: 'cm',
    heightUnits: 'cm',
    priceUnits: 'euro',
    fromText: 'von',
    toText: 'bis',
    noTitle:'Kein Titel '
  },
};
