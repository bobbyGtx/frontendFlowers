import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { NotFoundRoutingModule } from './not-found-routing.module';
import { Page404Component } from './page-404/page-404.component';


@NgModule({
  declarations: [
    Page404Component,
  ],
  imports: [
    CommonModule,
    NotFoundRoutingModule,
    NgOptimizedImage
  ]
})
export class NotFoundModule { }
