export interface NotificationTitleMessage {
  uz: string;
  ru: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  recipientType: 'client' | 'courier' | 'admin' | 'shop_owner' | 'operator';
  type: 'order_update' | 'promotion' | 'system' | 'chat_message';
  title: NotificationTitleMessage;
  message: NotificationTitleMessage;
  data?: Record<string, any>;
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 