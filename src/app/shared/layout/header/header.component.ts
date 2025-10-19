import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {CategoryType} from '../../../../types/category.type';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() categories: CategoryType[] = [];
  authService: AuthService = inject(AuthService);
  _snackbar: MatSnackBar = inject(MatSnackBar);
  router:Router=inject(Router);
  isLogged: boolean;
  subscriptions$: Subscription = new Subscription();

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    this.subscriptions$.add(
      this.authService.isLogged$.subscribe(isLoggedIn => {
        this.isLogged = isLoggedIn;
      }),
    );
  }

  logout(): void {
    this.subscriptions$.add(
      this.authService.logout()
        .subscribe({
          next: () => {this.doLogout();},
          error: () => {this.doLogout();}
        })
    );
  }

  doLogout():void{
    this.authService.removeTokens();
    this.authService.userId=null;
    this._snackbar.open(`You have successfully logged out.`, 'Ok');
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
