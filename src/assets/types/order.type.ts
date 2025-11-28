import {OrderProductType} from './order-product.type';

export interface OrderType {
  id: number,
  deliveryCost:number,
  deliveryType_id: number,
  deliveryType: string,
  deliveryInfo?:{
    region: string,
    zip: string,
    city: string,
    street: string,
    house: string,
  },
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  paymentType_id: number,
  paymentType: string,
  comment: string|null,
  status_id: number,
  statusName:string,
  items:OrderProductType[],
  createdAt: string|null,
  updatedAt: string|null,
  totalAmount: number,
}
