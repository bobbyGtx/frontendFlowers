import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { PersonalRoutingModule } from './personal-routing.module';
import { FavoriteComponent } from './favorite/favorite.component';
import { InfoComponent } from './info/info.component';
import { OrdersComponent } from './orders/orders.component';
import {SharedModule} from '../../shared/shared.module';
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";


@NgModule({
  declarations: [
    FavoriteComponent,
    InfoComponent,
    OrdersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PersonalRoutingModule,
    MatTooltip,
    FormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    NgOptimizedImage
  ]
})
export class PersonalModule { }
