import {DefaultResponseType} from './default-response.type';
import {UserType} from '../user.type';

export interface LoginResponseType extends DefaultResponseType {
  user?: UserType;
}
