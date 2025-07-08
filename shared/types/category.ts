export interface CategoryNameDesc {
  uz: string;
  ru: string;
}

export interface Category {
  _id: string;
  name: CategoryNameDesc;
  description?: CategoryNameDesc;
  parentId?: string | null;
  imageUrl?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  icon?: string;
} 