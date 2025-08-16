import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UserFormModal from './components/UserFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { User } from '@yaqiin/shared/types/user';
import { getUsers, createUser, updateUser, deleteUser as deleteUserApi } from '../../services/userService';

export default function UsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }, Error>({
    queryKey: ['users', page, limit, search],
    queryFn: () => getUsers(page, limit, search),
  });

  // Add user mutation
  const createUserMutation = useMutation({
    mutationFn: async (input: Partial<User> & { password: string }) => {
      return createUser(input);
    },
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Edit user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (input: Partial<User> & { _id: string }) => {
      return updateUser(input);
    },
    onSuccess: () => {
      setShowModal(false);
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (user: User) => {
      if (!user || !user._id) throw new Error('Invalid user');
      return deleteUserApi(user._id);
    },
    onSuccess: () => {
      setDeleteUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Add user form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<User> & { password: string }>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phoneNumber: '',
      role: 'client',
      status: 'active',
      password: '',
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (showModal && !editUser) {
      reset();
    }
  }, [showModal, editUser, reset]);

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👥 {t('users.title')}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          onClick={() => { setEditUser(null); setShowModal(true); }}
        >
          <span>➕</span>
          {t('users.addUser')}
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder={`🔍 ${t('common.search')} ${t('users.title').toLowerCase()}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="ml-4 text-gray-400">📊 {t('navigation.dashboard')} • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">👥 {t('users.title')}</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">👤 {t('users.name', 'Name')}</th>
              <th className="py-3 px-4">📧 {t('users.email')}</th>
              <th className="py-3 px-4">📱 {t('users.phoneNumber')}</th>
              <th className="py-3 px-4">📅 {t('users.registrationDate')}</th>
              <th className="py-3 px-4">🎭 {t('users.role')}</th>
              <th className="py-3 px-4">📊 {t('common.status')}</th>
              <th className="py-3 px-4">⚙️ {t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8">🔄 {t('common.loading')}</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center py-8 text-red-400">❌ {String(error.message)}</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={8} className="text-center py-8">📭 {t('users.noUsersFound', 'No users found.')}</td></tr>
            ) : (
              data.data.map((user: User, idx: number) => (
                <tr key={user._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">{(page - 1) * limit + idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                        {user.firstName?.[0] || user.username?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phoneNumber}</td>
                  <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  <td className="py-3 px-4 capitalize">{t(`users.roles.${user.role}`, user.role)}</td>
                  <td className="py-3 px-4 capitalize">{t(`common.${user.status}`, user.status)}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button onClick={() => { setEditUser(user); setShowModal(true); }} className="hover:text-blue-400" title={t('common.edit')}>
                      ✏️
                    </button>
                    <button onClick={() => setDeleteUser(user)} className="hover:text-red-400" title={t('common.delete')}>
                      🗑️
                    </button>
                    <button
                      className="hover:text-green-400"
                      title={t('users.copyUserId', 'Copy User ID')}
                      onClick={async () => {
                        await navigator.clipboard.writeText(user._id);
                        setCopiedUserId(user._id);
                        setTimeout(() => setCopiedUserId(null), 1500);
                      }}
                    >
                      📋
                    </button>
                    {copiedUserId === user._id && (
                      <span className="ml-2 text-green-400 text-xs">✅ {t('users.copied', 'Copied!')}</span>
                    )}
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
          <span>📄 {t('users.itemsPerPage', 'Items per page')}:</span>
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
          >{t('common.pagination.first')}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{t('common.pagination.previous')}</button>
          <span className="mx-2">{page} / {data?.meta?.totalPages ?? 1}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min((data?.meta?.totalPages ?? 1), p + 1))}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{t('common.pagination.next')}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(data?.meta?.totalPages ?? 1)}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{t('common.pagination.last')}</button>
        </div>
      </div>
      {/* User Modal (Add) */}
      <UserFormModal
        open={showModal && !editUser}
        mode="add"
        loading={createUserMutation.status === 'pending'}
        error={createUserMutation.isError ? (createUserMutation.error as any)?.message : null}
        details={createUserMutation.isError ? (createUserMutation.error as any)?.details : null}
        onClose={() => setShowModal(false)}
        onSubmit={(values) => createUserMutation.mutate({ ...values, password: values.password ?? '' })}
      />
      {/* User Modal (Edit) */}
      <UserFormModal
        open={!!editUser}
        mode="edit"
        initialValues={editUser || undefined}
        loading={updateUserMutation.status === 'pending'}
        error={updateUserMutation.isError ? (updateUserMutation.error as any)?.message : null}
        details={updateUserMutation.isError ? (updateUserMutation.error as any)?.details : null}
        onClose={() => setEditUser(null)}
        onSubmit={(values) => {
          if (editUser) updateUserMutation.mutate({ ...editUser, ...values });
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        title={`🗑️ ${t('users.deleteUser')}`}
        description={deleteUser ? `${t('modals.confirmDelete')} ${deleteUser.firstName} ${deleteUser.lastName}?` : ''}
        loading={deleteUserMutation.status === 'pending'}
        onCancel={() => setDeleteUser(null)}
        onConfirm={() => { if (deleteUser) deleteUserMutation.mutate(deleteUser); }}
      />
    </div>
  );
} 