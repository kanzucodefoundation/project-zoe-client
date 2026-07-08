import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import {
  extractBadRequestErrorMessage,
  extractErrorMessageFromData,
  handleError,
  handleResponse,
  isTokenExpired,
  getToken,
} from './ajax';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../data/constants';

// Module-level mocks (hoisted by vitest)
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
}));
vi.mock('../data/store', () => ({
  default: { dispatch: vi.fn() },
}));

import { toast } from 'react-toastify';
import store from '../data/store';

const toastError = vi.mocked(toast.error);
const storeDispatch = vi.mocked(store.dispatch);

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeAxiosError = (status?: number, data?: unknown): AxiosError => {
  const err = new AxiosError('Test error');
  if (status !== undefined) {
    (err as any).response = { status, data: data ?? {}, headers: {}, config: {}, statusText: '' };
  }
  return err;
};

// ─── extractBadRequestErrorMessage ───────────────────────────────────────────

describe('extractBadRequestErrorMessage', () => {
  it('returns string message as-is', () => {
    expect(extractBadRequestErrorMessage('Bad input', null)).toBe('Bad input');
  });

  it('returns first element when message is an array', () => {
    expect(extractBadRequestErrorMessage(['First error', 'Second'], null)).toBe('First error');
  });

  it('falls back to errors when message is absent', () => {
    expect(extractBadRequestErrorMessage(undefined, ['Email is required'])).toBe('Email is required');
    expect(extractBadRequestErrorMessage(null, ['Email is required'])).toBe('Email is required');
  });

  it('handles errors as a non-array value', () => {
    expect(extractBadRequestErrorMessage(null, 'Some error string')).toBe('Some error string');
  });

  it('returns default when both message and errors are absent', () => {
    expect(extractBadRequestErrorMessage(undefined, undefined)).toBe('Invalid request format');
    expect(extractBadRequestErrorMessage(null, null)).toBe('Invalid request format');
  });
});

// ─── extractErrorMessageFromData ─────────────────────────────────────────────

describe('extractErrorMessageFromData', () => {
  it('returns undefined for undefined input', () => {
    expect(extractErrorMessageFromData(undefined)).toBeUndefined();
  });

  it('extracts direct string message', () => {
    expect(extractErrorMessageFromData({ message: 'Validation failed' })).toBe('Validation failed');
  });

  it('extracts message from first element of an array', () => {
    expect(extractErrorMessageFromData([{ message: 'Array error' }])).toBe('Array error');
  });

  it('falls back to nested response.message when top-level is generic', () => {
    const data = { message: 'Bad Request Exception', response: { message: 'Email already in use' } };
    expect(extractErrorMessageFromData(data)).toBe('Email already in use');
  });

  it('falls back to response.error when response.message is also generic', () => {
    const data = { message: 'Bad Request Exception', response: { message: 'Bad Request Exception', error: 'Conflict' } };
    expect(extractErrorMessageFromData(data)).toBe('Conflict');
  });

  it('returns response string directly when response is a string', () => {
    const data = { message: 'Bad Request Exception', response: 'Duplicate entry' };
    expect(extractErrorMessageFromData(data)).toBe('Duplicate entry');
  });

  it('falls back to errors array when message is absent', () => {
    expect(extractErrorMessageFromData({ errors: ['Field required'] })).toBe('Field required');
  });

  it('returns undefined when no meaningful message exists', () => {
    expect(extractErrorMessageFromData({ foo: 'bar' })).toBeUndefined();
  });
});

// ─── handleError ─────────────────────────────────────────────────────────────

