import {ReqErrorTypes} from '../enums/auth-req-error-types.enum';
import {AppLanguages} from '../enums/app-languages.enum';

export type UserSuccessMsgType = {
  success: string;
} & {
  [key in AppLanguages]: string;
};
export type UserInfoMsgType = {
  info: string,
} & {
  [key in AppLanguages]: string;
};

export type UserErrorsGroupType = {
  [key in ReqErrorTypes]:Array<UserErrorType>
};

export type UserErrorType = {
  error:string,
} & {
  [key in AppLanguages]: string;
};


