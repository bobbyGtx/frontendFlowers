
/*
*Сервер передает данные пользователя в этом формате
 */
export interface UserType {
  id: number,
  email: string,
  paymentType_id: number|null,
  deliveryType_id: number|null,
  deliveryInfo:DeliveryInfoType|null,
  firstName: string|null,
  lastName: string|null,
  phone: string|null,
  emailVerification:boolean,
}

export interface UserDataType {
  id: number,
  email: string,
  paymentType_id: number,
  deliveryType_id: number,
  region:string,
  zip:string,
  city:string,
  street:string,
  house:string,
  firstName: string,
  lastName: string,
  phone: string,
  emailVerification:boolean,
}

export interface UserPatchData {
  email?: string,
  paymentType_id?: number|null,
  deliveryType_id?: number|null,
  deliveryInfo?:DeliveryInfoType|null,
  firstName?: string|null,
  lastName?: string|null,
  phone?: string|null,
  oldPassword?: string,
  newPassword?: string,
  newPasswordRepeat?: string,
}

export interface DeliveryInfoType{
  region?: string,
  zip?: string,
  city?: string,
  street?: string,
  house?: string,
} //тип поля deliveryInfo
