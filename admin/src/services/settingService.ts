import axios from 'axios';
import { Setting } from '@yaqiin/shared/types/setting';

export const getSettings = async (page = 1, limit = 10, search = '') => {
  const { data } = await axios.get(`/api/settings`, { params: { page, limit, search } });
  return data;
};

export const createSetting = async (input: Partial<Setting>) => {
  const { data } = await axios.post(`/api/settings`, input);
  return data;
};

export const updateSetting = async (input: Partial<Setting> & { _id: string }) => {
  const { _id, ...rest } = input;
  const { data } = await axios.put(`/api/settings/${_id}`, rest);
  return data;
};

export const deleteSetting = async (_id: string) => {
  const { data } = await axios.delete(`/api/settings/${_id}`);
  return data;
}; 