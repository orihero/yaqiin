import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false });

export interface IOrderPricing {
  itemsTotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
}

const OrderPricingSchema = new Schema<IOrderPricing>({
  itemsTotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  serviceFee: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

export interface IOrderAddress {
  title: string;
  street: string;
  city: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

const OrderAddressSchema = new Schema<IOrderAddress>({
  title: { type: String },
  street: { type: String },
  city: { type: String },
  district: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  notes: { type: String },
}, { _id: false });

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  updatedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
}, { _id: false });

export interface IOrderScheduledDelivery {
  date: Date;
  timeSlot: string;
}

const OrderScheduledDeliverySchema = new Schema<IOrderScheduledDelivery>({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
}, { _id: false });

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  courierId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  pricing: IOrderPricing;
  deliveryAddress: IOrderAddress;
  paymentMethod: 'cash_on_delivery' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'created' | 'confirmed' | 'packing' | 'packed' | 'courier_picked' | 'delivered' | 'paid' | 'rejected';
  rejectionReason?: string;
  statusHistory?: IOrderStatusHistory[];
  scheduledDelivery?: IOrderScheduledDelivery;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends mongoose.Model<IOrder> {
  updateStatus(orderId: string, newStatus: string, updatedBy: string, reason?: string): Promise<IOrder | null>;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  courierId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: { type: [OrderItemSchema], required: true },
  pricing: { type: OrderPricingSchema, required: true },
  deliveryAddress: { type: OrderAddressSchema, required: true },
  paymentMethod: { type: String, enum: ['cash_on_delivery', 'bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], required: true },
  status: { type: String, enum: ['created', 'confirmed', 'packing', 'packed', 'courier_picked', 'delivered', 'paid', 'rejected'], required: true },
  rejectionReason: { type: String },
  statusHistory: [OrderStatusHistorySchema],
  scheduledDelivery: { type: OrderScheduledDeliverySchema },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  notes: { type: String },
  adminNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OrderSchema.pre('save', async function (next) {
  if (this.isNew && (!this.orderNumber || typeof this.orderNumber !== 'string' || this.orderNumber.trim() === '')) {
    // Find the latest order by orderNumber (descending)
    const lastOrder = await (this.constructor as any).findOne({}, {}, { sort: { orderNumber: -1 } });
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      // Remove leading zeros and increment
      nextNumber = parseInt(lastOrder.orderNumber, 10) + 1;
    }
    // Pad to 6 digits with leading zeros
    this.orderNumber = String(nextNumber).padStart(6, '0');
  }
  next();
});

OrderSchema.statics.updateStatus = async function(orderId, newStatus, updatedBy, reason) {
  const order = await this.findById(orderId);
  if (!order) return null;
  order.status = newStatus;
  if (newStatus === 'rejected' && reason) {
    order.rejectionReason = reason;
  }
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes: reason || undefined
  });
  await order.save();
  return order;
};

export default mongoose.model<IOrder, IOrderModel>('Order', OrderSchema); 