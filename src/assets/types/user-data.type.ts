
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
}//ответ от сервера с json полем "deliveryInfo"

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
}//данные пользователя для удобной работы с формами

export interface UserPatchDataType {
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
}//тип для передачи изменений на сервер

export interface DeliveryInfoType{
  region?: string,
  zip?: string,
  city?: string,
  street?: string,
  house?: string,
} //тип поля deliveryInfo
