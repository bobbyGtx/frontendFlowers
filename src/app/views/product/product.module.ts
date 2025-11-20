import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { CatalogComponent } from './catalog/catalog.component';
import { DetailComponent } from './detail/detail.component';
import {SharedModule} from '../../shared/shared.module';
import {MatTooltip} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    CatalogComponent,
    DetailComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        ProductRoutingModule,
        MatTooltip
    ]
})
export class ProductModule { }
