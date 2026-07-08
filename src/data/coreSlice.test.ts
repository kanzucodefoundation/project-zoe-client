import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import coreReducer, {
  login,
  logout,
  startGlobalLoader,
  stopGlobalLoader,
  startLoading,
  stopLoading,
  restoreUser,
} from './coreSlice';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants';

const makeStore = () => configureStore({ reducer: { core: coreReducer } });

const fakeUser = { id: '1', username: 'alice', email: 'alice@example.com' };
const fakeToken = 'fake-jwt';

beforeEach(() => localStorage.clear());

// ─── login ────────────────────────────────────────────────────────────────────

describe('login action', () => {
  it('stores user in state', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    expect(store.getState().core.user).toMatchObject({ username: 'alice' });
  });

  it('writes token to localStorage', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(fakeToken);
  });

  it('writes user to localStorage', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY) ?? '{}')).toMatchObject({ username: 'alice' });
  });

  it('clears the loading and splash flags', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    const { isLoadingUser, splash } = store.getState().core;
    expect(isLoadingUser).toBe(false);
    expect(splash).toBe(false);
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout action', () => {
  it('clears user from state', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    store.dispatch(logout());
    expect(store.getState().core.user).toBeNull();
  });

  it('removes token from localStorage', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    store.dispatch(logout());
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('removes user from localStorage', () => {
    const store = makeStore();
    store.dispatch(login({ token: fakeToken, user: fakeUser }));
    store.dispatch(logout());
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });

  it('clears loading and splash flags', () => {
    const store = makeStore();
    store.dispatch(logout());
    const { isLoadingUser, splash } = store.getState().core;
    expect(isLoadingUser).toBe(false);
    expect(splash).toBe(false);
  });
});

// ─── global loader ────────────────────────────────────────────────────────────

describe('startGlobalLoader / stopGlobalLoader', () => {
  it('sets globalLoader to true', () => {
    const store = makeStore();
    store.dispatch(startGlobalLoader());
    expect(store.getState().core.globalLoader).toBe(true);
  });

  it('sets globalLoader back to false', () => {
    const store = makeStore();
    store.dispatch(startGlobalLoader());
    store.dispatch(stopGlobalLoader());
    expect(store.getState().core.globalLoader).toBe(false);
  });
});

// ─── loading flags ────────────────────────────────────────────────────────────

describe('startLoading / stopLoading', () => {
  it('startLoading sets isLoadingUser to true', () => {
    const store = makeStore();
    store.dispatch(stopLoading()); // ensure it's false first
    store.dispatch(startLoading());
    expect(store.getState().core.isLoadingUser).toBe(true);
  });

  it('stopLoading sets isLoadingUser to false', () => {
    const store = makeStore();
    store.dispatch(startLoading());
    store.dispatch(stopLoading());
    expect(store.getState().core.isLoadingUser).toBe(false);
  });
});

// ─── restoreUser ──────────────────────────────────────────────────────────────

describe('restoreUser', () => {
  it('sets user in state without requiring a token', () => {
    const store = makeStore();
    store.dispatch(restoreUser(fakeUser));
    expect(store.getState().core.user).toMatchObject({ username: 'alice' });
  });

  it('clears loading and splash flags', () => {
    const store = makeStore();
    store.dispatch(restoreUser(fakeUser));
    const { isLoadingUser, splash } = store.getState().core;
    expect(isLoadingUser).toBe(false);
    expect(splash).toBe(false);
  });

  it('does not write anything to localStorage', () => {
    const store = makeStore();
    store.dispatch(restoreUser(fakeUser));
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });
});
