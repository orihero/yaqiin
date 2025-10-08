import api from './api';
import { Setting } from '@yaqiin/shared/types/setting';

export const getSettings = async (page = 1, limit = 100, search = '') => {
  const { data } = await api.get(`/settings`, { params: { page, limit, search } });
  return data;
};

export const getSettingByKey = async (key: string): Promise<Setting | null> => {
  const { data } = await api.get(`/settings`, { params: { key, limit: 1 } });
  return data.data?.[0] || null;
};
