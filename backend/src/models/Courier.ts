import mongoose, { Schema, Document } from 'mongoose';

export interface ICourierLocation {
  lat: number;
  lng: number;
  lastUpdated: Date;
}

const CourierLocationSchema = new Schema<ICourierLocation>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  lastUpdated: { type: Date, required: true },
}, { _id: false });

export interface ICourierRating {
  average: number;
  totalRatings: number;
}

const CourierRatingSchema = new Schema<ICourierRating>({
  average: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
}, { _id: false });

export interface ICourierEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

const CourierEarningsSchema = new Schema<ICourierEarnings>({
  today: { type: Number, default: 0 },
  thisWeek: { type: Number, default: 0 },
  thisMonth: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
}, { _id: false });

export interface ICourierStatistics {
  totalDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
}

const CourierStatisticsSchema = new Schema<ICourierStatistics>({
  totalDeliveries: { type: Number, default: 0 },
  averageDeliveryTime: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
}, { _id: false });

export interface ICourier extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleType: string;
  licenseNumber?: string;
  currentLocation?: ICourierLocation;
  availability: 'available' | 'busy' | 'offline';
  rating?: ICourierRating;
  earnings?: ICourierEarnings;
  statistics?: ICourierStatistics;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourierSchema = new Schema<ICourier>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, required: true },
  licenseNumber: { type: String },
  currentLocation: { type: CourierLocationSchema },
  availability: { type: String, enum: ['available', 'busy', 'offline'], required: true },
  rating: { type: CourierRatingSchema },
  earnings: { type: CourierEarningsSchema },
  statistics: { type: CourierStatisticsSchema },
  isActive: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICourier>('Courier', CourierSchema); 