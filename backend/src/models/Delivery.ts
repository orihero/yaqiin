import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const DeliveryLocationSchema = new Schema<IDeliveryLocation>({
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
}, { _id: false });

export interface IDeliveryRoutePoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

const DeliveryRoutePointSchema = new Schema<IDeliveryRoutePoint>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, required: true },
}, { _id: false });

export interface IDeliveryTimeline {
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

const DeliveryTimelineSchema = new Schema<IDeliveryTimeline>({
  assignedAt: { type: Date },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

export interface IDelivery extends Document {
  orderId: mongoose.Types.ObjectId;
  courierId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  pickupLocation: IDeliveryLocation;
  deliveryLocation: IDeliveryLocation;
  route?: IDeliveryRoutePoint[];
  timeline?: IDeliveryTimeline;
  distance?: number;
  duration?: number;
  fee?: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  courierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: { type: DeliveryLocationSchema, required: true },
  deliveryLocation: { type: DeliveryLocationSchema, required: true },
  route: [DeliveryRoutePointSchema],
  timeline: { type: DeliveryTimelineSchema },
  distance: { type: Number },
  duration: { type: Number },
  fee: { type: Number },
  status: { type: String, enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'], required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDelivery>('Delivery', DeliverySchema); 