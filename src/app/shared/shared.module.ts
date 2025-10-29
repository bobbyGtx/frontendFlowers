import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordRepeatDirective} from './directives/password-repeat.directive';
import {SnackbarMessageComponent} from './components/snackbar-message/snackbar-message.component';
import {MatButton} from '@angular/material/button';
import ProductCardComponent from './components/product-card/product-card.component';
import {RouterLink} from "@angular/router";
import {FormsModule} from '@angular/forms';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';

@NgModule({
    declarations: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent, CategoryFilterComponent],
  imports: [
    CommonModule,
    MatButton,
    RouterLink,
    FormsModule
  ],
    exports: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent, CategoryFilterComponent],
})
export class SharedModule {
}
