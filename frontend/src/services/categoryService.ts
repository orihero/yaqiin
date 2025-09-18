import api from './api';
import { Category } from '@yaqiin/shared/types/category';

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getCategories = async (page = 1, limit = 20, search = '', activeOnly = true): Promise<CategoryListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (activeOnly) params.append('isActive', 'true');
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data;
};

export const getAllCategories = async (activeOnly = true): Promise<Category[]> => {
  const params = new URLSearchParams({ limit: '1000' });
  if (activeOnly) params.append('isActive', 'true');
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data.data;
}; 