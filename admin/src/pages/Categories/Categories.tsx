import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Category } from '@yaqiin/shared/types/category';
import { getCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi } from '../../services/categoryService';
import CategoryFormModal from './components/CategoryFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data, isLoading, error } = useQuery<{ success: boolean; data: Category[]; meta: { total: number; page: number; limit: number; totalPages: number } }, Error>({
    queryKey: ['categories', page, limit, search],
    queryFn: () => getCategories(page, limit, search),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (input: Partial<Category>) => {
      return createCategory(input);
    },
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (input: Partial<Category> & { _id: string }) => {
      return updateCategory(input);
    },
    onSuccess: () => {
      setShowModal(false);
      setEditCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!category || !category._id) throw new Error('Invalid category');
      return deleteCategoryApi(category._id);
    },
    onSuccess: () => {
      setDeleteCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => { setEditCategory(null); setShowModal(true); }}
        >
          {t('categories.addCategory')}
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder={t('categories.searchCategory', 'Search Category')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="ml-4 text-gray-400">{t('navigation.dashboard')} • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">{t('categories.title')}</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">{t('common.name')}</th>
              <th className="py-3 px-4">{t('common.description')}</th>
              <th className="py-3 px-4">{t('common.status')}</th>
              <th className="py-3 px-4">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">{t('common.loading')}</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-8 text-red-400">{String(error.message)}</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={5} className="text-center py-8">{t('categories.noCategoriesFound', 'No categories found.')}</td></tr>
            ) : (
              data.data.map((category, idx) => (
                <tr key={category._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">{(page - 1) * limit + idx + 1}</td>
                  <td className="py-3 px-4 font-semibold">{category.name.uz}</td>
                  <td className="py-3 px-4">{category.description?.uz || '-'}</td>
                  <td className="py-3 px-4 capitalize">{category.isActive ? t('common.active') : t('common.inactive')}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button onClick={() => { setEditCategory(category); setShowModal(true); }} className="hover:text-blue-400" title={t('common.edit')}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"/></svg>
                    </button>
                    <button onClick={() => setDeleteCategory(category)} className="hover:text-red-400" title={t('common.delete')}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
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
          <span>{t('users.itemsPerPage')}:</span>
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
      {/* Category Modal (Add) */}
      <CategoryFormModal
        open={showModal && !editCategory}
        mode="add"
        loading={createCategoryMutation.status === 'pending'}
        error={createCategoryMutation.isError ? (createCategoryMutation.error as any)?.message : null}
        details={createCategoryMutation.isError ? (createCategoryMutation.error as any)?.details : null}
        onClose={() => setShowModal(false)}
        onSubmit={(values) => createCategoryMutation.mutate(values)}
      />
      {/* Category Modal (Edit) */}
      <CategoryFormModal
        open={showModal && !!editCategory}
        mode="edit"
        loading={updateCategoryMutation.status === 'pending'}
        error={updateCategoryMutation.isError ? (updateCategoryMutation.error as any)?.message : null}
        details={updateCategoryMutation.isError ? (updateCategoryMutation.error as any)?.details : null}
        initialValues={editCategory}
        onClose={() => {
          setShowModal(false);
          setEditCategory(null);
        }}
        onSubmit={(values) => updateCategoryMutation.mutate({ ...values, _id: editCategory?._id })}
      />
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteCategory}
        title={t('categories.deleteCategory')}
        description={t('categories.confirmDeleteCategory', 'Are you sure you want to delete this category? This action cannot be undone.')}
        loading={deleteCategoryMutation.status === 'pending'}
        onCancel={() => setDeleteCategory(null)}
        onConfirm={() => deleteCategory && deleteCategoryMutation.mutate(deleteCategory)}
      />
    </div>
  );
} 