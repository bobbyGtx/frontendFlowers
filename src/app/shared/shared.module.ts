import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordRepeatDirective} from './directives/password-repeat.directive';
import {SnackbarMessageComponent} from './components/snackbar-message/snackbar-message.component';
import {MatButton} from '@angular/material/button';
import ProductCardComponent from './components/product-card/product-card.component';
import {RouterLink} from "@angular/router";
import {FormsModule} from '@angular/forms';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import { ProductsCarouselComponent } from './components/products-carousel/products-carousel.component';
import {CarouselModule} from 'ngx-owl-carousel-o';
import { CountSelectorComponent } from './components/count-selector/count-selector.component';
import {MatTooltip} from "@angular/material/tooltip";
import { LoaderComponent } from './components/loader/loader.component';
import {MatDialogClose} from "@angular/material/dialog";
import { DlgWindowComponent } from './components/dlg-window/dlg-window.component';

@NgModule({
    declarations: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent, CategoryFilterComponent, ProductsCarouselComponent, CountSelectorComponent, LoaderComponent, DlgWindowComponent],
    imports: [
        CommonModule,
        MatButton,
        RouterLink,
        FormsModule,
        CarouselModule,
        MatTooltip,
        MatDialogClose
    ],
    exports: [PasswordRepeatDirective, SnackbarMessageComponent, ProductCardComponent, CategoryFilterComponent, ProductsCarouselComponent, CountSelectorComponent, LoaderComponent,DlgWindowComponent],
})
export class SharedModule {
}
