import api from './api';
import { Product } from '@yaqiin/shared/types/product';

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getProducts = async (page = 1, limit = 10, search = ''): Promise<ProductListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
};

export const createProduct = async (input: Partial<Product> & { images?: File[] }) => {
  let data: Partial<Product> | FormData;
  if (input.images && input.images.length > 0) {
    const form = new FormData();
    form.append('name', JSON.stringify(input.name));
    form.append('description', JSON.stringify(input.description));
    form.append('categoryId', input.categoryId as string);
    form.append('shopId', input.shopId as string);
    form.append('price', String(input.price));
    form.append('unit', input.unit as string);
    form.append('stock', JSON.stringify(input.stock));
    form.append('isActive', String(input.isActive));
    input.images.forEach((file) => form.append('images', file));
    data = form;
  } else {
    data = input;
  }
  const res = await api.post('/products', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to create product');
  return res.data.data;
};

export const updateProduct = async (input: Partial<Product> & { _id: string; images?: File[] }) => {
  let data: Partial<Product> | FormData;
  if (input.images && input.images.length > 0) {
    const form = new FormData();
    form.append('name', JSON.stringify(input.name));
    form.append('description', JSON.stringify(input.description));
    form.append('categoryId', input.categoryId as string);
    form.append('shopId', input.shopId as string);
    form.append('price', String(input.price));
    form.append('unit', input.unit as string);
    form.append('stock', JSON.stringify(input.stock));
    form.append('isActive', String(input.isActive));
    input.images.forEach((file) => form.append('images', file));
    data = form;
  } else {
    data = input;
  }
  const res = await api.put(`/products/${input._id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to update product');
  return res.data.data;
};

export const deleteProduct = async (_id: string) => {
  const res = await api.delete(`/products/${_id}`);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete product');
  return res.data.data;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products');
  return res.data.data;
};

// Add more product-related API calls here as needed 