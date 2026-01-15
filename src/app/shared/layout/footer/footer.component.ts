import {Component, Input} from '@angular/core';
import {CategoryWithTypesType} from '../../../../assets/types/category-with-types.type';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {Config} from '../../config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input() categories:CategoryWithTypesType[]=[];
  @Input() appLanguage: AppLanguages = Config.defaultLanguage;
}
