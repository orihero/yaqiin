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

// Updated Product model - now global, not tied to a specific shop
export interface Product {
  _id: string;
  name: ProductNameDesc;
  description?: ProductNameDesc;
  categoryId: string;
  brand?: ProductNameDesc;
  images?: string[];
  basePrice: number; // Base price, can be overridden by shop
  unit: string;
  baseStock: ProductStock; // Base stock info, can be overridden by shop
  attributes?: ProductAttribute[];
  tags?: string[];
  nutritionalInfo?: ProductNutritionalInfo;
  rating?: ProductRating;
  isActive: boolean;
  isFeatured?: boolean;
  // Shop-specific fields (when returned with shopId)
  shopId?: string; // Shop ID when product is fetched in shop context
  price?: number; // Shop-specific price
  stock?: ProductStock; // Shop-specific stock
  isRefundable?: boolean; // Shop-specific refund policy
  maxOrderQuantity?: number; // Maximum quantity that can be ordered
  minOrderQuantity?: number; // Minimum quantity that can be ordered
  deliveryTime?: number; // Shop-specific delivery time in minutes
  specialNotes?: string; // Shop-specific notes about this product
  createdAt: Date;
  updatedAt: Date;
}

// New ShopProduct model for shop-specific product data
export interface ShopProduct {
  _id: string;
  shopId: string;
  productId: string;
  price: number; // Shop-specific price (can override base price)
  stock: ProductStock; // Shop-specific stock
  isActive: boolean; // Whether this product is active in this shop
  isRefundable?: boolean; // Shop-specific refund policy
  maxOrderQuantity?: number; // Maximum quantity that can be ordered
  minOrderQuantity?: number; // Minimum quantity that can be ordered
  deliveryTime?: number; // Shop-specific delivery time in minutes
  specialNotes?: string; // Shop-specific notes about this product
  createdAt: Date;
  updatedAt: Date;
}

// Combined interface for displaying products in shop context
export interface ShopProductDisplay {
  _id: string;
  shopId: string;
  product: Product;
  price: number;
  stock: ProductStock;
  isActive: boolean;
  isRefundable?: boolean;
  maxOrderQuantity?: number;
  minOrderQuantity?: number;
  deliveryTime?: number;
  specialNotes?: string;
} 