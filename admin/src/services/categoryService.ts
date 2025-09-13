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

export const getRootCategories = async (excludeId?: string): Promise<Category[]> => {
  const params = new URLSearchParams({ 
    limit: '1000', // Get all root categories
    page: '1'
  });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  // Filter to only root categories on the frontend if backend doesn't support it
  const allCategories = res.data.data;
  return allCategories.filter((category: Category) => !category.parentId || category.parentId === null || category.parentId === '');
};

export const getCategoriesByParent = async (parentId?: string | null, excludeId?: string): Promise<Category[]> => {
  if (!parentId) {
    // For root categories, get only root categories
    return getRootCategories(excludeId);
  }
  
  // For subcategories, query with parentId
  const params = new URLSearchParams({ parentId });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data.data;
};

export const searchRootCategories = async (searchTerm: string, excludeId?: string): Promise<Category[]> => {
  const params = new URLSearchParams({ 
    limit: '50',
    search: searchTerm 
  });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  // Filter to only root categories on the frontend if backend doesn't support it
  const allCategories = res.data.data;
  return allCategories.filter((category: Category) => !category.parentId || category.parentId === null || category.parentId === '');
};

export const searchCategoriesByParent = async (searchTerm: string, parentId?: string | null, excludeId?: string): Promise<Category[]> => {
  if (!parentId) {
    // For root categories, search only root categories
    return searchRootCategories(searchTerm, excludeId);
  }
  
  // For subcategories, search with parentId
  const params = new URLSearchParams({ 
    limit: '50',
    search: searchTerm,
    parentId 
  });
  if (excludeId) params.append('excludeId', excludeId);
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data.data;
}; 