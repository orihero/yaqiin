export interface ExcelProduct {
  code: string;
  name: string;
  price: number;
}

export interface CategoryWithAttributes {
  _id: string;
  name: {
    ru: string;
    uz: string;
  };
  parentId?: string | null;
  attributes: Array<{
    _id: string;
    name: {
      ru: string;
      uz: string;
    };
    value: {
      ru: string;
      uz: string;
    };
  }>;
}

export interface EnhancedProduct {
  code: string;
  name: {
    ru: string;
    uz: string;
  };
  description?: {
    ru: string;
    uz: string;
  };
  brand?: {
    ru: string;
    uz: string;
  };
  price: number;
  unit: string;
  imageUrl?: string;
  categoryId: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
}

export interface ThreadStatus {
  id: number;
  status: 'idle' | 'working' | 'completed' | 'failed';
  currentProduct: ExcelProduct | null;
  processed: number;
  errors: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  message: string;
}

export interface CategoryCreationResult {
  success: boolean;
  totalCategories: number;
  mainCategories: number;
  message: string;
}

export interface UnitOption {
  value: string;
  label: string;
}
