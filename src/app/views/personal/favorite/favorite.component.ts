import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FavoriteService} from '../../../shared/services/favorite.service';
import {Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../../core/show-snack.service';
import {FavoritesResponseType} from '../../../../assets/types/responses/favorites-response.type';
import {environment} from '../../../../environments/environment';
import {FavoriteProductType} from '../../../../assets/types/favorite-product.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent implements OnInit, OnDestroy {
  private favoriteService: FavoriteService = inject(FavoriteService);
  private showSnackService: ShowSnackService = inject(ShowSnackService);
  private subscriptions$: Subscription = new Subscription();

  serverImagesPath: string = environment.images;
  favoriteProducts: FavoriteProductType[] = [];

  ngOnInit() {
    this.subscriptions$.add(
      this.favoriteService.getFavorites(true).subscribe({
        next: (data: FavoritesResponseType) => {
          if (data.error || !data.favorites || !Array.isArray(data.favorites)) {
            this.showSnackService.error(this.favoriteService.getFavoritesError);
            throw new Error(data.message);
          }//Если ошибка есть - выводим её и завершаем функцию
          this.favoriteProducts = data.favorites;
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status !== 401 && errorResponse.status !== 403) this.showSnackService.error(this.favoriteService.getFavoritesError);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected (get Favorites) error! Code:${errorResponse.status}`);
        }
      }));
  }

  removeFromFavorites(productId: number): void {
    this.subscriptions$.add(
      this.favoriteService.removeFavorite(productId).subscribe({
        next: (data: FavoritesResponseType) => {
          if (data.error) {
            this.showSnackService.error(this.favoriteService.removeFavoriteError);
            throw new Error(data.message);
          }
          this.favoriteProducts = this.favoriteProducts.filter(product => product.id !== productId);
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error.status !== 401 && errorResponse.status !== 403) this.showSnackService.error(this.favoriteService.removeFavoriteError);
          console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected (remove Favorite) error! Code:${errorResponse.status}`);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
