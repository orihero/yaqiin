import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress extends Document {
  title: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  title: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  isDefault: { type: Boolean, default: false },
});

export interface IUserPreferences {
  language: 'uz' | 'ru';
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
  };
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  language: { type: String, enum: ['uz', 'ru'], required: true },
  notifications: {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: true },
  },
});

export interface IUser extends Document {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  role: 'client' | 'courier' | 'admin' | 'shop_owner';
  status: 'active' | 'inactive' | 'suspended';
  addresses: IAddress[];
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  telegramId: { type: String, unique: true, sparse: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  password: { type: String, select: false },
  role: { type: String, enum: ['client', 'courier', 'admin', 'shop_owner'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], required: true },
  addresses: [AddressSchema],
  preferences: { type: UserPreferencesSchema, default: undefined },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date },
});

// Hash password if modified
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 