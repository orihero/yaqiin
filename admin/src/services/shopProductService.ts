import api from './api';
import { ShopProduct, ShopProductDisplay } from '@yaqiin/shared/types/product';

export interface ShopProductListResponse {
  success: boolean;
  data: ShopProductDisplay[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Get all products assigned to a specific shop
export const getShopProducts = async (shopId: string, page = 1, limit = 10, search = ''): Promise<ShopProductListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), shopId });
  if (search) params.append('search', search);
  const response = await api.get(`/shop-products?${params.toString()}`);
  return response.data;
};

// Assign a product to a shop
export const assignProductToShop = async (shopId: string, productId: string, shopProductData: Partial<ShopProduct>): Promise<ShopProduct> => {
  const response = await api.post('/shop-products', {
    shopId,
    productId,
    ...shopProductData,
  });
  return response.data.data;
};

// Update shop product data
export const updateShopProduct = async (shopProductId: string, data: Partial<ShopProduct>): Promise<ShopProduct> => {
  const response = await api.put(`/shop-products/${shopProductId}`, data);
  return response.data.data;
};

// Remove a product from a shop
export const removeProductFromShop = async (shopProductId: string): Promise<void> => {
  await api.delete(`/shop-products/${shopProductId}`);
};

// Get available products that can be assigned to a shop
export const getAvailableProductsForShop = async (shopId: string, page = 1, limit = 10, search = ''): Promise<{ success: boolean; data: any[] }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), shopId });
  if (search) params.append('search', search);
  const response = await api.get(`/shop-products/available?${params.toString()}`);
  return response.data;
};

// Get a specific shop product
export const getShopProduct = async (shopProductId: string): Promise<ShopProductDisplay> => {
  const response = await api.get(`/shop-products/${shopProductId}`);
  return response.data.data;
};
