// Products.tsx: Main Products page for the admin panel. Displays product list and handles product creation/editing.
import React, { useState } from 'react';
import ProductFormModal from './components/ProductFormModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct, ProductListResponse } from '../../services/productService';
import { getAllShops } from '../../services/shopService';
import { getAllCategories } from '../../services/categoryService';
import { Product } from '@yaqiin/shared/types/product';
import { Icon } from '@iconify/react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Shop } from '@yaqiin/shared/types/shop';
import { Category } from '@yaqiin/shared/types/category';

const Products: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ProductListResponse>({
    queryKey: ['products', page, limit, search],
    queryFn: () => getProducts(page, limit, search),
  });

  const { data: shops } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: getAllShops,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (input: Partial<Product>) => createProduct(input),
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (input: Partial<Product> & { _id: string }) => updateProduct(input),
    onSuccess: () => {
      setShowModal(false);
      setEditProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => deleteProduct(product._id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleAdd = () => {
    setEditProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={handleAdd}
        >
          <Icon icon="mdi:plus" className="inline-block mr-2" /> Add Product
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder="Search Product"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="ml-4 text-gray-400">Dashboard • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">Products</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Shop</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan={5} className="text-center py-8 text-red-400">Failed to load products.</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                <div className="flex flex-col items-center">
                  <Icon icon="mdi:package-variant" className="text-5xl mb-4" />
                  <div className="text-lg font-medium">No products found.</div>
                  <div className="text-sm">Click <span className="font-semibold">Add Product</span> to create your first product.</div>
                </div>
              </td></tr>
            ) : (
              data?.data?.map((product: Product) => (
                <tr key={product._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt="Product" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <span className="text-gray-500 flex items-center justify-center"><Icon icon="mdi:image-off-outline" width={32} height={32} /></span>
                    )}
                  </td>
                  <td className="py-3 px-4">{product.name.uz}</td>
                  <td className="py-3 px-4">{categories?.find(c => c._id === product.categoryId)?.name.uz || product.categoryId}</td>
                  <td className="py-3 px-4">{shops?.find(s => s._id === product.shopId)?.name || product.shopId}</td>
                  <td className="py-3 px-4">{product.price}</td>
                  <td className="py-3 px-4">{product.stock.quantity}</td>
                  <td className="py-3 px-4 text-center flex gap-3 justify-center">
                    <button className="hover:text-blue-400" title="Edit" onClick={() => handleEdit(product)}>
                      <Icon icon="mdi:pencil" width={18} height={18} />
                    </button>
                    <button className="hover:text-red-400" title="Delete" onClick={() => handleDelete(product)}>
                      <Icon icon="mdi:delete" width={18} height={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            className="bg-[#232b42] text-white px-2 py-1 rounded"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >{'<<'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{'<'}</button>
          <span className="mx-2">{page} / {data?.meta?.totalPages ?? 1}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min((data?.meta?.totalPages ?? 1), p + 1))}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{'>'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(data?.meta?.totalPages ?? 1)}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{'>>'}</button>
        </div>
      </div>
      {/* Product Modal (Add/Edit) */}
      <ProductFormModal
        open={showModal}
        product={editProduct || undefined}
        loading={createMutation.isPending || updateMutation.isPending}
        error={createMutation.isError ? (createMutation.error as any)?.message : updateMutation.isError ? (updateMutation.error as any)?.message : null}
        onClose={() => { setShowModal(false); setEditProduct(null); }}
        onSubmit={(values) => {
          let { images, ...rest } = values;
          // Remove images if not a File[]
          if (images && images.length > 0 && !(images[0] instanceof File)) {
            delete rest.images;
            images = undefined;
          }
          if (editProduct) {
            const payload = images && images[0] instanceof File ? { ...editProduct, ...rest, images } : { ...editProduct, ...rest };
            updateMutation.mutate(payload as any);
          } else {
            const payload = images && images[0] instanceof File ? { ...rest, images } : rest;
            createMutation.mutate(payload as any);
          }
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        description={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name.uz}?` : ''}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
      />
    </div>
  );
};

export default Products; 