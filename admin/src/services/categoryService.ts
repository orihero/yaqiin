import api from './api';
import { Category } from '@yaqiin/shared/types/category';

export const getCategories = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data;
};

export const createCategory = async (input: Partial<Category>) => {
  const res = await api.post('/categories', input);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to create category');
  return res.data.data;
};

export const updateCategory = async (input: Partial<Category> & { _id: string }) => {
  const { _id, ...rest } = input;
  const res = await api.put(`/categories/${_id}`, rest);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to update category');
  return res.data.data;
};

export const deleteCategory = async (_id: string) => {
  const res = await api.delete(`/categories/${_id}`);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete category');
  return res.data.data;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data.data;
}; 