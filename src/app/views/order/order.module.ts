import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderRoutingModule} from './order-routing.module';
import {CartComponent} from './cart/cart.component';
import {OrderComponent} from './order/order.component';
import {SharedModule} from '../../shared/shared.module';
import {MatTooltip} from "@angular/material/tooltip";
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from '@angular/material/select';

@NgModule({
  declarations: [
    CartComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatTooltip,
    OrderRoutingModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
  ]
})
export class OrderModule {
}
