import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './shared/layout/layout.component';
import {MainComponent} from './views/main/main.component';
import {authForwardGuard} from './core/auth/auth-forward.guard';
import {authGuard} from './core/auth/auth.guard';

const routes: Routes = [
  {
    path:'',
    component:LayoutComponent,
    children:[
      {path:'', component:MainComponent},
      {path:'', loadChildren:()=>import('./views/user/user.module').then(m => m.UserModule), canActivate:[authForwardGuard]},
      {path:'', loadChildren:()=>import('./views/product/product.module').then(m => m.ProductModule)},
      {path:'', loadChildren:()=>import('./views/order/order.module').then(m => m.OrderModule)},
      {path:'', loadChildren:()=>import('./views/personal/personal.module').then(m => m.PersonalModule), canActivate:[authGuard]},
      {path:'', loadChildren:()=>import('./views/not-found/not-found.module').then(m=>m.NotFoundModule)},
      {path:'**', redirectTo:'404'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{anchorScrolling:"enabled"})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
