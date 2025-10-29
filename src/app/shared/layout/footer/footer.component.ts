import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithTypesType} from '../../../../types/category-with-types.type';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  @Input() categories:CategoryWithTypesType[]=[];

  ngOnInit(){

  }
}
