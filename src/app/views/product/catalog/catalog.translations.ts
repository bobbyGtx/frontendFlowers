import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {CatalogTranslationType} from '../../../../assets/types/translations/catalog-translation.type';
import {SortingOptionsType} from '../../../../assets/types/sorting-options.type';

export const catalogTranslations: { [key in AppLanguages]:  CatalogTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Каталог',
    sortButton:'Сортировать',
    prodNotFoundTitle:'Товары не найдены!',
    prodNotFoundText:'Попробуйте изменить параметры поиска или',
    prodNotFoundClearFilterLink:' очистить фильтры',
    filterDiameterUnits:'см',
    filterDiameterFrom:'Диам. от: ',
    filterDiameterTo:'Диам. до: ',
    filterHeightUnits:'см',
    filterHeightFrom:'Выс. от: ',
    filterHeightTo:'Выс. до: ',
    filterPriceFrom:'Цена от: ',
    filterPriceTo:'Цена до: ',
    filterPriceUnits:'€',
    filterDelHint:'Удалить'
  },
  [AppLanguages.en]: {
    pageHeader: 'Catalog',
    sortButton: 'Sort',
    prodNotFoundTitle: 'No products found!',
    prodNotFoundText: 'Try changing the search parameters or',
    prodNotFoundClearFilterLink: ' clear filters',
    filterDiameterUnits: 'cm',
    filterDiameterFrom: 'Dia. from',
    filterDiameterTo: 'Dia. to',
    filterHeightUnits: 'cm',
    filterHeightFrom: 'Height from: ',
    filterHeightTo: 'Height to: ',
    filterPriceFrom: 'Price from: ',
    filterPriceTo: 'Price to: ',
    filterPriceUnits:'€',
    filterDelHint:'Remove'
  },
  [AppLanguages.de]: {
    pageHeader: 'Katalog',
    sortButton: 'Sortieren',
    prodNotFoundTitle: 'Keine Produkte gefunden!',
    prodNotFoundText: 'Versuchen Sie, die Suchparameter zu ändern oder',
    prodNotFoundClearFilterLink: ' Filter zurücksetzen',
    filterDiameterUnits: 'cm',
    filterDiameterFrom: 'Ø von: ',
    filterDiameterTo: 'Ø bis: ',
    filterHeightUnits: 'cm',
    filterHeightFrom: 'Höhe von: ',
    filterHeightTo: 'Höhe bis: ',
    filterPriceFrom: 'Preis von: ',
    filterPriceTo: 'Preis bis: ',
    filterPriceUnits:'€',
    filterDelHint:'Entfernen'
  }
};

export const sortingOptionsTranslations: { [key in AppLanguages]:  Array<SortingOptionsType> } = {
  [AppLanguages.ru]:[
    {name: 'А-Я', value: 'name-asc'},
    {name: 'Я-А', value: 'name-desc'},
    {name: 'Цена ↑', value: 'price-asc'},
    {name: 'Цена ↓', value: 'price-desc'},
  ],
  [AppLanguages.en]: [
    { name: 'A–Z', value: 'name-asc' },
    { name: 'Z–A', value: 'name-desc' },
    { name: 'Price ↑', value: 'price-asc' },
    { name: 'Price ↓', value: 'price-desc' },
  ],
  [AppLanguages.de]: [
    { name: 'A–Z', value: 'name-asc' },
    { name: 'Z–A', value: 'name-desc' },
    { name: 'Preis ↑', value: 'price-asc' },
    { name: 'Preis ↓', value: 'price-desc' },
  ],
};

// default [
//   {name: 'От А до Я', value: 'name-asc'},
//   {name: 'От Я до А', value: 'name-desc'},
//   {name: 'По возрастанию цены', value: 'price-asc'},
//   {name: 'По убыванию цены', value: 'price-desc'},
// ];
