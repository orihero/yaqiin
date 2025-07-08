import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicketResponse {
  responderId: mongoose.Types.ObjectId;
  responderRole: 'admin' | 'support' | 'customer';
  message: string;
  attachments?: string[];
  isInternal?: boolean;
  createdAt: Date;
}

const SupportTicketResponseSchema = new Schema<ISupportTicketResponse>({
  responderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  responderRole: { type: String, enum: ['admin', 'support', 'customer'], required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface ISupportTicketResolution {
  summary?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  satisfactionRating?: number;
  feedback?: string;
}

const SupportTicketResolutionSchema = new Schema<ISupportTicketResolution>({
  summary: { type: String },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  satisfactionRating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
}, { _id: false });

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  userRole: 'client' | 'courier' | 'shop_owner';
  orderId?: mongoose.Types.ObjectId;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_response' | 'resolved' | 'closed';
  title: string;
  description: string;
  attachments?: string[];
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  responses?: ISupportTicketResponse[];
  resolution?: ISupportTicketResolution;
  tags?: string[];
  isEscalated?: boolean;
  escalatedAt?: Date;
  escalatedTo?: mongoose.Types.ObjectId;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['client', 'courier', 'shop_owner'], required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  category: { type: String, required: true },
  subcategory: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
  status: { type: String, enum: ['open', 'in_progress', 'waiting_for_response', 'resolved', 'closed'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  responses: [SupportTicketResponseSchema],
  resolution: { type: SupportTicketResolutionSchema },
  tags: [{ type: String }],
  isEscalated: { type: Boolean, default: false },
  escalatedAt: { type: Date },
  escalatedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  lastActivityAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema); 