import mongoose, { Schema, Document } from 'mongoose';

export interface IShopContactInfo {
  phoneNumber: string;
  email?: string;
  telegramUsername?: string;
}

const ShopContactInfoSchema = new Schema<IShopContactInfo>({
  phoneNumber: { type: String, required: true },
  email: { type: String },
  telegramUsername: { type: String },
}, { _id: false });

export interface IShopAddress {
  street: string;
  city: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const ShopAddressSchema = new Schema<IShopAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
}, { _id: false });

export interface IDeliveryZone extends Document {
  name: string;
  polygon: { lat: number; lng: number }[];
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>({
  name: { type: String, required: true },
  polygon: [{ lat: Number, lng: Number }],
  deliveryFee: { type: Number, required: true },
  minOrderAmount: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
});

export interface IOperatingHoursDay {
  open: string;
  close: string;
  isOpen: boolean;
}

const OperatingHoursDaySchema = new Schema<IOperatingHoursDay>({
  open: { type: String, required: true },
  close: { type: String, required: true },
  isOpen: { type: Boolean, required: true },
}, { _id: false });

export interface IShopOperatingHours {
  monday: IOperatingHoursDay;
  tuesday: IOperatingHoursDay;
  wednesday: IOperatingHoursDay;
  thursday: IOperatingHoursDay;
  friday: IOperatingHoursDay;
  saturday: IOperatingHoursDay;
  sunday: IOperatingHoursDay;
}

const ShopOperatingHoursSchema = new Schema<IShopOperatingHours>({
  monday: { type: OperatingHoursDaySchema, required: true },
  tuesday: { type: OperatingHoursDaySchema, required: true },
  wednesday: { type: OperatingHoursDaySchema, required: true },
  thursday: { type: OperatingHoursDaySchema, required: true },
  friday: { type: OperatingHoursDaySchema, required: true },
  saturday: { type: OperatingHoursDaySchema, required: true },
  sunday: { type: OperatingHoursDaySchema, required: true },
}, { _id: false });

export interface IShopRating {
  average: number;
  totalReviews: number;
}

const ShopRatingSchema = new Schema<IShopRating>({
  average: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { _id: false });

export interface IShop extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  contactInfo: IShopContactInfo;
  address: IShopAddress;
  deliveryZones?: IDeliveryZone[];
  operatingHours: IShopOperatingHours;
  rating?: IShopRating;
  status: 'active' | 'inactive' | 'suspended';
  commission?: number;
  couriers?: mongoose.Types.ObjectId[];
  orders_chat_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contactInfo: { type: ShopContactInfoSchema, required: true },
  address: { type: ShopAddressSchema, required: true },
  deliveryZones: [DeliveryZoneSchema],
  operatingHours: { type: ShopOperatingHoursSchema, required: true },
  rating: { type: ShopRatingSchema, default: undefined },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], required: true },
  commission: { type: Number },
  couriers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  orders_chat_id: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IShop>('Shop', ShopSchema); 