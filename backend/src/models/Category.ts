import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryNameDesc {
  uz: string;
  ru: string;
}

const CategoryNameDescSchema = new Schema<ICategoryNameDesc>({
  uz: { type: String, required: true },
  ru: { type: String, required: true },
}, { _id: false });

export interface ICategory extends Document {
  name: ICategoryNameDesc;
  description?: ICategoryNameDesc;
  parentId?: mongoose.Types.ObjectId | null;
  imageUrl?: string;
  icon?: string;
  sortOrder?: number;
  attributes?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: CategoryNameDescSchema, required: true },
  description: { type: CategoryNameDescSchema },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  imageUrl: { type: String },
  icon: { type: String },
  sortOrder: { type: Number },
  attributes: [{ type: Schema.Types.ObjectId, ref: 'CategoryAttribute' }],
  isActive: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICategory>('Category', CategorySchema); 