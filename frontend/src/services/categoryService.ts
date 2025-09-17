import api from './api';
import { Category } from '@yaqiin/shared/types/category';

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getCategories = async (page = 1, limit = 20, search = ''): Promise<CategoryListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories?limit=1000'); // Get all categories
  return res.data.data;
}; 