import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PasswordRepeatDirective} from './directives/password-repeat.directive';
import { SnackbarMessageComponent } from './components/snackbar-message/snackbar-message.component';
import {MatButton} from '@angular/material/button';

@NgModule({
  declarations: [PasswordRepeatDirective, SnackbarMessageComponent],
  imports: [
    CommonModule,
    MatButton
  ],
  exports: [PasswordRepeatDirective],
})
export class SharedModule { }
