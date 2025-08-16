import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User } from '@yaqiin/shared/types/user';

interface UserFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialValues?: Partial<User>;
  loading?: boolean;
  error?: string | null;
  details?: any;
  onClose: () => void;
  onSubmit: (values: Partial<User> & { password?: string }) => void;
}

function renderDetails(details: any) {
  if (!details) return null;
  if (typeof details === 'string') return <div className="text-red-400 text-xs">{details}</div>;
  if (details.errors) {
    return (
      <ul className="text-red-400 text-xs mb-2">
        {Object.entries(details.errors).map(([field, err]: any) => (
          <li key={field}>{field}: {err.message}</li>
        ))}
      </ul>
    );
  }
  if (details.message) return <div className="text-red-400 text-xs mb-2">{details.message}</div>;
  return null;
}

export default function UserFormModal({ open, mode, initialValues, loading, error, details, onClose, onSubmit }: UserFormModalProps) {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<User> & { password?: string }>({
    defaultValues: {
      telegramId: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phoneNumber: '',
      role: 'client',
      status: 'active',
      ...initialValues,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        telegramId: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        role: 'client',
        status: 'active',
        ...initialValues,
      });
    }
  }, [open, initialValues, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? `✏️ ${t('users.editUser')}` : `➕ ${t('users.addUser')}`}
        </h2>
        {error && <div className="text-red-400 mb-2">❌ {error}</div>}
        {renderDetails(details)}
        <form onSubmit={handleSubmit((values) => onSubmit(values))}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">📱 Telegram ID</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('telegramId', { required: t('forms.validation.required') })} />
              {errors.telegramId && <span className="text-red-400 text-xs">{errors.telegramId.message}</span>}
            </div>
            <div>
              <label className="block mb-1">👤 {t('users.firstName')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('firstName', { required: t('forms.validation.required') })} />
              {errors.firstName && <span className="text-red-400 text-xs">{errors.firstName.message}</span>}
            </div>
            <div>
              <label className="block mb-1">👤 {t('users.lastName')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('lastName', { required: t('forms.validation.required') })} />
              {errors.lastName && <span className="text-red-400 text-xs">{errors.lastName.message}</span>}
            </div>
            <div>
              <label className="block mb-1">👤 {t('users.username')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('username', { required: t('forms.validation.required') })} />
              {errors.username && <span className="text-red-400 text-xs">{errors.username.message}</span>}
            </div>
            <div>
              <label className="block mb-1">📧 {t('users.email')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" type="email" {...register('email', { required: t('forms.validation.required') })} />
              {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
            </div>
            <div>
              <label className="block mb-1">📱 {t('users.phoneNumber')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('phoneNumber', { required: t('forms.validation.required') })} />
              {errors.phoneNumber && <span className="text-red-400 text-xs">{errors.phoneNumber.message}</span>}
            </div>
            <div>
              <label className="block mb-1">🎭 {t('users.role')}</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('role', { required: true })}>
                <option value="client">{t('users.roles.client', 'Client')}</option>
                <option value="courier">{t('users.roles.courier', 'Courier')}</option>
                <option value="admin">{t('users.roles.admin', 'Admin')}</option>
                <option value="shop_owner">{t('users.roles.shopOwner', 'Shop Owner')}</option>
                <option value="operator">{t('users.roles.operator', 'Operator')}</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">📊 {t('common.status')}</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('status', { required: true })}>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
                <option value="suspended">{t('users.statuses.suspended', 'Suspended')}</option>
              </select>
            </div>
            {!isEdit && (
              <div>
                <label className="block mb-1">🔒 {t('users.password')}</label>
                <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" type="password" {...register('password', { required: !isEdit ? t('forms.validation.required') : false, minLength: { value: 6, message: t('forms.validation.minLength', { min: 6 }) } })} />
                {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 flex items-center gap-2" onClick={onClose}>
              <span>❌</span>
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 flex items-center gap-2" disabled={loading}>
              <span>{loading ? '🔄' : '💾'}</span>
              {loading ? (isEdit ? t('users.saving', 'Saving...') : t('users.creating', 'Creating...')) : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 