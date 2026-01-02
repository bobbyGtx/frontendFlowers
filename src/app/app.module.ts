import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LayoutComponent} from './shared/layout/layout.component';
import {HeaderComponent} from './shared/layout/header/header.component';
import {FooterComponent} from './shared/layout/footer/footer.component';
import {MainComponent} from './views/main/main.component';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {SharedModule} from './shared/shared.module';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {NgOptimizedImage} from "@angular/common";
import {AuthInterceptor} from './core/auth/auth.interceptor';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    MatSnackBarModule,
    SharedModule,
    MatMenuModule,
    MatIcon,
    MatTooltipModule,
    CarouselModule,
    NgOptimizedImage,
    AppRoutingModule
  ],
  providers: [provideHttpClient(), provideAnimationsAsync(),provideHttpClient(withInterceptorsFromDi()),
    {
      provide:HTTP_INTERCEPTORS,
      useClass:AuthInterceptor,
      multi:true
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
