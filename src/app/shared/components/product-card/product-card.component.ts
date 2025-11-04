import {Component, Input} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {ProductType} from '../../../../assets/types/product.type';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
class ProductCardComponent {
  @Input() product!:ProductType;
  images:string = environment.images;
}

export default ProductCardComponent
