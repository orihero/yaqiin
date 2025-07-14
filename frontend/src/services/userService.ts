import api from './api';
import type { User as UserBase } from '@yaqiin/shared/types/user';

export interface User extends UserBase {
  shopId?: string;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get('/users/me');
  return res.data.data;
} 