export interface CategoryAttributeNameDesc {
  ru: string;
  uz: string;
}

export interface CategoryAttributeValueDesc {
  ru: string;
  uz: string;
}

export interface CategoryAttribute {
  _id: string;
  name: CategoryAttributeNameDesc;
  value: CategoryAttributeValueDesc;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
