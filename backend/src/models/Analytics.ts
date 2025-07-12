import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsTopProduct {
  productId: mongoose.Types.ObjectId;
  name: string;
  orderCount: number;
  revenue: number;
}

const AnalyticsTopProductSchema = new Schema<IAnalyticsTopProduct>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  orderCount: { type: Number, required: true },
  revenue: { type: Number, required: true },
}, { _id: false });

export interface IAnalyticsTopShop {
  shopId: mongoose.Types.ObjectId;
  name: string;
  orderCount: number;
  revenue: number;
}

const AnalyticsTopShopSchema = new Schema<IAnalyticsTopShop>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  orderCount: { type: Number, required: true },
  revenue: { type: Number, required: true },
}, { _id: false });

export interface IAnalyticsCourierPerformance {
  courierId: mongoose.Types.ObjectId;
  deliveryCount: number;
  averageTime: number;
  rating: number;
}

const AnalyticsCourierPerformanceSchema = new Schema<IAnalyticsCourierPerformance>({
  courierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryCount: { type: Number, required: true },
  averageTime: { type: Number, required: true },
  rating: { type: Number, required: true },
}, { _id: false });

export interface IAnalyticsMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  averageDeliveryTime: number;
  orderCancellationRate: number;
  averageOrderValue: number;
  topProducts?: IAnalyticsTopProduct[];
  topShops?: IAnalyticsTopShop[];
  courierPerformance?: IAnalyticsCourierPerformance[];
}

const AnalyticsMetricsSchema = new Schema<IAnalyticsMetrics>({
  totalOrders: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  totalUsers: { type: Number, required: true },
  activeUsers: { type: Number, required: true },
  newUsers: { type: Number, required: true },
  averageDeliveryTime: { type: Number, required: true },
  orderCancellationRate: { type: Number, required: true },
  averageOrderValue: { type: Number, required: true },
  topProducts: [AnalyticsTopProductSchema],
  topShops: [AnalyticsTopShopSchema],
  courierPerformance: [AnalyticsCourierPerformanceSchema],
}, { _id: false });

export interface IAnalytics extends Document {
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  metrics: IAnalyticsMetrics;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  date: { type: Date, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  metrics: { type: AnalyticsMetricsSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema); 