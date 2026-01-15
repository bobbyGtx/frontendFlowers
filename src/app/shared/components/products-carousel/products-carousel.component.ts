import {Component, Input} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {ProductType} from '../../../../assets/types/product.type';
import {CartItemType} from '../../../../assets/types/cart-item.type';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {Config} from '../../config';

@Component({
  selector: 'products-carousel',
  templateUrl: './products-carousel.component.html',
  styleUrl: './products-carousel.component.scss'
})
export class ProductsCarouselComponent {
  @Input() title: string = '';
  @Input() products:ProductType[]=[];
  @Input() lightMode:boolean = false;
  @Input() cartItems:CartItemType[]=[];
  @Input() appLanguage:AppLanguages=Config.defaultLanguage;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: this.lightMode,
    touchDrag: true,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  };
}
