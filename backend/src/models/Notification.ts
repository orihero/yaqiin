import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTitleMessage {
  uz: string;
  ru: string;
}

const NotificationTitleMessageSchema = new Schema<INotificationTitleMessage>({
  uz: { type: String, required: true },
  ru: { type: String, required: true },
}, { _id: false });

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientType: 'client' | 'courier' | 'admin' | 'shop_owner' | 'operator';
  type: 'order_update' | 'promotion' | 'system' | 'chat_message';
  title: INotificationTitleMessage;
  message: INotificationTitleMessage;
  data?: Record<string, any>;
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientType: { type: String, enum: ['client', 'courier', 'admin', 'shop_owner', 'operator'], required: true },
  type: { type: String, enum: ['order_update', 'promotion', 'system', 'chat_message'], required: true },
  title: { type: NotificationTitleMessageSchema, required: true },
  message: { type: NotificationTitleMessageSchema, required: true },
  data: { type: Schema.Types.Mixed },
  channels: [{ type: String, required: true }],
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], required: true },
  isRead: { type: Boolean, required: true },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', NotificationSchema); 