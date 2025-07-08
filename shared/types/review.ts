export interface ReviewResponse {
  message: string;
  respondedBy: string;
  respondedAt: Date;
}

export interface Review {
  _id: string;
  orderId: string;
  customerId: string;
  targetType: 'product' | 'shop' | 'courier';
  targetId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  response?: ReviewResponse;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 