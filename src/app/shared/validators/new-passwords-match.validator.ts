import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export const newPasswordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('newPassword')?.value;
  const repeat = group.get('newPasswordRepeat')?.value;

  if (!pass) return null;

  return pass === repeat ? null : { passwordMismatch: true };
};
