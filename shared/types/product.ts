export interface ProductNameDesc {
  uz: string;
  ru: string;
}

export interface ProductStock {
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductNutritionalInfo {
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
}

export interface Product {
  _id: string;
  name: ProductNameDesc;
  description?: ProductNameDesc;
  shopId: string;
  categoryId: string;
  images?: string[];
  price: number;
  unit: string;
  stock: ProductStock;
  attributes?: ProductAttribute[];
  tags?: string[];
  nutritionalInfo?: ProductNutritionalInfo;
  rating?: ProductRating;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
} 