import {DefaultResponseType} from './default-response.type';
import {PaymentTypeType} from '../payment-type.type';

export interface PaymentTypesResponseType extends DefaultResponseType {
  paymentTypes?: PaymentTypeType[];
}
