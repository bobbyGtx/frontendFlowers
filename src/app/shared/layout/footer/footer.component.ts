import {Component, Input} from '@angular/core';
import {CategoryType} from '../../../../types/category.type';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input() categories:CategoryType[]=[];

}
