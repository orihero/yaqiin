import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShopProductDisplay } from '@yaqiin/shared/types/product';
import React, { useState } from 'react';
import { getShopProducts, getAvailableProductsForShop, assignProductToShop, removeProductFromShop, updateShopProduct, ShopProductListResponse } from '../../../services/shopProductService';
import MaskedInput from '../../../components/MaskedInput';
import SearchableSelect from '../../../components/SearchableSelect';
import { getUnitOptions } from '../../../utils/units';
import { formatPriceWithCurrency, formatNumber } from '../../../utils/inputMasks';
import ShopProductFormModal from './ShopProductFormModal';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

interface ShopProductsTabProps {
  shopId: string;
}

interface AssignProductFormData {
  price: number;
  stock: {
    quantity: number;
    unit: string;
  };
  isActive: boolean;
  isRefundable: boolean;
  maxOrderQuantity?: number;
  minOrderQuantity: number;
  deliveryTime?: number;
  specialNotes?: string;
}

export default function ShopProductsTab({ shopId }: ShopProductsTabProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [modalProductSearch, setModalProductSearch] = useState('');
  const [assigningProductId, setAssigningProductId] = useState<string | null>(null);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignFormData, setAssignFormData] = useState<AssignProductFormData>({
    price: 0,
    stock: { quantity: 0, unit: 'pcs' },
    isActive: true,
    isRefundable: true,
    minOrderQuantity: 1,
  });
  
  // Edit modal state
  const [editShopProduct, setEditShopProduct] = useState<ShopProductDisplay | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ images: string[]; initialIndex: number } | null>(null);

  const queryClient = useQueryClient();

  // Fetch products assigned to this shop
  const { data: shopProductsData, isLoading, error, refetch: refetchShopProducts } = useQuery<ShopProductListResponse, Error>({
    queryKey: ['shop-products', shopId, page, limit, search],
    queryFn: () => getShopProducts(shopId, page, limit, search),
    enabled: !!shopId,
  });

  // Fetch available products that can be assigned to this shop
  const { data: availableProductsData, isLoading: availableProductsLoading, error: availableProductsError, refetch: refetchAvailableProducts } = useQuery({
    queryKey: ['available-products-for-shop', shopId, modalProductSearch],
    queryFn: () => getAvailableProductsForShop(shopId, 1, 50, modalProductSearch),
    enabled: !!shopId && addProductModalOpen,
  });

  // Assign product to shop mutation
  const assignProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      setAssigningProductId(productId);
      setAssignError(null);
      await assignProductToShop(shopId, productId, assignFormData);
    },
    onSuccess: () => {
      setAssigningProductId(null);
      setShowAssignForm(false);
      setSelectedProduct(null);
      setAssignFormData({
        price: 0,
        stock: { quantity: 0, unit: 'pcs' },
        isActive: true,
        isRefundable: true,
        minOrderQuantity: 1,
      });
      refetchShopProducts();
      refetchAvailableProducts();
    },
    onError: (err: any) => {
      setAssignError(err?.message || 'Failed to assign product');
      setAssigningProductId(null);
    },
  });

  // Remove product from shop mutation
  const removeProductMutation = useMutation({
    mutationFn: async (shopProductId: string) => {
      setRemovingProductId(shopProductId);
      setRemoveError(null);
      await removeProductFromShop(shopProductId);
    },
    onSuccess: () => {
      setRemovingProductId(null);
      refetchShopProducts();
      refetchAvailableProducts();
    },
    onError: (err: any) => {
      setRemoveError(err?.message || 'Failed to remove product');
      setRemovingProductId(null);
    },
  });

  // Update shop product mutation
  const updateShopProductMutation = useMutation({
    mutationFn: async ({ shopProductId, data }: { shopProductId: string; data: Partial<ShopProductDisplay> }) => {
      await updateShopProduct(shopProductId, data);
    },
    onSuccess: () => {
      setEditModalOpen(false);
      setEditShopProduct(null);
      refetchShopProducts();
    },
    onError: (err: any) => {
      console.error('Failed to update shop product:', err);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const handleAssignClick = (product: any) => {
    setSelectedProduct(product);
    setAssignFormData({
      price: product.basePrice || 0,
      stock: { 
        quantity: product.baseStock?.quantity || 0, 
        unit: product.baseStock?.unit || 'pcs' 
      },
      isActive: true,
      isRefundable: true,
      minOrderQuantity: 1,
    });
    setShowAssignForm(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      assignProductMutation.mutate(selectedProduct._id);
    }
  };

  const handleEditClick = (shopProduct: ShopProductDisplay) => {
    setEditShopProduct(shopProduct);
    setEditModalOpen(true);
  };

  const handleImageClick = (shopProduct: ShopProductDisplay, imageIndex: number = 0) => {
    if (shopProduct.product?.images && shopProduct.product.images.length > 0) {
      setImagePreview({
        images: shopProduct.product.images,
        initialIndex: imageIndex
      });
    }
  };

  // Helper function to get display text from ProductNameDesc
  const getDisplayText = (nameDesc: any, fallback = 'N/A') => {
    if (!nameDesc) return fallback;
    if (typeof nameDesc === 'string') return nameDesc;
    if (nameDesc.uz) return nameDesc.uz;
    if (nameDesc.ru) return nameDesc.ru;
    return fallback;
  };

  if (isLoading) {
    return <div>Loading shop products...</div>;
  }

  if (error) {
    return <div className="text-red-400">{String(error.message)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Shop Products 🛍️</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
          onClick={() => setAddProductModalOpen(true)}
        >
          Add Product ➕
        </button>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search shop products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#232b42] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search 🔍
          </button>
        </div>
      </form>

      {!shopProductsData?.data?.length ? (
        <div className="text-gray-400">No products assigned to this shop.</div>
      ) : (
        <>
          {/* Shop Products Table */}
          <div className="bg-[#232b42] rounded-lg overflow-hidden">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-[#1a2236]">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Shop Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(shopProductsData.data) && shopProductsData.data.map((shopProduct: ShopProductDisplay) => (
                  <tr key={shopProduct._id} className="border-b border-[#2e3650] hover:bg-[#2e3650]">
                    <td className="py-3 px-4">
                      {shopProduct.product?.images && shopProduct.product.images.length > 0 ? (
                        <img
                          src={shopProduct.product.images[0]}
                          alt={getDisplayText(shopProduct.product?.name)}
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(shopProduct, 0)}
                          title="Click to preview"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                          📷
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{getDisplayText(shopProduct.product?.name)}</div>
                        <div className="text-sm text-gray-400">{getDisplayText(shopProduct.product?.description)}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {shopProduct.product?.categoryId ? (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {shopProduct.product.categoryId}
                        </span>
                      ) : (
                        <span className="text-gray-400">No category</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatPriceWithCurrency(shopProduct.price.toString())}</span>
                      {shopProduct.product?.basePrice && shopProduct.price !== shopProduct.product.basePrice && (
                        <div className="text-xs text-gray-400">
                          Base: {formatPriceWithCurrency(shopProduct.product.basePrice.toString())}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium">{formatNumber((shopProduct.stock?.quantity || 0).toString())}</span>
                        <span className="text-sm text-gray-400"> {shopProduct.stock?.unit || 'pcs'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        shopProduct.isActive 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {shopProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          title="Edit Shop Product"
                          onClick={() => handleEditClick(shopProduct)}
                        >
                          Edit ✏️
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          disabled={removingProductId === shopProduct._id}
                          onClick={() => removeProductMutation.mutate(shopProduct._id)}
                          title="Remove from Shop"
                        >
                          {removingProductId === shopProduct._id ? 'Removing...' : 'Remove 🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {shopProductsData.meta && shopProductsData.meta.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, shopProductsData.meta.total)} of {shopProductsData.meta.total} products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-[#232b42] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-[#232b42] text-white rounded">
                  {page} of {shopProductsData.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(shopProductsData.meta.totalPages, prev + 1))}
                  disabled={page === shopProductsData.meta.totalPages}
                  className="px-3 py-1 bg-[#232b42] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {removeError && <div className="text-red-400 mt-2">{removeError} ❗</div>}
      
      {/* Add Product Modal */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={() => {
              setAddProductModalOpen(false);
              setShowAssignForm(false);
              setSelectedProduct(null);
            }}
          />
          <div className="fixed top-0 right-0 h-full w-1/2 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
            <h2 className="text-xl font-bold mb-4">
              {showAssignForm ? 'Configure Product for Shop' : 'Add Product to Shop'}
            </h2>
            
            {!showAssignForm ? (
              <>
                <div className="mb-4">
                  <input
                    className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring mb-2"
                    placeholder="Search available products..."
                    value={modalProductSearch}
                    onChange={e => setModalProductSearch(e.target.value)}
                  />
                </div>
                
                {availableProductsLoading ? (
                  <div>Loading available products...</div>
                ) : availableProductsError ? (
                  <div className="text-red-400">{String(availableProductsError.message)}</div>
                ) : !availableProductsData?.data?.length ? (
                  <div className="text-gray-400">No available products found.</div>
                ) : (
                  <table className="min-w-full text-left bg-[#232b42] rounded-lg mb-2">
                    <thead>
                      <tr>
                        <th className="py-2 px-4">#</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Base Price</th>
                        <th className="py-2 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableProductsData.data.map((product: any, idx: number) => (
                        <tr key={product._id} className="border-b border-[#2e3650]">
                          <td className="py-2 px-4">{idx + 1}</td>
                          <td className="py-2 px-4">{getDisplayText(product.name)}</td>
                          <td className="py-2 px-4">{formatPriceWithCurrency(product.basePrice.toString())}</td>
                          <td className="py-2 px-4">
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold"
                              onClick={() => handleAssignClick(product)}
                              title="Assign Product"
                            >
                              Assign ➕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                {selectedProduct && (
                  <div className="bg-[#1a2236] p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-2">Product: {getDisplayText(selectedProduct.name)}</h3>
                    <p className="text-sm text-gray-400">Base Price: {formatPriceWithCurrency(selectedProduct.basePrice.toString())}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Shop Price 💰</label>
                  <MaskedInput
                    type="price"
                    value={assignFormData.price}
                    onChange={(value) => setAssignFormData(prev => ({ ...prev, price: value }))}
                    placeholder="Enter shop price"
                    className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity 📦</label>
                    <MaskedInput
                      type="number"
                      value={assignFormData.stock.quantity}
                      onChange={(value) => setAssignFormData(prev => ({ 
                        ...prev, 
                        stock: { ...prev.stock, quantity: value }
                      }))}
                      placeholder="Quantity"
                      className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit 📏</label>
                    <SearchableSelect
                      value={assignFormData.stock.unit}
                      onChange={(value) => setAssignFormData(prev => ({ 
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
                    <label className="block text-sm font-medium mb-2">Min Order Quantity 📋</label>
                    <MaskedInput
                      type="number"
                      value={assignFormData.minOrderQuantity}
                      onChange={(value) => setAssignFormData(prev => ({ ...prev, minOrderQuantity: value }))}
                      placeholder="Min order"
                      className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Order Quantity 📋</label>
                    <MaskedInput
                      type="number"
                      value={assignFormData.maxOrderQuantity || 0}
                      onChange={(value) => setAssignFormData(prev => ({ ...prev, maxOrderQuantity: value || undefined }))}
                      placeholder="Max order (optional)"
                      className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Time (minutes) ⏱️</label>
                  <MaskedInput
                    type="number"
                    value={assignFormData.deliveryTime || 0}
                    onChange={(value) => setAssignFormData(prev => ({ ...prev, deliveryTime: value || undefined }))}
                    placeholder="Delivery time in minutes (optional)"
                    className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Special Notes 📝</label>
                  <textarea
                    value={assignFormData.specialNotes || ''}
                    onChange={(e) => setAssignFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                    className="bg-[#1a2236] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring"
                    placeholder="Special notes about this product (optional)"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignFormData.isActive}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Active in shop</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignFormData.isRefundable}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, isRefundable: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Refundable</span>
                  </label>
                </div>
              </form>
            )}
            
            {assignError && <div className="text-red-400 mb-2">{assignError} ❗</div>}
            
            <div className="flex justify-end gap-2 mt-6">
              {showAssignForm ? (
                <>
                  <button 
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" 
                    onClick={() => {
                      setShowAssignForm(false);
                      setSelectedProduct(null);
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                    disabled={assigningProductId !== null}
                    onClick={handleAssignSubmit}
                  >
                    {assigningProductId ? 'Assigning...' : 'Assign Product'}
                  </button>
                </>
              ) : (
                <button 
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" 
                  onClick={() => {
                    setAddProductModalOpen(false);
                    setShowAssignForm(false);
                    setSelectedProduct(null);
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Shop Product Modal */}
      <ShopProductFormModal
        open={editModalOpen}
        mode="edit"
        initialValues={editShopProduct || undefined}
        loading={updateShopProductMutation.status === 'pending'}
        error={updateShopProductMutation.isError ? (updateShopProductMutation.error as any)?.message : null}
        onClose={() => {
          setEditModalOpen(false);
          setEditShopProduct(null);
        }}
        onSubmit={(values) => {
          if (editShopProduct) {
            updateShopProductMutation.mutate({
              shopProductId: editShopProduct._id,
              data: values
            });
          }
        }}
      />

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
