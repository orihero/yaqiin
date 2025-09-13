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

export const bulkDeleteCategories = async (categoryIds: string[]) => {
  const res = await api.delete('/categories/bulk', { data: { categoryIds } });
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete categories');
  return res.data.data;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data.data;
};

export const getCategoriesHierarchy = async (): Promise<Category[]> => {
  const res = await api.get('/categories?limit=1000'); // Get all categories
  return res.data.data;
};

export const getCategoryProductCounts = async (): Promise<{ [categoryId: string]: number }> => {
  const res = await api.get('/categories/product-counts');
  return res.data.data;
};

export const searchCategories = async (searchTerm: string, excludeId?: string): Promise<Category[]> => {
  const params = new URLSearchParams({ 
    limit: '50', // Limit results for better performance
    search: searchTerm 
  });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data.data;
};

export const getInitialCategories = async (excludeId?: string): Promise<Category[]> => {
  const params = new URLSearchParams({ 
    limit: '10', // Fetch initial 10 categories
    page: '1'
  });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data.data;
}; 