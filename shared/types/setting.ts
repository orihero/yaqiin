export interface Setting {
  _id: string;
  key: string;
  value: any;
  type: 'system' | 'business' | 'notification';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 