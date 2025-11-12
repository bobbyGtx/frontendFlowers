import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [
    CartComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OrderRoutingModule
  ]
})
export class OrderModule { }
