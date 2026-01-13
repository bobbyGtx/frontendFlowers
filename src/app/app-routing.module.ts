import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './shared/layout/layout.component';
import {MainComponent} from './views/main/main.component';
import {authForwardGuard} from './core/auth/auth-forward.guard';
import {authGuard} from './core/auth/auth.guard';
import {languageGuard} from './core/language.guard';

const routes: Routes = [
  {
    path: ':lang',
    component: LayoutComponent,
    canActivate: [languageGuard],
    children: [
      // Главная
      { path: '', component: MainComponent },
      // User
      {path: '', loadChildren: () => import('./views/user/user.module').then(m => m.UserModule), canActivate: [authForwardGuard]},
      // Product
      {path: '', loadChildren: () => import('./views/product/product.module').then(m => m.ProductModule)},
      // Order
      {path: '', loadChildren: () => import('./views/order/order.module').then(m => m.OrderModule)},
      // Personal
      {path: '', loadChildren: () => import('./views/personal/personal.module').then(m => m.PersonalModule), canActivate: [authGuard]},
      // 404
      {path: '', loadChildren: () => import('./views/not-found/not-found.module').then(m => m.NotFoundModule)},
      // fallback внутри языка
      { path: '**', redirectTo: '404' }
    ]
  },
  // редирект с корня
  { path: '', redirectTo: 'ru', pathMatch: 'full' },
  // глобальный fallback
  { path: '**', redirectTo: 'ru' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{anchorScrolling:"enabled"})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
