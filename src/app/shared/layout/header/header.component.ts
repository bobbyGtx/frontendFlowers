import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {Router} from '@angular/router';
import {ShowSnackService} from '../../../core/show-snack.service';
import {CategoryWithTypesType} from '../../../../types/category-with-types.type';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() categories: CategoryWithTypesType[] = [];
  authService: AuthService = inject(AuthService);
  showSnackService: ShowSnackService = inject(ShowSnackService);
  router:Router=inject(Router);
  isLogged: boolean=false;
  subscriptions$: Subscription = new Subscription();

  constructor() {}

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
    this.showSnackService.success(`You have successfully logged out.`);
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
