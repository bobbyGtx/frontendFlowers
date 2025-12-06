import {DefaultResponseType} from './default-response.type';
import {UserDataType, UserType} from '../user-data.type';

export interface UserDataResponseType extends DefaultResponseType {
  user?: UserType;//данные, полученные с сервера
  userData?: UserDataType;//обработанные в сервисе UserType данные
}
