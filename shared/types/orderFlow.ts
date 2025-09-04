export interface ForwardingDestination {
  type: 'telegram_user' | 'telegram_group' | 'telegram_channel';
  identifier: string; // telegram user ID, group ID, or channel ID
  name?: string; // human-readable name for the destination
  isActive: boolean;
}

export interface OrderFlowStep {
  status: string; // order status like 'created', 'confirmed', 'packing', etc.
  name: string; // human-readable name for this step
  description?: string;
  forwardingDestinations: ForwardingDestination[];
  authorizedRoles: string[]; // roles that can change status to next step: 'User', 'Admin', 'Operator', 'ShopOwner', 'Courier'
  nextStatuses: string[]; // possible next statuses from this step
  isActive: boolean;
  order: number; // for ordering the steps
}

export interface OrderFlow {
  _id: string;
  shopId?: string; // null for global flow, specific shopId for shop-specific flow
  name: string;
  description?: string;
  steps: OrderFlowStep[];
  isActive: boolean;
  isDefault: boolean; // whether this is the default flow for new shops
  createdAt: Date;
  updatedAt: Date;
}

// Role types for order flow authorization
export type OrderFlowRole = 'User' | 'Admin' | 'Operator' | 'ShopOwner' | 'Courier';

// Forwarding destination types
export type ForwardingDestinationType = 'telegram_user' | 'telegram_group' | 'telegram_channel'; 