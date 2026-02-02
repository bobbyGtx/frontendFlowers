import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {Page404TranslationType} from '../../../../assets/types/translations/page-404-translation.type';

export const page404Translations: { [key in AppLanguages]:  Page404TranslationType } = {
  [AppLanguages.ru]: {
    infoText:'Страница не найдена',
    mainImageAlt:'Цветок с ошибкой 404'
  },
  [AppLanguages.en]: {
    infoText: 'Page not found',
    mainImageAlt: 'Flower with 404 error'
  },
  [AppLanguages.de]: {
    infoText: 'Seite nicht gefunden',
    mainImageAlt: 'Blume mit 404-Fehler'
  }
};
