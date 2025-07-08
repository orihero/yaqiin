import api from './api';
import type { User } from '@yaqiin/shared/types/user';

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get('/users/me');
  return res.data.data;
} 