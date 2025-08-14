import api from './api';
import { Product } from '@yaqiin/shared/types/product';

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getProducts = async (page = 1, limit = 10, search = '', categoryId?: string, shopId?: string): Promise<ProductListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);
  if (shopId) params.append('shopId', shopId);
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products');
  return res.data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
};

// Bulk fetch products by IDs (if backend supports it)
export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  const res = await api.get(`/products/by-ids?ids=${ids.join(',')}`);
  return res.data.data;
};

// Get related products for a specific product
export const getRelatedProducts = async (productId: string): Promise<Product[]> => {
  const res = await api.get(`/products/${productId}/related`);
  return res.data.data;
}; 