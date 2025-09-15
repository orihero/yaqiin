export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  unitMeasure?: string; // Optional unit measure field (e.g., "100mg", "1kg", "500ml")
  subtotal: number;
  image?: string; // product image URL
}

export interface OrderPricing {
  itemsTotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderAddress {
  title?: string;
  street: string;
  city: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

export interface OrderScheduledDelivery {
  date: Date;
  timeSlot: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  shopId: string;
  courierId?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  deliveryAddress: OrderAddress;
  paymentMethod: 'cash_on_delivery' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'created' | 'operator_confirmed' | 'packing' | 'packed' | 'courier_picked' | 'delivered' | 'paid' | 'rejected_by_shop' | 'rejected_by_courier' | 'cancelled_by_client';
  rejectionReason?: string;
  cancellationReason?: string;
  statusHistory?: OrderStatusHistory[];
  scheduledDelivery?: OrderScheduledDelivery;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
} 