import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DefaultResponseType} from '../../types/responses/default-response.type';
import {SnackbarMessageComponent} from '../shared/components/snackbar-message/snackbar-message.component';

type SnackSettingsType={
  data?: {
    message: string;
    errors:string[]
  },
  duration:number,
  panelClass:string,
}

@Injectable({
  providedIn: 'root'
})
export class ShowSnackService {
  private _snackbar:MatSnackBar=inject(MatSnackBar);
  private errorSettings:SnackSettingsType={
    duration: 8500,
    panelClass: 'snackbar-error',
  };
  private multiErrorSettings:SnackSettingsType={
    data:{
      message: '',
      errors: [],
    },
    duration: 100000,
    panelClass: 'snackbar-error',
  };
  private successSettings:SnackSettingsType={
    duration: 2500,
    panelClass: 'snackbar-success',
  };
  private infoSettings:SnackSettingsType={
    duration: 2500,
    panelClass: 'snackbar-info',
  };

  error(message:string,code:number|null=null):void{
    code?message = `${message}  Code: ${code}`:null;
    this._snackbar.open(message,'ok',this.errorSettings);
  }//Simple error with string

  errorObj(error:DefaultResponseType,code:number|null=null):void{
    let errMessage:string = code?`${error.message}  Code: ${code}`:error.message;
    if (error.messages && Array.isArray(error.messages) && error.messages.length>0) {
      let multiErrorSettings:SnackSettingsType=this.multiErrorSettings;
      multiErrorSettings['data']!['message'] = error.message;
      multiErrorSettings['data']!['errors'] = error.messages;
      this._snackbar.openFromComponent(SnackbarMessageComponent, multiErrorSettings);
    }else{
      this._snackbar.open(errMessage,'ok',this.errorSettings);
    }
  }//Simple error msg & messages[]?

  success(message:string):void{
    this._snackbar.open(message,'ok',this.successSettings);
  }
  info(message:string):void{
    this._snackbar.open(message,'ok',this.infoSettings);
  }
}
