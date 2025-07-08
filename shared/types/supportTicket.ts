export interface SupportTicketResponse {
  _id: string;
  responderId: string;
  responderRole: 'admin' | 'support' | 'customer';
  message: string;
  attachments?: string[];
  isInternal?: boolean;
  createdAt: Date;
}

export interface SupportTicketResolution {
  summary?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  satisfactionRating?: number;
  feedback?: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userId: string;
  userRole: 'client' | 'courier' | 'shop_owner';
  orderId?: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_response' | 'resolved' | 'closed';
  title: string;
  description: string;
  attachments?: string[];
  assignedTo?: string;
  assignedAt?: Date;
  responses?: SupportTicketResponse[];
  resolution?: SupportTicketResolution;
  tags?: string[];
  isEscalated?: boolean;
  escalatedAt?: Date;
  escalatedTo?: string;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 