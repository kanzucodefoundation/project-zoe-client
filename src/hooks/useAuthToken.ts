import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../data/store';
import { AUTH_TOKEN_KEY } from '../data/constants';
import { isTokenExpired } from '../utils/ajax';

export function useAuthToken(): string | null {
  const { user } = useSelector((state: RootState) => state.core);

  return useMemo(() => {
    if (!user) return null;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token || isTokenExpired(token)) return null;
    return token;
  }, [user]);
}