import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryAttributeNameDesc {
  ru: string;
  uz: string;
}

const CategoryAttributeNameDescSchema = new Schema<ICategoryAttributeNameDesc>({
  ru: { type: String, required: true },
  uz: { type: String, required: true },
}, { _id: false });

export interface ICategoryAttributeValueDesc {
  ru: string;
  uz: string;
}

const CategoryAttributeValueDescSchema = new Schema<ICategoryAttributeValueDesc>({
  ru: { type: String, required: true },
  uz: { type: String, required: true },
}, { _id: false });

export interface ICategoryAttribute extends Document {
  name: ICategoryAttributeNameDesc;
  value: ICategoryAttributeValueDesc;
  categoryId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryAttributeSchema = new Schema<ICategoryAttribute>({
  name: { type: CategoryAttributeNameDescSchema, required: true },
  value: { type: CategoryAttributeValueDescSchema, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
CategoryAttributeSchema.index({ categoryId: 1 });
CategoryAttributeSchema.index({ 'name.ru': 1 });
CategoryAttributeSchema.index({ 'name.uz': 1 });

export default mongoose.model<ICategoryAttribute>('CategoryAttribute', CategoryAttributeSchema);