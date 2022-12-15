import * as superagent from 'superagent';
import Toast from './Toast';
import { AUTH_TOKEN_KEY } from '../data/constants';
import { hasNoValue, hasValue } from '../components/inputs/inputHelpers';

export const getToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY);

type CallbackFunction = (data?: any) => void;
type ErrorCallback = (err: any, res: superagent.Response) => void;
type EndCallback = (data?: any) => void;

export const extractBadRequestErrorMessage = (message: any, errors: any) => {
  let msg = 'Invalid request format';
  if (typeof message === 'string') {
    msg = message;
  }
  if (Array.isArray(message)) {
    [msg] = message;
  }
  if (hasNoValue(msg) && hasValue(errors)) {
    [msg] = errors;
  }
  return msg;
};

// eslint-disable-next-line @typescript-eslint/default-param-last
export const handleError = (err: any = {}, res: superagent.Response) => {
  const authError = 22000987;
  const ajaxError = 22000987;
  const defaultMessage = 'Invalid request, please contact admin';
  if ((res && res.forbidden) || (res && res.unauthorized)) {
    Toast.error('Authentication Error', authError);
    window.location.reload();
  } else if (res && res.badRequest) {
    const { message, errors } = res.body;
    const msg = extractBadRequestErrorMessage(message, errors);
    Toast.error(msg || defaultMessage, ajaxError);
  } else if (
    (res && res.clientError)
    || (res && res.notAcceptable)
    || (res && res.error)
  ) {
    const { message } = res.body || {};
    Toast.error(message || defaultMessage, ajaxError);
  } else {
    const message = err.message || 'Unknown error, contact admin';
    const finalMessage = message.indexOf('offline') !== -1
      ? "Can't reach server, Check connectivity"
      : message;
    Toast.error(finalMessage, ajaxError);
  }
};

const timeout = 0;
// eslint-disable-next-line @typescript-eslint/default-param-last
export const isAuthError = (err: any = {}, res: superagent.Response) => {
  if (err) {
    console.log(err);
    return false;
  }
  return (res && res.forbidden) || (res && res.unauthorized);
};

export const handleResponse = (
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => (err: any, res: superagent.Response) => {
  try {
    if (err || !res.ok) {
      if (errorCallBack) {
        errorCallBack(err, res);
      } else {
        handleError(err, res);
      }
    } else {
      callBack(res.body);
    }
  } catch (e) {
    console.error('Failed to process response', e);
  } finally {
    if (endCallBack) {
      endCallBack();
    }
  }
};

export const get = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .get(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Accept', 'application/json')
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};
const cleanUp = (data: any = {}) => Object.fromEntries(
  Object.entries(data).filter(([, v]) => v !== undefined),
);

export const search = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  const searchData = cleanUp(data);
  console.log('searchData', searchData);
  superagent
    .get(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Accept', 'application/json')
    .query(searchData)
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const post = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .post(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send(data)
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const postFile = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .post(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Accept', 'application/json')
    .send(data)
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const put = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .put(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(data)
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const del = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .delete(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .set('Accept', 'application/json')
    .timeout(timeout)
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const downLoad = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
  endCallBack?: EndCallback,
) => {
  superagent
    .get(url)
    .set('Authorization', `Bearer ${getToken()}`)
    .responseType('blob')
    .end(handleResponse(callBack, errorCallBack, endCallBack));
};

export const triggerDownLoad = (data: Blob, fileName = 'export.csv') => {
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(data);
  a.download = fileName;
  a.click();
};
