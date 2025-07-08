import api from './api';
import { Order } from '@yaqiin/shared/types/order';

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getOrders = async (page = 1, limit = 10): Promise<OrderListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await api.get(`/orders?${params.toString()}`);
  return response.data;
};

export const createOrder = async (input: any): Promise<Order> => {
  const { orderNumber, ...rest } = input;
  const response = await api.post('/orders', rest);
  if (!response.data.success) throw new Error(response.data?.error?.message || 'Failed to create order');
  return response.data.data;
};

export const updateOrder = async (input: Partial<Order> & { _id: string }): Promise<Order> => {
  const { _id, orderNumber, ...rest } = input;
  const response = await api.put(`/orders/${_id}`, rest);
  if (!response.data.success) throw new Error(response.data?.error?.message || 'Failed to update order');
  return response.data.data;
};

export const deleteOrder = async (_id: string): Promise<Order> => {
  const response = await api.delete(`/orders/${_id}`);
  if (!response.data.success) throw new Error(response.data?.error?.message || 'Failed to delete order');
  return response.data.data;
};

export type { Order };

// Add more order-related API calls here as needed 