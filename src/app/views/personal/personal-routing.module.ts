import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FavoriteComponent} from './favorite/favorite.component';
import {OrderComponent} from '../order/order/order.component';
import {InfoComponent} from './info/info.component';

const routes: Routes = [
  {path: 'favorite', component: FavoriteComponent},
  {path: 'orders', component: OrderComponent},
  {path: 'info', component: InfoComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalRoutingModule { }
