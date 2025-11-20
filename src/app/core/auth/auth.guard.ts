import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import {ShowSnackService} from '../show-snack.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService:AuthService = inject(AuthService);
  const showSnackService:ShowSnackService = inject(ShowSnackService);
  if (authService.getIsLoggedIn()){
    return true;
  }else{
    showSnackService.error('Для доступа необходима авторизация');
    inject(Router).navigate(['/login']);
    return false;
  }

};
