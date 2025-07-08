import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Shop } from '@yaqiin/shared/types/shop';
import { useQuery } from '@tanstack/react-query';
import { getAvailableOwners, getUserById } from '../../../services/userService';
import { ShopOperatingHours, OperatingHoursDay } from '@yaqiin/shared/types/shop';

interface ShopFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialValues?: Partial<Shop>;
  loading?: boolean;
  error?: string | null;
  details?: any;
  onClose: () => void;
  onSubmit: (values: Partial<Shop>) => void;
}

const daysOfWeek: (keyof ShopOperatingHours)[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

function getDefaultOperatingHours(): ShopOperatingHours {
  return daysOfWeek.reduce((acc, day) => {
    acc[day] = { open: '09:00', close: '18:00', isOpen: true } as OperatingHoursDay;
    return acc;
  }, {} as ShopOperatingHours);
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

export default function ShopFormModal({ open, mode, initialValues, loading, error, details, onClose, onSubmit }: ShopFormModalProps) {
  const isEdit = mode === 'edit';
  const defaultAddress = {
    street: '',
    city: '',
    district: '',
    coordinates: { lat: 0, lng: 0 },
  };
  const defaultContactInfo = { phoneNumber: '', email: '', telegramUsername: '' };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Shop>>({
    defaultValues: {
      name: '',
      ownerId: '',
      contactInfo: { ...defaultContactInfo, ...(initialValues?.contactInfo || {}) },
      address: { ...defaultAddress, ...(initialValues?.address || {}) },
      status: 'active',
      description: '',
      ...initialValues,
    },
  });
  const {
    data: ownersData,
    isLoading: ownersLoading,
    error: ownersError
  } = useQuery({
    queryKey: ['available-owners'],
    queryFn: getAvailableOwners,
    enabled: open,
  });
  const [operatingHours, setOperatingHours] = useState<ShopOperatingHours>(
    initialValues?.operatingHours || getDefaultOperatingHours()
  );
  const [extraOwner, setExtraOwner] = useState<any>(null);

  useEffect(() => {
    if (open && mode === 'edit' && initialValues) {
      reset({
        name: initialValues.name || '',
        ownerId: initialValues.ownerId || '',
        contactInfo: { ...defaultContactInfo, ...(initialValues.contactInfo || {}) },
        address: { ...defaultAddress, ...(initialValues.address || {}) },
        status: initialValues.status || 'active',
        description: initialValues.description || '',
        ...initialValues,
      });
      setOperatingHours(initialValues.operatingHours || getDefaultOperatingHours());
    }
    if (open && mode === 'add') {
      reset({
        name: '',
        ownerId: '',
        contactInfo: { ...defaultContactInfo },
        address: { ...defaultAddress },
        status: 'active',
        description: '',
      });
      setOperatingHours(getDefaultOperatingHours());
    }
  }, [open, mode, initialValues, reset]);

  useEffect(() => {
    if (isEdit && initialValues?.ownerId && ownersData && !ownersData.some((o: any) => o._id === initialValues.ownerId)) {
      getUserById(initialValues.ownerId).then(setExtraOwner);
    } else {
      setExtraOwner(null);
    }
  }, [isEdit, initialValues, ownersData]);

  const ownerOptions = React.useMemo(() => {
    let options = ownersData ? [...ownersData] : [];
    if (isEdit && initialValues?.ownerId && extraOwner && !options.some(o => o._id === initialValues.ownerId)) {
      options.push(extraOwner);
    }
    return options;
  }, [ownersData, isEdit, initialValues, extraOwner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Shop' : 'Add Shop'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {renderDetails(details)}
        <form onSubmit={handleSubmit((values) => {
          const submitValues: Partial<Shop> = {
            ...values,
            operatingHours,
            contactInfo: {
              ...defaultContactInfo,
              ...(initialValues?.contactInfo || {}),
              ...(values.contactInfo || {}),
            },
            address: {
              ...defaultAddress,
              ...(initialValues?.address || {}),
              ...(values.address || {}),
            },
          };
          onSubmit(submitValues);
        })}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1">Shop Name</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('name', { required: 'Shop name is required' })} />
              {errors.name && <span className="text-red-400 text-xs">{errors.name.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">Owner</label>
              {ownersLoading ? (
                <div className="text-gray-400 text-xs">Loading owners...</div>
              ) : ownersError ? (
                <div className="text-red-400 text-xs">{ownersError instanceof Error ? ownersError.message : 'Failed to load owners'}</div>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('ownerId', { required: 'Owner is required' })}>
                  <option value="" disabled>Select owner</option>
                  {ownerOptions.map((owner: any) => (
                    <option key={owner._id} value={owner._id}>
                      {owner.firstName || ''} {owner.lastName || ''} {owner.username ? `(@${owner.username})` : ''} {owner.phoneNumber ? `- ${owner.phoneNumber}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.ownerId && <span className="text-red-400 text-xs">{errors.ownerId.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">Phone Number</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('contactInfo.phoneNumber', { required: 'Phone number is required' })} />
              {errors.contactInfo?.phoneNumber && <span className="text-red-400 text-xs">{errors.contactInfo.phoneNumber.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">City</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.city', { required: 'City is required' })} />
              {errors.address?.city && <span className="text-red-400 text-xs">{errors.address.city.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">Street</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.street', { required: 'Street is required' })} />
              {errors.address?.street && <span className="text-red-400 text-xs">{errors.address.street.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">District</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.district', { required: 'District is required' })} />
              {errors.address?.district && <span className="text-red-400 text-xs">{errors.address.district.message as string}</span>}
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Operating Hours</label>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="p-1">Day</th>
                      <th className="p-1">Open?</th>
                      <th className="p-1">Open Time</th>
                      <th className="p-1">Close Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daysOfWeek.map((day) => (
                      <tr key={day}>
                        <td className="p-1 capitalize">{day}</td>
                        <td className="p-1">
                          <input
                            type="checkbox"
                            checked={operatingHours[day].isOpen}
                            onChange={e => setOperatingHours(oh => ({
                              ...oh,
                              [day]: { ...oh[day], isOpen: e.target.checked }
                            }))}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="time"
                            className="bg-[#1a2236] text-white rounded px-2 py-1"
                            value={operatingHours[day].open}
                            disabled={!operatingHours[day].isOpen}
                            onChange={e => setOperatingHours(oh => ({
                              ...oh,
                              [day]: { ...oh[day], open: e.target.value }
                            }))}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="time"
                            className="bg-[#1a2236] text-white rounded px-2 py-1"
                            value={operatingHours[day].close}
                            disabled={!operatingHours[day].isOpen}
                            onChange={e => setOperatingHours(oh => ({
                              ...oh,
                              [day]: { ...oh[day], close: e.target.value }
                            }))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Description</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} {...register('description')} />
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('status', { required: true })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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