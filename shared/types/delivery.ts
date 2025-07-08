export interface DeliveryLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryRoutePoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface DeliveryTimeline {
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export interface Delivery {
  _id: string;
  orderId: string;
  courierId: string;
  shopId: string;
  customerId: string;
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  route?: DeliveryRoutePoint[];
  timeline?: DeliveryTimeline;
  distance?: number;
  duration?: number;
  fee?: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 