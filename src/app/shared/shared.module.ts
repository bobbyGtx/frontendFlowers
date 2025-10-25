import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PasswordRepeatDirective} from './directives/password-repeat.directive';
import { SnackbarMessageComponent } from './components/snackbar-message/snackbar-message.component';
import {MatButton} from '@angular/material/button';
import ProductCardComponent from './components/product-card/product-card.component';
import {RouterLink} from "@angular/router";
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent],
  imports: [
    CommonModule,
    MatButton,
    RouterLink,
    FormsModule
  ],
  exports: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent],
})
export class SharedModule { }
