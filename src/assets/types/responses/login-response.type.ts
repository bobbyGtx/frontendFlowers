import {DefaultResponseType} from './default-response.type';
import {AuthInfoType} from '../auth-info.type';

export interface LoginResponseType extends DefaultResponseType {
  user?: AuthInfoType;
}
