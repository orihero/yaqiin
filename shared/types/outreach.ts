export interface Outreach {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'couriers' | 'shop_owners' | 'customers';
  status: 'draft' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  createdBy: string;
}

export interface CreateOutreachData {
  title: string;
  message: string;
  targetType: 'all' | 'couriers' | 'shop_owners' | 'customers';
  sendImmediately: boolean;
}

export interface OutreachStats {
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveryRate: number;
}
