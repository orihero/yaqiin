import mongoose, { Schema, Document } from 'mongoose';

export interface IForwardingDestination {
  type: 'telegram_user' | 'telegram_group' | 'telegram_channel';
  identifier: string; // telegram user ID, group ID, or channel ID
  name?: string; // human-readable name for the destination
  isActive: boolean;
}

const ForwardingDestinationSchema = new Schema<IForwardingDestination>({
  type: { type: String, enum: ['telegram_user', 'telegram_group', 'telegram_channel'], required: true },
  identifier: { type: String, required: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
}, { _id: false });

export interface IOrderFlowStep {
  status: string; // order status like 'created', 'confirmed', 'packing', etc.
  name: string; // human-readable name for this step
  description?: string;
  forwardingDestinations: IForwardingDestination[];
  authorizedRoles: string[]; // roles that can change status to next step: 'User', 'Admin', 'Operator', 'ShopOwner', 'Courier'
  nextStatuses: string[]; // possible next statuses from this step
  isActive: boolean;
  order: number; // for ordering the steps
}

const OrderFlowStepSchema = new Schema<IOrderFlowStep>({
  status: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  forwardingDestinations: [ForwardingDestinationSchema],
  authorizedRoles: [{ type: String, enum: ['User', 'Admin', 'Operator', 'ShopOwner', 'Courier'], required: true }],
  nextStatuses: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, required: true },
}, { _id: false });

export interface IOrderFlow extends Document {
  shopId?: mongoose.Types.ObjectId; // null for global flow, specific shopId for shop-specific flow
  name: string;
  description?: string;
  steps: IOrderFlowStep[];
  isActive: boolean;
  isDefault: boolean; // whether this is the default flow for new shops
  createdAt: Date;
  updatedAt: Date;
}

const OrderFlowSchema = new Schema<IOrderFlow>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', sparse: true }, // sparse index for null values
  name: { type: String, required: true },
  description: { type: String },
  steps: [OrderFlowStepSchema],
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure only one default flow exists
OrderFlowSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

// Update timestamp on save
OrderFlowSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get the appropriate flow for a shop
OrderFlowSchema.statics.getFlowForShop = async function(this: any, shopId?: string) {
  if (shopId) {
    // First try to find shop-specific flow
    const shopFlow = await this.findOne({ shopId, isActive: true });
    if (shopFlow) return shopFlow;
  }
  
  // Fall back to default flow
  return await this.findOne({ isDefault: true, isActive: true });
};

// Static method to get flow step by status
OrderFlowSchema.statics.getStepByStatus = async function(this: any, status: string, shopId?: string) {
  const flow = await this.getFlowForShop(shopId);
  if (!flow) return null;
  
  return flow.steps.find((step: IOrderFlowStep) => step.status === status && step.isActive);
};

// Static method to get next possible statuses
OrderFlowSchema.statics.getNextStatuses = async function(this: any, currentStatus: string, shopId?: string) {
  const step = await this.getStepByStatus(currentStatus, shopId);
  return step ? step.nextStatuses : [];
};

// Static method to check if a role can change status
OrderFlowSchema.statics.canChangeStatus = async function(
  this: any,
  currentStatus: string, 
  newStatus: string, 
  userRole: string, 
  shopId?: string
) {
  const step = await this.getStepByStatus(currentStatus, shopId);
  if (!step) return false;
  
  // Check if the new status is in the allowed next statuses
  if (!step.nextStatuses.includes(newStatus)) return false;
  
  // Check if the user role is authorized
  return step.authorizedRoles.includes(userRole);
};

export interface IOrderFlowModel extends mongoose.Model<IOrderFlow> {
  getFlowForShop(shopId?: string): Promise<IOrderFlow | null>;
  getStepByStatus(status: string, shopId?: string): Promise<IOrderFlowStep | null>;
  getNextStatuses(currentStatus: string, shopId?: string): Promise<string[]>;
  canChangeStatus(currentStatus: string, newStatus: string, userRole: string, shopId?: string): Promise<boolean>;
}

export default mongoose.model<IOrderFlow, IOrderFlowModel>('OrderFlow', OrderFlowSchema); 