describe('handleError', () => {
  beforeEach(() => {
    toastError.mockClear();
    storeDispatch.mockClear();
    localStorage.clear();
  });

  it('shows session-expired toast and clears session on 401', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'tok');
    localStorage.setItem(AUTH_USER_KEY, '{}');

    handleError(makeAxiosError(401));

    expect(toastError).toHaveBeenCalledWith('Your session has expired. Please log in again.');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(storeDispatch).toHaveBeenCalledTimes(1);
  });

  it('shows session-expired toast and clears session on 403', () => {
    handleError(makeAxiosError(403));

    expect(toastError).toHaveBeenCalledWith('Your session has expired. Please log in again.');
    expect(storeDispatch).toHaveBeenCalledTimes(1);
  });

  it('shows extracted message on 400', () => {
    const err = makeAxiosError(400, { message: 'Email is invalid' });
    handleError(err);

    expect(toastError).toHaveBeenCalledWith('Email is invalid');
  });

  it('shows default message on 400 when no extractable message', () => {
    handleError(makeAxiosError(400, {}));

    expect(toastError).toHaveBeenCalledWith('Invalid request, please contact admin');
  });

  it('shows extracted message for >=400 errors (e.g. 500)', () => {
    const err = makeAxiosError(500, { message: 'Internal server error' });
    handleError(err);

    expect(toastError).toHaveBeenCalledWith('Internal server error');
  });

  it('falls back to errorData.message for >=400 when extraction fails', () => {
    const err = makeAxiosError(503, { message: 'Service unavailable' });
    handleError(err);

    expect(toastError).toHaveBeenCalledWith('Service unavailable');
  });

  it('shows connectivity message for network errors', () => {
    const err = new AxiosError('Network Error');
    handleError(err);

    expect(toastError).toHaveBeenCalledWith("Can't reach server, Check connectivity");
  });

  it('shows the error message for non-network client errors', () => {
    const err = new AxiosError('Request aborted');
    handleError(err);

    expect(toastError).toHaveBeenCalledWith('Request aborted');
  });

  it('shows fallback message when error has no message', () => {
    const err = new AxiosError('');
    handleError(err);

    expect(toastError).toHaveBeenCalledWith('Unknown error, contact admin');
  });
});

// ─── handleResponse ──────────────────────────────────────────────────────────

describe('handleResponse', () => {
  beforeEach(() => {
    toastError.mockClear();
    storeDispatch.mockClear();
  });

  it('calls the callback with response.data on success', () => {
    const callback = vi.fn();
    const handler = handleResponse(callback);
    const fakeResponse = { data: { id: 1, name: 'Alice' } } as AxiosResponse;

    handler.then(fakeResponse);

    expect(callback).toHaveBeenCalledWith({ id: 1, name: 'Alice' });
  });

  it('returns a resolved promise on success', async () => {
    const handler = handleResponse(vi.fn());
    const fakeResponse = { data: {} } as AxiosResponse;
    const result = await handler.then(fakeResponse);

    expect(result).toBe(fakeResponse);
  });

  it('calls errorCallBack instead of handleError when provided', async () => {
    const errorCallBack = vi.fn();
    const handler = handleResponse(vi.fn(), errorCallBack);
    const fakeError = makeAxiosError(422, { message: 'Unprocessable' });

    await handler.catch(fakeError).catch(() => {});

    expect(errorCallBack).toHaveBeenCalledWith(fakeError, fakeError.response);
    expect(toastError).not.toHaveBeenCalled();
  });

  it('calls handleError (toasts) when no errorCallBack is provided', async () => {
    const handler = handleResponse(vi.fn());
    const fakeError = makeAxiosError(500, { message: 'Server crash' });

    await handler.catch(fakeError).catch(() => {});

    expect(toastError).toHaveBeenCalled();
  });

  it('rejects the promise on error', async () => {
    const handler = handleResponse(vi.fn(), vi.fn());
    const fakeError = makeAxiosError(400);

    await expect(handler.catch(fakeError)).rejects.toBe(fakeError);
  });
});

// ─── isTokenExpired ───────────────────────────────────────────────────────────

const makeJwt = (expSeconds: number): string => {
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `header.${payload}.signature`;
};

describe('isTokenExpired', () => {
  it('returns true for an already-expired token', () => {
    expect(isTokenExpired(makeJwt(Math.floor(Date.now() / 1000) - 3600))).toBe(true);
  });

  it('returns false for a valid future-expiry token', () => {
    expect(isTokenExpired(makeJwt(Math.floor(Date.now() / 1000) + 3600))).toBe(false);
  });

  it('returns true for a malformed token string', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isTokenExpired('')).toBe(true);
  });

  it('returns true when payload cannot be base64-decoded', () => {
    expect(isTokenExpired('header.!!!invalid!!!.signature')).toBe(true);
  });
});

// ─── getToken ─────────────────────────────────────────────────────────────────

describe('getToken', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('returns the stored token string', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'my-test-token');
    expect(getToken()).toBe('my-test-token');
  });
});
