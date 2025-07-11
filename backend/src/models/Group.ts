import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  chatId: number;
  title?: string;
  type: 'group' | 'supergroup';
  dateAdded: Date;
  shopId?: mongoose.Types.ObjectId;
}

const GroupSchema = new Schema<IGroup>({
  chatId: { type: Number, required: true, unique: true, index: true },
  title: { type: String },
  type: { type: String, enum: ['group', 'supergroup'], required: true },
  dateAdded: { type: Date, default: Date.now },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
});

export default mongoose.model<IGroup>('Group', GroupSchema); 