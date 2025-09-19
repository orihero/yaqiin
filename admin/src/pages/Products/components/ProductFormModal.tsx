import React, { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../services/categoryService';
import { Category } from '@yaqiin/shared/types/category';
import { Product } from '@yaqiin/shared/types/product';
import MaskedInput from '../../../components/MaskedInput';
import SearchableSelect from '../../../components/SearchableSelect';
import SequentialCategorySelect from '../../../components/SequentialCategorySelect';
import { getUnitOptions } from '../../../utils/units';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import TranslationButton from '../../../components/TranslationButton';
import { useTranslation } from '../../../hooks/useTranslation';

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
  unitMeasure: string;
  baseStockQuantity: number;
  isActive: boolean;
  descUz: string;
  descRu: string;
  images: File[];
  imagePreviews: string[];
  imageUrls: string[];
  formError: string | null;
  lastEditedField: string | null; // Track which field was last edited to avoid translation loops
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
  unitMeasure: '',
  baseStockQuantity: 1000,
  isActive: true,
  descUz: '',
  descRu: '',
  images: [],
  imagePreviews: [],
  imageUrls: [],
  formError: null,
  lastEditedField: null,
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
        unitMeasure: action.product.unitMeasure || '',
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
  const [imagePreview, setImagePreview] = useState<{ images: string[]; initialIndex: number } | null>(null);
  const { translateProductName, translateProductDescription, isTranslating, error: translationError, clearError } = useTranslation();
  
  // State for tracking auto-translation
  const [autoTranslating, setAutoTranslating] = useState<{
    nameUz: boolean;
    nameRu: boolean;
    descUz: boolean;
    descRu: boolean;
  }>({
    nameUz: false,
    nameRu: false,
    descUz: false,
    descRu: false
  });
  
  // Debounce timers for automatic translation
  const nameTranslationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionTranslationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nameUz, categoryId, basePrice, unit, baseStockQuantity, descUz, descRu } = state;
    
    if (!nameUz || !categoryId || !basePrice || !unit || !descUz || !descRu) {
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
        unitMeasure: state.unitMeasure || undefined,
        baseStock: state.baseStockQuantity ? { quantity: state.baseStockQuantity, unit: state.unit } : undefined,
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

  const handleImagePreview = (images: string[], initialIndex: number = 0) => {
    setImagePreview({ images, initialIndex });
  };

  // Manual translation functions (for button clicks)
  const handleTranslateName = async (sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz') => {
    const sourceText = sourceLanguage === 'uz' ? state.nameUz : state.nameRu;
    if (!sourceText.trim()) return;

    clearError();
    const translatedText = await translateProductName(sourceText, sourceLanguage, targetLanguage);
    
    if (translatedText) {
      const field = targetLanguage === 'uz' ? 'nameUz' : 'nameRu';
      dispatch({ type: 'SET_FIELD', field, value: translatedText });
    }
  };

  const handleTranslateDescription = async (sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz') => {
    const sourceText = sourceLanguage === 'uz' ? state.descUz : state.descRu;
    if (!sourceText.trim()) return;

    clearError();
    const translatedText = await translateProductDescription(sourceText, sourceLanguage, targetLanguage);
    
    if (translatedText) {
      const field = targetLanguage === 'uz' ? 'descUz' : 'descRu';
      dispatch({ type: 'SET_FIELD', field, value: translatedText });
    }
  };

  // Handle field changes with automatic translation
  const handleFieldChange = (field: keyof ProductFormState, value: string, autoTranslate: boolean = true) => {
    dispatch({ type: 'SET_FIELD', field, value });
    dispatch({ type: 'SET_FIELD', field: 'lastEditedField', value: field });
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (nameTranslationTimeoutRef.current) {
        clearTimeout(nameTranslationTimeoutRef.current);
      }
      if (descriptionTranslationTimeoutRef.current) {
        clearTimeout(descriptionTranslationTimeoutRef.current);
      }
    };
  }, []);

  // Early return after all hooks have been called
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
       <div className="fixed top-0 right-0 h-full w-2/3 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-white">{isEdit ? '✏️ Edit Product' : '➕ Add Product'}</h2>
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-white text-2xl transition-colors"
             title="Close"
           >
             ×
           </button>
         </div>
        {error && <div className="text-red-400 mb-2">❌ {typeof error === 'string' ? error : (error as any)?.message || 'An error occurred'}</div>}
        {state.formError && <div className="text-red-400 mb-2">⚠️ {state.formError}</div>}
        {translationError && <div className="text-yellow-400 mb-2">🌐 Translation Error: {typeof translationError === 'string' ? translationError : (translationError as any)?.message || 'Translation failed'}</div>}
        <form onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 gap-4">
             <div>
               <label className="block mb-1 text-white">📝 Name (Uzbek) *</label>
               <div className="flex gap-2">
                 <input 
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white" 
                   value={state.nameUz} 
                   onChange={e => handleFieldChange('nameUz', e.target.value)} 
                   required 
                 />
                 <TranslationButton
                   onClick={() => handleTranslateName('ru', 'uz')}
                   disabled={!state.nameRu.trim()}
                   loading={isTranslating}
                   autoTranslating={autoTranslating.nameUz}
                   title="Translate from Russian"
                 />
               </div>
             </div>
             <div>
               <label className="block mb-1 text-white">📝 Name (Russian) *</label>
               <div className="flex gap-2">
                 <input 
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white" 
                   value={state.nameRu} 
                   onChange={e => handleFieldChange('nameRu', e.target.value)} 
                   required 
                 />
                 <TranslationButton
                   onClick={() => handleTranslateName('uz', 'ru')}
                   disabled={!state.nameUz.trim()}
                   loading={isTranslating}
                   autoTranslating={autoTranslating.nameRu}
                   title="Translate from Uzbek"
                 />
               </div>
             </div>
            <div>
              <SequentialCategorySelect
                value={state.categoryId}
                onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'categoryId', value })}
                placeholder="Select category"
                className="w-full"
                open={open}
              />
            </div>
            <div>
              <label className="block mb-1 text-white">💰 Base Price *</label>
              <MaskedInput
                type="price"
                value={state.basePrice}
                onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'basePrice', value })}
                placeholder="Enter price"
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white"
              />
            </div>
            <div>
              <label className="block mb-1 text-white">📦 Unit *</label>
              <SearchableSelect
                value={state.unit}
                onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'unit', value })}
                options={getUnitOptions()}
                placeholder="Select unit"
                className="w-full"
              />
            </div>
            {/* <div>
              <label className="block mb-1 text-white">📏 Unit Measure</label>
              <input 
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                value={state.unitMeasure} 
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'unitMeasure', value: e.target.value })} 
                placeholder="e.g., 100mg, 1kg, 500ml"
              />
            </div> */}
            <div>
              <label className="block mb-1 text-white">
                📊 Base Stock Quantity
                <span className="text-gray-400 text-xs ml-1">(optional)</span>
              </label>
              <MaskedInput
                type="number"
                value={state.baseStockQuantity}
                onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'baseStockQuantity', value })}
                placeholder="Enter quantity (optional)"
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white"
              />
            </div>
             <div>
               <label className="block mb-1 text-white">📄 Description (Uzbek) *</label>
               <div className="flex gap-2">
                 <textarea 
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white" 
                   rows={4} 
                   value={state.descUz} 
                   onChange={e => handleFieldChange('descUz', e.target.value)} 
                   required 
                 />
                 <div className="flex flex-col gap-1">
                   <TranslationButton
                     onClick={() => handleTranslateDescription('ru', 'uz')}
                     disabled={!state.descRu.trim()}
                     loading={isTranslating}
                     autoTranslating={autoTranslating.descUz}
                     title="Translate from Russian"
                     className="h-8"
                   />
                 </div>
               </div>
             </div>
             <div>
               <label className="block mb-1 text-white">📄 Description (Russian) *</label>
               <div className="flex gap-2">
                 <textarea 
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white" 
                   rows={4} 
                   value={state.descRu} 
                   onChange={e => handleFieldChange('descRu', e.target.value)} 
                   required 
                 />
                 <div className="flex flex-col gap-1">
                   <TranslationButton
                     onClick={() => handleTranslateDescription('uz', 'ru')}
                     disabled={!state.descUz.trim()}
                     loading={isTranslating}
                     autoTranslating={autoTranslating.descRu}
                     title="Translate from Uzbek"
                     className="h-8"
                   />
                 </div>
               </div>
             </div>
            <div>
              <label className="block mb-1 text-white">🖼️ Product Images</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block mb-2" />
              
              {/* Existing Product Images (when editing) */}
              {isEdit && product?.images && product.images.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 text-white text-sm">📸 Current Product Images</label>
                  <div className="flex flex-wrap gap-2">
                    {product.images.map((src, idx) => (
                      <div key={`existing-${idx}`} className="relative w-20 h-20">
                        <img 
                          src={src} 
                          alt={`Product ${idx + 1}`} 
                          className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => handleImagePreview(product.images || [], idx)}
                          title="Click to preview"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Image Previews */}
              <div className="flex flex-wrap gap-2 mt-2">
                {state.imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <img 
                      src={src} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => handleImagePreview(state.imagePreviews, idx)}
                      title="Click to preview"
                    />
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
             <div className="flex items-center mt-2">
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

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={!!imagePreview}
        images={imagePreview?.images || []}
        initialIndex={imagePreview?.initialIndex || 0}
        onClose={() => setImagePreview(null)}
      />
    </div>
  );
} 