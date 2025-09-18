import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShopProductDisplay } from '@yaqiin/shared/types/product';
import MaskedInput from '../../../components/MaskedInput';
import SearchableSelect from '../../../components/SearchableSelect';
import { getUnitOptions } from '../../../utils/units';

interface ShopProductFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialValues?: Partial<ShopProductDisplay>;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: Partial<ShopProductDisplay>) => void;
}

export default function ShopProductFormModal({ 
  open, 
  mode, 
  initialValues, 
  loading, 
  error, 
  onClose, 
  onSubmit 
}: ShopProductFormModalProps) {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    price: 0,
    stock: { quantity: 0, unit: 'pcs' },
    isActive: true,
    isRefundable: false,
    maxOrderQuantity: undefined as number | undefined,
    minOrderQuantity: 1,
    deliveryTime: undefined as number | undefined,
    specialNotes: '',
  });

  // Initialize form data when modal opens or initialValues change
  useEffect(() => {
    if (open && initialValues) {
      setFormData({
        price: initialValues.price || 0,
        stock: initialValues.stock || { quantity: 0, unit: 'pcs' },
        isActive: initialValues.isActive ?? true,
        isRefundable: initialValues.isRefundable ?? false,
        maxOrderQuantity: initialValues.maxOrderQuantity,
        minOrderQuantity: initialValues.minOrderQuantity || 1,
        deliveryTime: initialValues.deliveryTime,
        specialNotes: initialValues.specialNotes || '',
      });
    }
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all z-[9999]"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-1/2 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0 z-[99999]">
        <h2 className="text-xl font-bold mb-4 text-white">
          {isEdit ? '✏️ Edit Shop Product' : '➕ Add Shop Product'}
        </h2>
        
        {error && <div className="text-red-400 mb-4">❌ {error}</div>}

        {initialValues?.product && (
          <div className="bg-[#1a2236] p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-white">
              Product: {initialValues.product.name?.uz || initialValues.product.name?.ru || 'N/A'}
            </h3>
            <p className="text-sm text-gray-400">
              Base Price: {initialValues.product.basePrice ? `$${initialValues.product.basePrice}` : 'N/A'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Shop Price 💰</label>
            <MaskedInput
              type="price"
              value={formData.price}
              onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
              placeholder="Enter shop price"
              className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Stock Quantity 📦</label>
              <MaskedInput
                type="number"
                value={formData.stock.quantity}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  stock: { ...prev.stock, quantity: value }
                }))}
                placeholder="Quantity"
                className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Unit 📏</label>
              <SearchableSelect
                value={formData.stock.unit}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  stock: { ...prev.stock, unit: value }
                }))}
                options={getUnitOptions()}
                placeholder="Select unit"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Min Order Quantity 📋</label>
              <MaskedInput
                type="number"
                value={formData.minOrderQuantity}
                onChange={(value) => setFormData(prev => ({ ...prev, minOrderQuantity: value }))}
                placeholder="Min order"
                className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Max Order Quantity 📋</label>
              <MaskedInput
                type="number"
                value={formData.maxOrderQuantity || 0}
                onChange={(value) => setFormData(prev => ({ ...prev, maxOrderQuantity: value || undefined }))}
                placeholder="Max order (optional)"
                className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Delivery Time (minutes) ⏱️</label>
            <MaskedInput
              type="number"
              value={formData.deliveryTime || 0}
              onChange={(value) => setFormData(prev => ({ ...prev, deliveryTime: value || undefined }))}
              placeholder="Delivery time in minutes (optional)"
              className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Special Notes 📝</label>
            <textarea
              value={formData.specialNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
              className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
              placeholder="Special notes about this product (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-white">Active in shop</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRefundable}
                onChange={(e) => setFormData(prev => ({ ...prev, isRefundable: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-white">Refundable</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
