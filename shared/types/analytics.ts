export interface AnalyticsTopProduct {
  productId: string;
  name: string;
  orderCount: number;
  revenue: number;
  /**
   * First image URL of the product, if available
   */
  image?: string;
}

export interface AnalyticsTopShop {
  shopId: string;
  name: string;
  orderCount: number;
  revenue: number;
}

export interface AnalyticsCourierPerformance {
  courierId: string;
  deliveryCount: number;
  averageTime: number;
  rating: number;
}

export interface AnalyticsUserTimeSeries {
  _id: string; // date string (YYYY-MM-DD)
  count: number;
}

export interface AnalyticsPaymentTimeSeries {
  _id: string; // date string (YYYY-MM-DD)
  payments: { method: string; total: number }[];
}

export interface AnalyticsMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalDeliveries: number;
  averageDeliveryTime: number;
  orderCancellationRate: number;
  averageOrderValue: number;
  topProducts?: AnalyticsTopProduct[];
  topShops?: AnalyticsTopShop[];
  courierPerformance?: AnalyticsCourierPerformance[];
  usersTimeSeries?: AnalyticsUserTimeSeries[];
  paymentsTimeSeries?: AnalyticsPaymentTimeSeries[];
}

export interface Analytics {
  _id: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  metrics: AnalyticsMetrics;
  createdAt: Date;
}

// Unified DashboardStats interface for dashboard components
export interface DashboardStats {
  totalOrders?: { value: number; percent?: number };
  newUsers?: { value: number; percent?: number };
  totalRevenue?: { value: number; percent?: number };
  topProducts?: any[];
  totalProducts?: number;
  averageDeliveryTime?: number;
  longestDeliveryTime?: number;
  shortestDeliveryTime?: number;
  usersTimeSeries?: { _id: string; count: number }[];
  paymentsTimeSeries?: { _id: string; payments: { method: string; total: number }[] }[];
  // ...add more fields as needed
} 