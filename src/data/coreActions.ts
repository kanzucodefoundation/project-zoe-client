import { coreConstants } from './coreReducer';

export const handleLogin = (data: any) => ({
  type: coreConstants.coreLogin,
  payload: { ...data },
});

export const handleLogout = () => ({
  type: coreConstants.coreLogout,
});

export const startLoading = () => ({
  type: coreConstants.startLoading,
});

export const stopLoading = () => ({
  type: coreConstants.stopLoading,
});

export const coreStartGlobalLoader = () => ({
  type: coreConstants.coreStartGlobalLoader,
});

export const coreStopGlobalLoader = () => ({
  type: coreConstants.coreStopGlobalLoader,
});
