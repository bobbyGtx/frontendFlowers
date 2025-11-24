import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import {SharedModule} from '../../shared/shared.module';
import {MatTooltip} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    CartComponent,
    OrderComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        OrderRoutingModule,
        MatTooltip
    ]
})
export class OrderModule { }
