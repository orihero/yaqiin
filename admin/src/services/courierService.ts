import { Courier } from '@yaqiin/shared/types/courier';
import api from './api';

export async function getCouriers(page = 1, limit = 5, search = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/couriers?${params.toString()}`);
  return res.data;
}

export async function createCourier(input: Partial<Courier>) {
  const res = await api.post('/couriers', input);
  return res.data;
}

export async function updateCourier(input: Partial<Courier> & { _id: string }) {
  const { _id, ...rest } = input;
  const res = await api.put(`/couriers/${_id}`, rest);
  return res.data;
}

export async function deleteCourier(id: string) {
  const res = await api.delete(`/couriers/${id}`);
  return res.data;
}

export const getAllCouriers = async (): Promise<Courier[]> => {
  const res = await api.get('/couriers');
  return res.data.data;
}; 