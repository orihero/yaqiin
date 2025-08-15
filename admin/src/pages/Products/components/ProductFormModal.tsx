import React, { useReducer, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../services/categoryService';
import { Category } from '@yaqiin/shared/types/category';
import { Product } from '@yaqiin/shared/types/product';

// ProductFormModal: Right-side drawer modal for adding/editing products. Follows admin panel modal conventions.

interface ProductFormModalProps {
  open?: boolean; // for future extensibility
  product?: Product;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit?: (values: any) => void;
}

// Define the form state interface
interface ProductFormState {
  nameUz: string;
  nameRu: string;
  categoryId: string;
  basePrice: number;
  unit: string;
  baseStockQuantity: number;
  isActive: boolean;
  descUz: string;
  descRu: string;
  images: File[];
  imagePreviews: string[];
  imageUrls: string[];
  formError: string | null;
}

// Define action types
type ProductFormAction =
  | { type: 'SET_FIELD'; field: keyof ProductFormState; value: any }
  | { type: 'SET_IMAGES'; files: File[] }
  | { type: 'REMOVE_IMAGE'; index: number }
  | { type: 'ADD_IMAGE_URL' }
  | { type: 'SET_IMAGE_URL'; index: number; value: string }
  | { type: 'REMOVE_IMAGE_URL'; index: number }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_PRODUCT'; product: Product };

// Initial state
const initialState: ProductFormState = {
  nameUz: '',
  nameRu: '',
  categoryId: '',
  basePrice: 0,
  unit: '',
  baseStockQuantity: 0,
  isActive: true,
  descUz: '',
  descRu: '',
  images: [],
  imagePreviews: [],
  imageUrls: [],
  formError: null,
};

// Reducer function
function productFormReducer(state: ProductFormState, action: ProductFormAction): ProductFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    
    case 'SET_IMAGES':
      return {
        ...state,
        images: action.files,
        imagePreviews: action.files.map(file => URL.createObjectURL(file)),
      };
    
    case 'REMOVE_IMAGE':
      return {
        ...state,
        images: state.images.filter((_, i) => i !== action.index),
        imagePreviews: state.imagePreviews.filter((_, i) => i !== action.index),
      };
    
    case 'ADD_IMAGE_URL':
      return {
        ...state,
        imageUrls: [...state.imageUrls, ''],
      };
    
    case 'SET_IMAGE_URL':
      return {
        ...state,
        imageUrls: state.imageUrls.map((url, i) => (i === action.index ? action.value : url)),
      };
    
    case 'REMOVE_IMAGE_URL':
      return {
        ...state,
        imageUrls: state.imageUrls.filter((_, i) => i !== action.index),
      };
    
    case 'RESET_FORM':
      return initialState;
    
    case 'LOAD_PRODUCT':
      return {
        ...state,
        nameUz: action.product.name.uz || '',
        nameRu: action.product.name.ru || '',
        categoryId: action.product.categoryId || '',
        basePrice: action.product.basePrice || 0,
        unit: action.product.unit || '',
        baseStockQuantity: action.product.baseStock?.quantity || 0,
        isActive: action.product.isActive ?? true,
        descUz: action.product.description?.uz || '',
        descRu: action.product.description?.ru || '',
        images: [],
        imagePreviews: Array.isArray(action.product.images) 
          ? action.product.images.filter(img => typeof img === 'string') 
          : [],
        imageUrls: [],
        formError: null,
      };
    
    default:
      return state;
  }
}

