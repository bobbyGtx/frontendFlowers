import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {Config} from '../../config';
import {FooterTranslationType} from '../../../../assets/types/translations/footer-translation.type';
import {footerTranslations} from './footer.translations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss','./footer-adaptive.component.scss'],
})
export class FooterComponent implements OnChanges {
  @Input() categories:CategoryWithTypesType[]=[];
  @Input() appLanguage: AppLanguages = Config.defaultLanguage;

  translations:FooterTranslationType=footerTranslations[this.appLanguage];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appLanguage']) this.translations = footerTranslations[this.appLanguage];
  }
}
