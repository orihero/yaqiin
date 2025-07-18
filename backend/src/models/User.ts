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
  street: { type: String }, // not required
  city: { type: String }, // not required
  district: { type: String }, // not required
  postalCode: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  isDefault: { type: Boolean, default: false },
});

export interface IUserPreferences {
  language: 'uz' | 'ru' | 'en';
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
  };
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  language: { type: String, enum: ['uz', 'ru', 'en'], required: true },
  notifications: {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: true },
  },
});

export interface IUser extends Document {
  telegramId: string;
  chat_id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  role: 'client' | 'courier' | 'admin' | 'shop_owner' | 'operator';
  status: 'active' | 'inactive' | 'suspended';
  addresses: IAddress[];
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  shopId?: mongoose.Types.ObjectId; // Added for shop-client binding
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  telegramId: { type: String, unique: true, sparse: true },
  chat_id: { type: Number },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  password: { type: String, select: false },
  role: { type: String, enum: ['client', 'courier', 'admin', 'shop_owner', 'operator'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], required: true },
  addresses: [AddressSchema],
  preferences: { type: UserPreferencesSchema, default: undefined },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' }, // Added for shop-client binding
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

export type UserDocument = Document & IUser; 