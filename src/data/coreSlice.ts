import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants';

interface IUser {
  id: string;
  username: string;
  email: string;
  roles?: string[];
  [key: string]: any;
}

interface ILoginResponse {
  token: string;
  user: IUser;
}

interface CoreState {
  splash: boolean;
  user: IUser | null;
  isLoadingUser: boolean;
  globalLoader: boolean;
}

const initialState: CoreState = {
  splash: true,
  user: null,
  isLoadingUser: true,
  globalLoader: false,
};

const coreSlice = createSlice({
  name: 'core',
  initialState,
  reducers: {
    startGlobalLoader: (state) => {
      state.globalLoader = true;
    },
    stopGlobalLoader: (state) => {
      state.globalLoader = false;
    },
    login: (state, action: PayloadAction<ILoginResponse>) => {
      const { token, user } = action.payload;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      state.user = user;
      state.isLoadingUser = false;
      state.splash = false;
    },
    logout: (state) => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      state.user = null;
      state.isLoadingUser = false;
      state.splash = false;
    },
    startLoading: (state) => {
      state.isLoadingUser = true;
    },
    stopLoading: (state) => {
      state.isLoadingUser = false;
    },
    restoreUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isLoadingUser = false;
      state.splash = false;
    },
  },
});

export const {
  startGlobalLoader,
  stopGlobalLoader,
  login,
  logout,
  startLoading,
  stopLoading,
  restoreUser,
} = coreSlice.actions;

export default coreSlice.reducer;