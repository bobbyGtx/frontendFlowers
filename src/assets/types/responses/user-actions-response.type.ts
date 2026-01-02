import {DefaultResponseType} from './default-response.type';

export interface UserActionsResponseType extends DefaultResponseType {
  timer?: number;
  mailLink?: string;
}
