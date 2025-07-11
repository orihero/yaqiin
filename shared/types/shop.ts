export interface ShopContactInfo {
  phoneNumber: string;
  email?: string;
  telegramUsername?: string;
}

export interface ShopAddress {
  street: string;
  city: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryZone {
  _id: string;
  name: string;
  polygon: { lat: number; lng: number }[];
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
}

export interface OperatingHoursDay {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface ShopOperatingHours {
  monday: OperatingHoursDay;
  tuesday: OperatingHoursDay;
  wednesday: OperatingHoursDay;
  thursday: OperatingHoursDay;
  friday: OperatingHoursDay;
  saturday: OperatingHoursDay;
  sunday: OperatingHoursDay;
}

export interface ShopRating {
  average: number;
  totalReviews: number;
}

export interface Shop {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  contactInfo: ShopContactInfo;
  address: ShopAddress;
  deliveryZones?: DeliveryZone[];
  operatingHours: ShopOperatingHours;
  rating?: ShopRating;
  status: 'active' | 'inactive' | 'suspended';
  commission?: number;
  orders_chat_id?: string;
  createdAt: Date;
  updatedAt: Date;
} 