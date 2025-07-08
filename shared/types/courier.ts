export interface CourierLocation {
  lat: number;
  lng: number;
  lastUpdated: Date;
}

export interface CourierRating {
  average: number;
  totalRatings: number;
}

export interface CourierEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface CourierStatistics {
  totalDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
}

export interface Courier {
  _id: string;
  userId: string;
  vehicleType: string;
  licenseNumber?: string;
  currentLocation?: CourierLocation;
  availability: 'available' | 'busy' | 'offline';
  rating?: CourierRating;
  earnings?: CourierEarnings;
  statistics?: CourierStatistics;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 