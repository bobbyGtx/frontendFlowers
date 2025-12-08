import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {OrderService} from '../../../shared/services/order.service';
import {Subscription} from 'rxjs';
import {OrderType} from '../../../../assets/types/order.type';
import {HttpErrorResponse} from '@angular/common/http';
import {OrdersResponseType} from '../../../../assets/types/responses/orders-response.type';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  private showSnackService:ShowSnackService=inject(ShowSnackService);
  private orderService:OrderService=inject(OrderService);
  private subscriptions$:Subscription=new Subscription();
  protected orders:OrderType[]=[];

  ngOnInit() {
    this.subscriptions$.add(this.orderService.getOrders().subscribe({
      next:(data:OrdersResponseType)=>{
        if (data.error || !data.orders){
          this.showSnackService.error(this.orderService.getOrdersError);
          throw new Error(data.message);
        }
        this.orders = data.orders;
      },
      error:(errorResponse:HttpErrorResponse)=>{
        this.showSnackService.error(this.orderService.getOrdersError);
        console.error(errorResponse.error.message ? errorResponse.error.message : `Unexpected (get Orders) error! Code:${errorResponse.status}`);
      },
    }));
  }
  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

}
