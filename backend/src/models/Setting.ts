import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  type: 'system' | 'business' | 'notification';
  description?: string;
  isActive: boolean;
  flagType?: 'bool' | 'text' | 'select';
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['system', 'business', 'notification'], required: true },
  description: { type: String },
  isActive: { type: Boolean, required: true },
  flagType: { type: String, enum: ['bool', 'text', 'select'], required: false },
  options: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISetting>('Setting', SettingSchema); 