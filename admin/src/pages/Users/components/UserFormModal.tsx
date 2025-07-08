import React from 'react';
import { useForm } from 'react-hook-form';
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
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {renderDetails(details)}
        <form onSubmit={handleSubmit((values) => onSubmit(values))}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Telegram ID</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('telegramId', { required: 'Telegram ID is required' })} />
              {errors.telegramId && <span className="text-red-400 text-xs">{errors.telegramId.message}</span>}
            </div>
            <div>
              <label className="block mb-1">First Name</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('firstName', { required: 'First name is required' })} />
              {errors.firstName && <span className="text-red-400 text-xs">{errors.firstName.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Last Name</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('lastName', { required: 'Last name is required' })} />
              {errors.lastName && <span className="text-red-400 text-xs">{errors.lastName.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Username</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('username', { required: 'Username is required' })} />
              {errors.username && <span className="text-red-400 text-xs">{errors.username.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" type="email" {...register('email', { required: 'Email is required' })} />
              {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Phone Number</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('phoneNumber', { required: 'Phone number is required' })} />
              {errors.phoneNumber && <span className="text-red-400 text-xs">{errors.phoneNumber.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Role</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('role', { required: true })}>
                <option value="client">Client</option>
                <option value="courier">Courier</option>
                <option value="admin">Admin</option>
                <option value="shop_owner">Shop Owner</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('status', { required: true })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            {!isEdit && (
              <div>
                <label className="block mb-1">Password</label>
                <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" type="password" {...register('password', { required: !isEdit ? 'Password is required' : false, minLength: { value: 6, message: 'Min 6 chars' } })} />
                {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
              </div>
            )}
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