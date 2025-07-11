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

export const getShop = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}`);
  return res.data;
};

export const getShopCouriers = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}/couriers`);
  return res.data;
};

export const getShopAvailableCouriers = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}/available-couriers`);
  return res.data;
};

export const assignCourierToShop = async (shopId: string, courierId: string) => {
  const res = await api.post(`/shops/${shopId}/couriers/${courierId}`);
  return res.data;
};

export const unassignCourierFromShop = async (shopId: string, courierId: string) => {
  const res = await api.delete(`/shops/${shopId}/couriers/${courierId}`);
  return res.data;
}; 