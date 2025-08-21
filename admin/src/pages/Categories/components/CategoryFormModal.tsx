import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

interface CategoryFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  loading?: boolean;
  error?: string | null;
  details?: any;
  initialValues?: any;
  onClose: () => void;
  onSubmit: (values: any) => void;
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

export default function CategoryFormModal({ open, mode, loading, error, details, initialValues, onClose, onSubmit }: CategoryFormModalProps) {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: {
        uz: initialValues?.name?.uz || '',
        ru: initialValues?.name?.ru || '',
      },
      description: {
        uz: initialValues?.description?.uz || '',
        ru: initialValues?.description?.ru || '',
      },
      isActive: initialValues?.isActive ?? true,
      icon: initialValues?.icon || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: {
          uz: initialValues?.name?.uz || '',
          ru: initialValues?.name?.ru || '',
        },
        description: {
          uz: initialValues?.description?.uz || '',
          ru: initialValues?.description?.ru || '',
        },
        isActive: initialValues?.isActive ?? true,
        icon: initialValues?.icon || '',
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
        <h2 className="text-xl font-bold mb-4">{isEdit ? t('categories.editCategory') : t('categories.addCategory')}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {renderDetails(details)}
        <form onSubmit={handleSubmit((values) => onSubmit(values))}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">{t('categories.nameUzbek', 'Name (Uzbek)')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('name.uz', { required: t('categories.nameUzbekRequired', 'Name (Uzbek) is required') })} />
              {errors?.name?.uz && <span className="text-red-400 text-xs">{(errors.name.uz as any).message}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('categories.nameRussian', 'Name (Russian)')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('name.ru', { required: t('categories.nameRussianRequired', 'Name (Russian) is required') })} />
              {errors?.name?.ru && <span className="text-red-400 text-xs">{(errors.name.ru as any).message}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('categories.descriptionUzbek', 'Description (Uzbek)')}</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('description.uz')} />
            </div>
            <div>
              <label className="block mb-1">{t('categories.descriptionRussian', 'Description (Russian)')}</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('description.ru')} />
            </div>
            <div>
              <label className="block mb-1">{t('categories.iconName', 'Icon (Iconify name)')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('icon')} placeholder={t('categories.iconPlaceholder', 'e.g. mdi:food-apple')} />
              {/** Live preview of the icon */}
              {typeof watch === 'function' && watch('icon') && (
                <div className="mt-2"><Icon icon={watch('icon')} width={32} height={32} /></div>
              )}
            </div>
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4" />
              <label htmlFor="isActive" className="text-white">{t('common.active')}</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? t('common.saving') : t('common.creating')) : t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 