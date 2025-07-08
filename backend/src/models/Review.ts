import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewResponse {
  message: string;
  respondedBy: mongoose.Types.ObjectId;
  respondedAt: Date;
}

const ReviewResponseSchema = new Schema<IReviewResponse>({
  message: { type: String, required: true },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  respondedAt: { type: Date, required: true },
}, { _id: false });

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  targetType: 'product' | 'shop' | 'courier';
  targetId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  response?: IReviewResponse;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['product', 'shop', 'courier'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
  isVerified: { type: Boolean, required: true },
  response: { type: ReviewResponseSchema },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', ReviewSchema); 