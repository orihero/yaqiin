import mongoose, { Schema, Document } from 'mongoose';

export interface IShopProductStock {
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
}

const ShopProductStockSchema = new Schema<IShopProductStock>({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  lowStockThreshold: { type: Number },
}, { _id: false });

export interface IShopProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  price: number; // Shop-specific price (can override base price)
  stock: IShopProductStock; // Shop-specific stock
  isActive: boolean; // Whether this product is active in this shop
  isRefundable?: boolean; // Shop-specific refund policy
  maxOrderQuantity?: number; // Maximum quantity that can be ordered
  minOrderQuantity?: number; // Minimum quantity that can be ordered
  deliveryTime?: number; // Shop-specific delivery time in minutes
  specialNotes?: string; // Shop-specific notes about this product
  createdAt: Date;
  updatedAt: Date;
}

const ShopProductSchema = new Schema<IShopProduct>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  stock: { type: ShopProductStockSchema, required: true },
  isActive: { type: Boolean, required: true, default: true },
  isRefundable: { type: Boolean, default: false },
  maxOrderQuantity: { type: Number },
  minOrderQuantity: { type: Number, default: 1 },
  deliveryTime: { type: Number }, // in minutes
  specialNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create compound index to ensure unique shop-product combinations
ShopProductSchema.index({ shopId: 1, productId: 1 }, { unique: true });

// Create indexes for better query performance
ShopProductSchema.index({ shopId: 1, isActive: 1 });
ShopProductSchema.index({ productId: 1 });

export default mongoose.model<IShopProduct>('ShopProduct', ShopProductSchema);
