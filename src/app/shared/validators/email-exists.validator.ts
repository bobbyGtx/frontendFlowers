import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {AuthService} from '../../core/auth/auth.service';
import {inject} from '@angular/core';
import {ShowSnackService} from '../../core/show-snack.service';
import {catchError, distinctUntilChanged, map, Observable, of, switchMap} from 'rxjs';
import {DefaultResponseType} from '../../../assets/types/responses/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {ReqErrorTypes} from '../../../assets/enums/auth-req-error-types.enum';

export function emailExistsValidator(getOriginalEmail: () => string | undefined):AsyncValidatorFn {
  const authService:AuthService=inject(AuthService);
  const showSnackService: ShowSnackService = inject(ShowSnackService);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value as string | null;
    const originalEmail=getOriginalEmail();
    // если email не изменился — не дергаем сервер
    if (!value || value === originalEmail) {
      return of(null);
    }
    return of(value).pipe(
      distinctUntilChanged(),
      switchMap(email => authService.checkEmail(email)),
      map((response:DefaultResponseType) => (response.error ? { emailProblem: true } : null)),
      catchError((err:HttpErrorResponse) => {
        if (err.status >=400 && err.status<500){
          showSnackService.error(err.error.message,ReqErrorTypes.authSignUp);//Эти ошибки фигурируют в регистрации пользователя
          console.error(err.error.message);
          return of({ emailProblem: true });
        }

        console.error(err.message);
        return of(null);//игнорируем ошибки 500
      })
    );

  }
}
