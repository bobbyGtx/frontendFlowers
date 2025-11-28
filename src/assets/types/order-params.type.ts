export interface OrderParamsType {
  deliveryType: number,
  paymentType: number,
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  region?: string,
  zip?: string,
  city?: string,
  street?: string,
  house?: string,
  comment?: string
  redeem?:string
}
