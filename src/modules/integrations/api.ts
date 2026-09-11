import api from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

export type QBConnectionStatus =
  | { connected: false }
  | {
      connected: true;
      realmId: string;
      environment: 'sandbox' | 'production';
      accessTokenExpiresAt: string;
      refreshTokenExpiresAt: string;
    };

export interface QBConnectUrl {
  url: string;
  state: string;
}

export const fetchQBConnection = async (): Promise<QBConnectionStatus> => {
  const res = await api.get(remoteRoutes.quickbooksConnection);
  return res.data;
};

export const getQBConnectUrl = async (): Promise<QBConnectUrl> => {
  const res = await api.get(remoteRoutes.quickbooksConnect);
  return res.data;
};

export const disconnectQB = async (): Promise<void> => {
  await api.delete(remoteRoutes.quickbooksConnection);
};

export const fetchQBCompanyInfo = async (): Promise<any> => {
  const res = await api.get(remoteRoutes.quickbooksCompanyInfo);
  return res.data;
};

export const fetchQBUserInfo = async (): Promise<any> => {
  const res = await api.get(remoteRoutes.quickbooksUserInfo);
  return res.data;
};
