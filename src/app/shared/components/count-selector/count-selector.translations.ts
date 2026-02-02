import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {CountSelectorTranslationType} from '../../../../assets/types/translations/count-selector-translation.type';

export const countSelectorTranslations: { [key in AppLanguages]:  CountSelectorTranslationType } = {
  [AppLanguages.ru]: {
    availableText: 'Доступно ',
    units: ' единиц',
  },
  [AppLanguages.en]: {
    availableText: 'Available ',
    units: ' units',
  },
  [AppLanguages.de]: {
    availableText: 'Verfügbar ',
    units: ' Stück',
  },
};
