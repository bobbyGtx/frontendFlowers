import {Component, inject, Input} from '@angular/core';
import {ProductType} from '../../../../types/product.type';
import {environment} from '../../../../environments/environment.development';
import {ShowSnackService} from '../../../core/show-snack.service';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
class ProductCardComponent {
  showSnackService: ShowSnackService=inject(ShowSnackService);
  @Input() product!:ProductType;
  images:string = environment.images;
  count:number = 1;

  onChangeCount(event:Event){
    let newValue:number=Number((event.target as HTMLInputElement).value)
    if (newValue > this.product.count){
      this.count = this.product.count;
      this.showSnackService.error(`Доступно ${this.product.count} единиц товара!`);
    }
  }

}

export default ProductCardComponent
