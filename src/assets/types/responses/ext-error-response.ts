import {HttpErrorResponse} from '@angular/common/http';
import {ErrorSources} from '../../enums/error-sources.enum';

export interface ExtErrorResponseType extends HttpErrorResponse {
  __source:ErrorSources;
}
