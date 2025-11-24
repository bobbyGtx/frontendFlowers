import {DefaultResponseType} from './default-response.type';
import {DeliveryTypeType} from '../delivery-type.type';

export interface DeliveryTypesResponseType extends DefaultResponseType {
  deliveryTypes?: DeliveryTypeType[];
}
