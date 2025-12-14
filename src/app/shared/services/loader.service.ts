import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class LoaderService {
  private activeRequests:number = 0;
  private readonly isShowed$:BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly loaderState$:Observable<boolean> = this.isShowed$.asObservable();

  loaderShow(){
    this.activeRequests++;
    if (this.activeRequests===1){
      this.isShowed$.next(true);
    }
  }

  loaderHide(){
    if (this.activeRequests===1){
      this.activeRequests = 0;
      this.isShowed$.next(false);
    }else this.activeRequests--;
  }
}
