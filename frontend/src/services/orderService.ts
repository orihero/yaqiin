import api from './api';
import { Order } from '@yaqiin/shared/types/order';

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getOrders = async (page = 1, limit = 10, status?: string): Promise<OrderListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  const response = await api.get(`/orders?${params.toString()}`);
  return response.data;
};

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  // Add more fields as needed (e.g., address, payment info)
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const response = await api.post('/orders/client', payload);
  return response.data;
}; 