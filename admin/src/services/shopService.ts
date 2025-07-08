import api from './api';
import { Shop } from '@yaqiin/shared/types/shop';

export const getShops = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/shops?${params.toString()}`);
  return res.data;
};

export const createShop = async (input: any) => {
  const res = await api.post('/shops', input);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to create shop');
  return res.data.data;
};

export const updateShop = async (input: any) => {
  const { _id, ...rest } = input;
  const res = await api.put(`/shops/${_id}`, rest);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to update shop');
  return res.data.data;
};

export const deleteShop = async (_id: string) => {
  const res = await api.delete(`/shops/${_id}`);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete shop');
  return res.data.data;
};

export const getAllShops = async (): Promise<Shop[]> => {
  const res = await api.get('/shops');
  return res.data.data;
}; 