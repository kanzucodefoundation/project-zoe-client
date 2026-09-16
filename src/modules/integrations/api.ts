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

/** The fields Zoe reads from QuickBooks' CompanyInfo response. */
export interface QBCompanyInfo {
  CompanyInfo?: {
    CompanyName?: string;
    LegalName?: string;
    Country?: string;
    CompanyAddr?: {
      Line1?: string;
      City?: string;
      CountrySubDivisionCode?: string;
    };
  };
}

/** The OpenID profile QuickBooks returns for the connected user. */
export interface QBUserInfo {
  sub?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  emailVerified?: boolean;
}

export const fetchQBCompanyInfo = async (): Promise<QBCompanyInfo> => {
  const res = await api.get<QBCompanyInfo>(remoteRoutes.quickbooksCompanyInfo);
  return res.data;
};

export const fetchQBUserInfo = async (): Promise<QBUserInfo> => {
  const res = await api.get<QBUserInfo>(remoteRoutes.quickbooksUserInfo);
  return res.data;
};
