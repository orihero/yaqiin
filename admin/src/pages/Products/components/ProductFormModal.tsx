import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../services/categoryService';
import { Category } from '@yaqiin/shared/types/category';
import { Product } from '@yaqiin/shared/types/product';
import { getAllShops } from '../../../services/shopService';
import { Shop } from '@yaqiin/shared/types/shop';

// ProductFormModal: Right-side drawer modal for adding/editing products. Follows admin panel modal conventions.

interface ProductFormModalProps {
  open?: boolean; // for future extensibility
  product?: Product;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit?: (values: any) => void;
}

export default function ProductFormModal({ open = true, product, loading = false, error, onClose, onSubmit }: ProductFormModalProps) {
  const isEdit = !!product;
  const [nameUz, setNameUz] = useState(product?.name.uz || '');
  const [nameRu, setNameRu] = useState(product?.name.ru || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [unit, setUnit] = useState(product?.unit || '');
  const [stock, setStock] = useState(product?.stock.quantity || 0);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [formError, setFormError] = useState<string | null>(null);
  const [shopId, setShopId] = useState(product?.shopId || '');
  const [descUz, setDescUz] = useState(product?.description?.uz || '');
  const [descRu, setDescRu] = useState(product?.description?.ru || '');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array.isArray(product?.images) ? product.images.filter(img => typeof img === 'string') : []);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const { data: shops, isLoading: loadingShops } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: getAllShops,
  });

  React.useEffect(() => {
    if (product) {
      setNameUz(product.name.uz || '');
      setNameRu(product.name.ru || '');
      setCategoryId(product.categoryId || '');
      setPrice(product.price || 0);
      setUnit(product.unit || '');
      setStock(product.stock.quantity || 0);
      setIsActive(product.isActive ?? true);
      setShopId(product.shopId || '');
      setDescUz(product.description?.uz || '');
      setDescRu(product.description?.ru || '');
      setImages([]);
      setImagePreviews(Array.isArray(product.images) ? product.images.filter(img => typeof img === 'string') : []);
      setImageUrls([]);
    }
  }, [product]);

  // Reset form when modal closes after add
  React.useEffect(() => {
    if (!open && !product) {
      setNameUz('');
      setNameRu('');
      setCategoryId('');
      setPrice(0);
      setUnit('');
      setStock(0);
      setIsActive(true);
      setShopId('');
      setDescUz('');
      setDescRu('');
      setImages([]);
      setImagePreviews([]);
      setImageUrls([]);
      setFormError(null);
    }
  }, [open, product]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz || !categoryId || !shopId || !price || !unit || !stock) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError(null);
    if (onSubmit) {
      // Only send non-empty URLs
      const validUrls = imageUrls.map(url => url.trim()).filter(Boolean);
      onSubmit({
        name: { uz: nameUz, ru: nameRu },
        description: { uz: descUz, ru: descRu },
        categoryId,
        shopId,
        price,
        unit,
        stock: { quantity: stock, unit },
        isActive,
        images: images.length > 0 ? images : undefined,
        imageUrls: validUrls.length > 0 ? validUrls : undefined,
      });
    }
    onClose();
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  // Remove image preview
  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Add/remove image URL fields
  const handleAddImageUrl = () => setImageUrls([...imageUrls, '']);
  const handleImageUrlChange = (idx: number, value: string) => {
    setImageUrls(urls => urls.map((url, i) => (i === idx ? value : url)));
  };
  const handleRemoveImageUrl = (idx: number) => {
    setImageUrls(urls => urls.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4 text-white">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {formError && <div className="text-red-400 mb-2">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Name (Uzbek) *</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={nameUz} onChange={e => setNameUz(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-white">Name (Russian)</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={nameRu} onChange={e => setNameRu(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-white">Category *</label>
              {loadingCategories ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
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
              <label className="block mb-1 text-white">Price *</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={price} onChange={e => setPrice(Number(e.target.value))} required min={0} />
            </div>
            <div>
              <label className="block mb-1 text-white">Unit *</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={unit} onChange={e => setUnit(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-white">Stock Quantity *</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={stock} onChange={e => setStock(Number(e.target.value))} required min={0} />
            </div>
            <div>
              <label className="block mb-1 text-white">Shop *</label>
              {loadingShops ? (
                <p className="text-gray-400">Loading shops...</p>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={shopId} onChange={e => setShopId(e.target.value)} required>
                  <option value="">Select shop</option>
                  {shops && shops.length === 0 ? (
                    <option value="" disabled>No shops available</option>
                  ) : (
                    shops?.map((shop) => (
                      <option key={shop._id} value={shop._id}>{shop.name}</option>
                    ))
                  )}
                </select>
              )}
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">Description (Uzbek)</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} value={descUz} onChange={e => setDescUz(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">Description (Russian)</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} value={descRu} onChange={e => setDescRu(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 text-white">Product Images</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block mb-2" />
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 text-xs" onClick={() => handleRemoveImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-white">Or add image URLs</label>
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input type="text" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" placeholder="https://..." value={url} onChange={e => handleImageUrlChange(idx, e.target.value)} />
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveImageUrl(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="mt-2 px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-sm" onClick={handleAddImageUrl}>+ Add Image URL</button>
              </div>
            </div>
            <div className="col-span-2 flex items-center mt-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <label htmlFor="isActive" className="ml-2 text-white">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? 'Saving...' : 'Creating...') : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 