export default function ProductFormModal({ open = true, product, loading = false, error, onClose, onSubmit }: ProductFormModalProps) {
  const isEdit = !!product;
  const [state, dispatch] = useReducer(productFormReducer, initialState);

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  // Load product data when editing
  useEffect(() => {
    if (product) {
      dispatch({ type: 'LOAD_PRODUCT', product });
    }
  }, [product]);

  // Reset form when modal closes after add
  useEffect(() => {
    if (!open && !product) {
      dispatch({ type: 'RESET_FORM' });
    }
  }, [open, product]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nameUz, categoryId, basePrice, unit, baseStockQuantity, descUz, descRu } = state;
    
    if (!nameUz || !categoryId || !basePrice || !unit || !baseStockQuantity || !descUz || !descRu) {
      dispatch({ type: 'SET_FIELD', field: 'formError', value: 'Please fill in all required fields.' });
      return;
    }
    
    dispatch({ type: 'SET_FIELD', field: 'formError', value: null });
    
    if (onSubmit) {
      // Only send non-empty URLs
      const validUrls = state.imageUrls.map(url => url.trim()).filter(Boolean);
      onSubmit({
        name: { uz: state.nameUz, ru: state.nameRu },
        description: { uz: state.descUz, ru: state.descRu },
        categoryId: state.categoryId,
        basePrice: state.basePrice,
        unit: state.unit,
        baseStock: { quantity: state.baseStockQuantity, unit: state.unit },
        isActive: state.isActive,
        images: state.images.length > 0 ? state.images : undefined,
        imageUrls: validUrls.length > 0 ? validUrls : undefined,
      });
    }
    onClose();
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      dispatch({ type: 'SET_IMAGES', files });
    }
  };

  // Remove image preview
  const handleRemoveImage = (idx: number) => {
    dispatch({ type: 'REMOVE_IMAGE', index: idx });
  };

  // Add/remove image URL fields
  const handleAddImageUrl = () => dispatch({ type: 'ADD_IMAGE_URL' });
  const handleImageUrlChange = (idx: number, value: string) => {
    dispatch({ type: 'SET_IMAGE_URL', index: idx, value });
  };
  const handleRemoveImageUrl = (idx: number) => {
    dispatch({ type: 'REMOVE_IMAGE_URL', index: idx });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4 text-white">{isEdit ? '✏️ Edit Product' : '➕ Add Product'}</h2>
        {error && <div className="text-red-400 mb-2">❌ {error}</div>}
        {state.formError && <div className="text-red-400 mb-2">⚠️ {state.formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">📝 Name (Uzbek) *</label>
              <input 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.nameUz} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'nameUz', value: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="block mb-1 text-white">📝 Name (Russian) *</label>
              <input 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.nameRu} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'nameRu', value: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="block mb-1 text-white">📂 Category *</label>
              {loadingCategories ? (
                <p className="text-gray-400">⏳ Loading categories...</p>
              ) : (
                <select 
                  className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                  value={state.categoryId} 
                  onChange={e => dispatch({ type: 'SET_FIELD', field: 'categoryId', value: e.target.value })} 
                  required
                >
                  <option value="">Select category</option>
                  {categories && categories.length === 0 ? (
                    <option value="" disabled>No categories available</option>
                  ) : (
                    categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name.uz}</option>
                    ))
                  )}
                </select>
              )}
            </div>
            <div>
              <label className="block mb-1 text-white">💰 Base Price *</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.basePrice} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'basePrice', value: Number(e.target.value) })} 
                required 
                min={0} 
              />
            </div>
            <div>
              <label className="block mb-1 text-white">📦 Unit *</label>
              <input 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.unit} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'unit', value: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="block mb-1 text-white">📊 Base Stock Quantity *</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.baseStockQuantity} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'baseStockQuantity', value: Number(e.target.value) })} 
                required 
                min={0} 
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">📄 Description (Uzbek) *</label>
              <textarea 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                rows={2} 
                value={state.descUz} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'descUz', value: e.target.value })} 
                required 
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">📄 Description (Russian) *</label>
              <textarea 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                rows={2} 
                value={state.descRu} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'descRu', value: e.target.value })} 
                required 
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">🖼️ Product Images</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block mb-2" />
              <div className="flex flex-wrap gap-2 mt-2">
                {state.imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 text-xs" onClick={() => handleRemoveImage(idx)}>❌</button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-white">🔗 Or add image URLs</label>
                {state.imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                      placeholder="https://..." 
                      value={url} 
                      onChange={e => handleImageUrlChange(idx, e.target.value)} 
                    />
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveImageUrl(idx)}>❌</button>
                  </div>
                ))}
                <button type="button" className="mt-2 px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-sm" onClick={handleAddImageUrl}>➕ Add Image URL</button>
              </div>
            </div>
            <div className="col-span-2 flex items-center mt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={state.isActive} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'isActive', value: e.target.checked })} 
              />
              <label htmlFor="isActive" className="ml-2 text-white">✅ Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>❌ Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? '💾 Saving...' : '🔄 Creating...') : '💾 Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 