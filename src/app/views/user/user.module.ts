import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {MatTooltip} from "@angular/material/tooltip";
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ResetPasswordComponent,
    ChangePasswordComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        UserRoutingModule,
        MatTooltip,
        NgOptimizedImage
    ]
})
export class UserModule { }
