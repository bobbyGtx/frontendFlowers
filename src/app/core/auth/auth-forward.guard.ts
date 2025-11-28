import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {inject} from '@angular/core';
import {Location} from '@angular/common';

export const authForwardGuard: CanActivateFn = () => {
  const authService:AuthService = inject(AuthService);
  const router:Router=inject(Router);
  const loc:Location=inject(Location);
  const isLoggedIn = authService.getIsLoggedIn();
  if (isLoggedIn) {
    if (window.history.length > 1) {
      loc.back();
    } else {
      router.navigate(['/']);
    }
    return false;
  }
    return true;
};
