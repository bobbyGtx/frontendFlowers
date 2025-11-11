import {CartItemType} from './cart-item.type';

export type CartType = {
  count:number,
  createdAt: number,
  updatedAt: number,
  items:CartItemType[],
}
