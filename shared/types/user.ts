export interface Address {
  _id: string;
  title: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

export interface UserPreferences {
  language: 'uz' | 'ru' | 'en';
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
  };
}

export interface User {
  _id: string;
  telegramId: string;
  chat_id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role: 'client' | 'courier' | 'admin' | 'shop_owner' | 'operator';
  status: 'active' | 'inactive' | 'suspended';
  addresses?: Address[];
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
} 