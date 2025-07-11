import api from './api';
import { Setting } from '@yaqiin/shared/types/setting';

export const getSettings = async (page = 1, limit = 10, search = '') => {
  const { data } = await api.get(`/settings`, { params: { page, limit, search } });
  return data;
};

export const createSetting = async (input: Partial<Setting>) => {
  const { data } = await api.post(`/settings`, input);
  return data;
};

export const updateSetting = async (input: Partial<Setting> & { _id: string }) => {
  const { _id, ...rest } = input;
  const { data } = await api.put(`/settings/${_id}`, rest);
  return data;
};

export const deleteSetting = async (_id: string) => {
  const { data } = await api.delete(`/settings/${_id}`);
  return data;
}; 