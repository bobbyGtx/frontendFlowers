import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {DialogDataType} from '../../../assets/types/dialog-data.type';

@Injectable({providedIn: 'root'})
export class DlgWindowService {
  public dlgOpenState$:Subject<DialogDataType> = new Subject<DialogDataType>();

  public openDialog(title:string, htmlContent:string,redirectURL:string|null=null):void{
    this.dlgOpenState$.next({
      title:title,
      htmlContent:htmlContent,
      redirectUrl:redirectURL,
    });
  }
}
