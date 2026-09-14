import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../data/constants';
import { logout } from '../data/coreSlice';
import store from '../data/store';

export const getToken = (): string | null =>
  localStorage.getItem(AUTH_TOKEN_KEY);

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

type CallbackFunction = (data?: any) => void;
type ErrorCallback = (err: any, res?: AxiosResponse) => void;

const api = axios.create({
  timeout: 30000,
  paramsSerializer: { indexes: null },
});

const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  store.dispatch(logout());
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      if (isTokenExpired(token)) {
        toast.error('Your session has expired. Please log in again.');
        clearSession();
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = 'application/json';
    return config;
  },
  (error) => Promise.reject(error),
);

export const extractBadRequestErrorMessage = (message: any, errors: any) => {
  let msg = 'Invalid request format';
  if (typeof message === 'string') {
    msg = message;
  }
  if (Array.isArray(message)) {
    [msg] = message;
  }
  if (!message && errors) {
    [msg] = Array.isArray(errors) ? errors : [errors];
  }
  return msg;
};

const getErrorData = (err: AxiosError) => {
  const responseData = err.response?.data as any;
  if (responseData && typeof responseData === 'object') {
    return responseData;
  }

  if (typeof responseData === 'string') {
    try {
      return JSON.parse(responseData);
    } catch {
      return {};
    }
  }

  return {};
};

export const extractErrorMessageFromData = (data: any = {}) => {
  const normalizedData = Array.isArray(data) ? data[0] : data;
  const { message, errors, response } = normalizedData || {};
  const directMessage = extractBadRequestErrorMessage(message, errors);
  if (
    directMessage !== 'Invalid request format' &&
    directMessage !== 'Bad Request Exception'
  ) {
    return directMessage;
  }

  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object') {
    const nestedMessage = extractBadRequestErrorMessage(
      response.message,
      response.errors,
    );
    if (
      nestedMessage !== 'Invalid request format' &&
      nestedMessage !== 'Bad Request Exception'
    ) {
      return nestedMessage;
    }
    if (typeof response.error === 'string') {
      return response.error;
    }
  }

  if (directMessage !== 'Invalid request format') {
    return directMessage;
  }

  return undefined;
};

export const handleError = (err: AxiosError, _res?: AxiosResponse) => {
  const defaultMessage = 'Invalid request, please contact admin';
  const errorData = getErrorData(err);

  if (err.response?.status === 401 || err.response?.status === 403) {
    toast.error('Your session has expired. Please log in again.');
    clearSession();
  } else if (err.response?.status === 400) {
    const msg = extractErrorMessageFromData(errorData);
    toast.error(msg || defaultMessage);
  } else if (err.response?.status && err.response.status >= 400) {
    const msg = extractErrorMessageFromData(errorData);
    toast.error(msg || errorData.message || defaultMessage);
  } else {
    const message = err.message || 'Unknown error, contact admin';
    const finalMessage = message.toLowerCase().includes('network')
      ? "Can't reach server, Check connectivity"
      : message;
    toast.error(finalMessage);
  }
};

export const handleResponse = (
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return {
    then: (response: AxiosResponse) => {
      callBack(response.data);
      return Promise.resolve(response);
    },
    catch: (error: AxiosError) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
      return Promise.reject(error);
    },
  };
};

export const get = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .get(url)
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const search = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  // Remove undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data || {}).filter(([, v]) => v !== undefined),
  );

  return api
    .get(url, { params: cleanData })
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const post = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .post(url, data)
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const postFile = (
  url: string,
  data: FormData,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const put = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .put(url, data)
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const patch = (
  url: string,
  data: any,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .patch(url, data)
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const del = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .delete(url)
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const downLoad = (
  url: string,
  callBack: CallbackFunction,
  errorCallBack?: ErrorCallback,
) => {
  return api
    .get(url, { responseType: 'blob' })
    .then((response) => callBack(response.data))
    .catch((error) => {
      if (errorCallBack) {
        errorCallBack(error, error.response);
      } else {
        handleError(error, error.response);
      }
    });
};

export const triggerDownLoad = (data: Blob, fileName = 'export.csv') => {
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(data);
  a.download = fileName;
  a.click();
};

// ── Promise-based variants ────────────────────────────────────────────────────
// The callback helpers above swallow errors and resolve to `undefined`, which
// makes them unusable with async/await. These variants resolve with the response
// body and reject with a normalised Error carrying the server's message, so
// callers can render failures inline instead of relying on a toast.

export interface ApiError extends Error {
  response?: AxiosResponse;
  /**
   * The server rejected the session and it has been cleared.
   *
   * Carried explicitly because the message alone cannot be told apart from an
   * ordinary failure, and a caller running a sequence of requests has to stop
   * rather than send the rest without a token.
   */
  sessionExpired?: boolean;
}

/** True for the error `getAsync`/`postAsync` raise once the session is gone. */
export const isSessionExpired = (err: unknown): boolean =>
  err instanceof Error && (err as ApiError).sessionExpired === true;

const asFriendlyError = (err: AxiosError): ApiError => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    clearSession();
    const expired: ApiError = new Error(
      'Your session has expired. Please log in again.',
    );
    expired.response = err.response;
    expired.sessionExpired = true;
    return expired;
  }
  const message =
    extractErrorMessageFromData(getErrorData(err)) ||
    (err.message?.toLowerCase().includes('network')
      ? "Can't reach server, Check connectivity"
      : err.message) ||
    'Invalid request, please contact admin';
  const error: ApiError = new Error(message);
  error.response = err.response;
  return error;
};

export const getAsync = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> =>
  api
    .get<T>(url, params ? { params } : undefined)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      throw asFriendlyError(error);
    });

export const postAsync = <T = unknown>(
  url: string,
  data: unknown,
  /** Per-call overrides, such as a longer `timeout` for slow endpoints. */
  config?: AxiosRequestConfig,
): Promise<T> =>
  api
    .post<T>(url, data, config)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      throw asFriendlyError(error);
    });

export default api;
