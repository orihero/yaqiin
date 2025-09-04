import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getShops, createShop, updateShop, deleteShop as deleteShopApi } from '../../services/shopService';
import { getUsers } from '../../services/userService';
import ShopFormModal from './components/ShopFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Shop } from '@yaqiin/shared/types/shop';
import { User } from '@yaqiin/shared/types/user';
import { useNavigate } from 'react-router-dom';
import { getOnlyChangedFields } from '../../utils/changeTracker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL: string;
    };
  }
}

const fetchShops = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await fetch(`${API_URL}/shops?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data?.error?.message || 'Failed to fetch shops');
  return data;
};

export default function ShopsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: Shop[]; meta: { total: number; page: number; limit: number; totalPages: number } }, Error>({
    queryKey: ['shops', page, limit, search],
    queryFn: () => getShops(page, limit, search),
  });

  const { data: usersData } = useQuery<{ success: boolean; data: User[] }, Error>({
    queryKey: ['users', 1, 1000, ''],
    queryFn: () => getUsers(1, 1000, ''),
  });

  const userMap = React.useMemo(() => {
    const map: Record<string, User> = {};
    usersData?.data?.forEach((u) => { map[u._id] = u; });
    return map;
  }, [usersData]);

  // Add shop mutation
  const createShopMutation = useMutation({
    mutationFn: async (input: Partial<Shop>) => {
      return createShop(input);
    },
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  // Edit shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (input: Partial<Shop> & { _id: string }) => {
      return updateShop(input);
    },
    onSuccess: () => {
      setShowModal(false);
      setEditShop(null);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  // Delete shop mutation
  const deleteShopMutation = useMutation({
    mutationFn: async (shop: Shop) => {
      if (!shop || !shop._id) throw new Error('Invalid shop');
      return deleteShopApi(shop._id);
    },
    onSuccess: () => {
      setDeleteShop(null);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('shops.title')}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => { setEditShop(null); setShowModal(true); }}
        >
          {t('shops.addShop')}
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder={t('shops.searchShop', 'Search Shop')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="ml-4 text-gray-400">{t('navigation.dashboard')} • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">{t('shops.title')}</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">{t('shops.shopLogo', 'Logo')}</th>
              <th className="py-3 px-4">{t('common.name')}</th>
              <th className="py-3 px-4">{t('shops.owner')}</th>
              <th className="py-3 px-4">{t('common.phone')}</th>
              <th className="py-3 px-4">{t('users.city')}</th>
              <th className="py-3 px-4">{t('common.status')}</th>
              <th className="py-3 px-4">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8">{t('common.loading')}</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center py-8 text-red-400">{String(error.message)}</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={8} className="text-center py-8">{t('shops.noShopsFound', 'No shops found.')}</td></tr>
            ) : (
              data.data.map((shop: Shop, idx: number) => (
                <tr
                  key={shop._id}
                  className="border-b border-[#2e3650] hover:bg-[#202840] transition cursor-pointer"
                  onClick={() => navigate(`/shops/${shop._id}`)}
                  title={t('shops.viewShopDetails', 'View shop details')}
                >
                  <td className="py-3 px-4">{(page - 1) * limit + idx + 1}</td>
                  <td className="py-3 px-4">
                    {shop.logo ? (
                      <img 
                        src={shop.logo} 
                        alt={`${shop.name} logo`} 
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold">{shop.name}</td>
                  <td className="py-3 px-4">{
                    userMap[shop.ownerId]
                      ? `${userMap[shop.ownerId].firstName || ''} ${userMap[shop.ownerId].lastName || ''}`.trim() || userMap[shop.ownerId].username || shop.ownerId
                      : shop.ownerId
                  }</td>
                  <td className="py-3 px-4">{shop.contactInfo?.phoneNumber}</td>
                  <td className="py-3 px-4">{shop.address?.city}</td>
                  <td className="py-3 px-4 capitalize">{t(`common.${shop.status}`)}</td>
                  <td className="py-3 px-4 flex gap-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditShop(shop); setShowModal(true); }} className="hover:text-blue-400" title={t('common.edit')}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"/></svg>
                    </button>
                    <button onClick={() => setDeleteShop(shop)} className="hover:text-red-400" title={t('common.delete')}>
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
      {/* Shop Modal (Add) */}
      <ShopFormModal
        open={showModal && !editShop}
        mode="add"
        loading={createShopMutation.status === 'pending'}
        error={createShopMutation.isError ? (createShopMutation.error as any)?.message : null}
        details={createShopMutation.isError ? (createShopMutation.error as any)?.details : null}
        onClose={() => setShowModal(false)}
        onSubmit={(values) => createShopMutation.mutate(values)}
      />
      {/* Shop Modal (Edit) */}
      <ShopFormModal
        open={!!editShop}
        mode="edit"
        initialValues={editShop || undefined}
        loading={updateShopMutation.status === 'pending'}
        error={updateShopMutation.isError ? (updateShopMutation.error as any)?.message : null}
        details={updateShopMutation.isError ? (updateShopMutation.error as any)?.details : null}
        onClose={() => setEditShop(null)}
        onSubmit={(values) => {
          if (editShop) {
            // Only send the changed fields plus the _id
            const changedFields = getOnlyChangedFields(editShop, values);
            const updateData = { ...changedFields, _id: editShop._id };
            console.log('Shop edit - Original:', editShop);
            console.log('Shop edit - Changes:', changedFields);
            console.log('Shop edit - Sending:', updateData);
            updateShopMutation.mutate(updateData);
          }
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteShop}
        title={t('shops.deleteShop')}
        description={deleteShop ? t('modals.confirmDeleteShop', 'Are you sure you want to delete {{shopName}}?', { shopName: deleteShop.name }) : ''}
        loading={deleteShopMutation.status === 'pending'}
        onCancel={() => setDeleteShop(null)}
        onConfirm={() => { if (deleteShop) deleteShopMutation.mutate(deleteShop); }}
      />
    </div>
  );
} 