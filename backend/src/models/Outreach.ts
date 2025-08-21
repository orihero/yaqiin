import mongoose, { Document, Schema } from 'mongoose';

export interface IOutreach extends Document {
  title: string;
  message: string;
  targetType: 'all' | 'couriers' | 'shop_owners' | 'customers';
  status: 'draft' | 'sent' | 'failed';
  recipientCount: number;
  successCount: number;
  failureCount: number;
  createdBy: mongoose.Types.ObjectId;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const outreachSchema = new Schema<IOutreach>({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  targetType: {
    type: String,
    required: true,
    enum: ['all', 'couriers', 'shop_owners', 'customers'],
    default: 'all',
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'failed'],
    default: 'draft',
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
outreachSchema.index({ status: 1, createdAt: -1 });
outreachSchema.index({ targetType: 1, status: 1 });
outreachSchema.index({ createdBy: 1 });

export const Outreach = mongoose.model<IOutreach>('Outreach', outreachSchema);
