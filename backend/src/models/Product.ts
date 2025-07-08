import mongoose, { Schema, Document } from 'mongoose';

export interface IProductNameDesc {
  uz: string;
  ru: string;
}

const ProductNameDescSchema = new Schema<IProductNameDesc>({
  uz: { type: String, required: true },
  ru: { type: String, required: true },
}, { _id: false });

export interface IProductStock {
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
}

const ProductStockSchema = new Schema<IProductStock>({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  lowStockThreshold: { type: Number },
}, { _id: false });

export interface IProductAttribute {
  name: string;
  value: string;
}

const ProductAttributeSchema = new Schema<IProductAttribute>({
  name: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

export interface IProductNutritionalInfo {
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
}

const ProductNutritionalInfoSchema = new Schema<IProductNutritionalInfo>({
  calories: { type: Number },
  protein: { type: Number },
  fat: { type: Number },
  carbohydrates: { type: Number },
}, { _id: false });

export interface IProductRating {
  average: number;
  totalReviews: number;
}

const ProductRatingSchema = new Schema<IProductRating>({
  average: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { _id: false });

export interface IProduct extends Document {
  name: IProductNameDesc;
  description?: IProductNameDesc;
  shopId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  images?: string[];
  price: number;
  unit: string;
  stock: IProductStock;
  attributes?: IProductAttribute[];
  tags?: string[];
  nutritionalInfo?: IProductNutritionalInfo;
  rating?: IProductRating;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: ProductNameDescSchema, required: true },
  description: { type: ProductNameDescSchema },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  stock: { type: ProductStockSchema, required: true },
  attributes: [ProductAttributeSchema],
  tags: [{ type: String }],
  nutritionalInfo: { type: ProductNutritionalInfoSchema },
  rating: { type: ProductRatingSchema, default: undefined },
  isActive: { type: Boolean, required: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProduct>('Product', ProductSchema); 