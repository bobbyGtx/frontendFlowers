import {Component, Input} from '@angular/core';
import {ProductType} from '../../../../types/product.type';
import {OwlOptions} from 'ngx-owl-carousel-o';

@Component({
  selector: 'products-carousel',
  templateUrl: './products-carousel.component.html',
  styleUrl: './products-carousel.component.scss'
})
export class ProductsCarouselComponent {
  @Input() title: string = '';
  @Input() products:ProductType[]=[];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
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
