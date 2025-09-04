import api from './api';
import { OrderFlow } from '../../../shared/types/orderFlow';

export class OrderFlowService {
  /**
   * Get all order flows
   */
  static async getAllFlows(): Promise<OrderFlow[]> {
    const response = await api.get('/order-flows');
    return response.data.data;
  }

  /**
   * Get order flow by ID
   */
  static async getFlowById(id: string): Promise<OrderFlow> {
    const response = await api.get(`/order-flows/${id}`);
    return response.data.data;
  }

  /**
   * Get flow for specific shop
   */
  static async getFlowForShop(shopId: string): Promise<OrderFlow> {
    const response = await api.get(`/order-flows/shop/${shopId}`);
    return response.data.data;
  }

  /**
   * Get step by status
   */
  static async getStepByStatus(status: string, shopId?: string): Promise<any> {
    const params = shopId ? { shopId } : {};
    const response = await api.get(`/order-flows/step/${status}`, { params });
    return response.data.data;
  }

  /**
   * Get next possible statuses
   */
  static async getNextStatuses(currentStatus: string, shopId?: string): Promise<string[]> {
    const params = shopId ? { shopId } : {};
    const response = await api.get(`/order-flows/next-statuses/${currentStatus}`, { params });
    return response.data.data;
  }

  /**
   * Check if user can change status
   */
  static async canChangeStatus(
    currentStatus: string,
    newStatus: string,
    userRole: string,
    shopId?: string
  ): Promise<boolean> {
    const response = await api.post('/order-flows/can-change-status', {
      currentStatus,
      newStatus,
      userRole,
      shopId
    });
    return response.data.data.canChange;
  }

  /**
   * Create new order flow
   */
  static async createFlow(flowData: Partial<OrderFlow>): Promise<OrderFlow> {
    const response = await api.post('/order-flows', flowData);
    return response.data.data;
  }

  /**
   * Update order flow
   */
  static async updateFlow(id: string, flowData: Partial<OrderFlow>): Promise<OrderFlow> {
    const response = await api.put(`/order-flows/${id}`, flowData);
    return response.data.data;
  }

  /**
   * Delete order flow
   */
  static async deleteFlow(id: string): Promise<void> {
    await api.delete(`/order-flows/${id}`);
  }

  /**
   * Set flow as default
   */
  static async setDefaultFlow(id: string): Promise<OrderFlow> {
    const response = await api.post(`/order-flows/${id}/set-default`);
    return response.data.data;
  }

  /**
   * Get forwarding destinations for a status
   */
  static async getForwardingDestinations(status: string, shopId?: string): Promise<any[]> {
    const params = shopId ? { shopId } : {};
    const response = await api.get(`/order-flows/forwarding-destinations/${status}`, { params });
    return response.data.data;
  }
} 