import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Courier } from '@yaqiin/shared/types/courier';
import { useQuery } from '@tanstack/react-query';
import { getAvailableCouriers, getUserById, getAllUsers, getUsers } from '../../../services/userService';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash.debounce';

interface CourierFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialValues?: Partial<Courier>;
  loading?: boolean;
  error?: string | null;
  details?: any;
  onClose: () => void;
  onSubmit: (values: Partial<Courier>) => void;
}

type CourierFormFields = Omit<Partial<Courier>, 'isActive'> & { isActive: string };

export default function CourierFormModal({ open, mode, initialValues, loading, error, details, onClose, onSubmit }: CourierFormModalProps) {
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<CourierFormFields>({
    defaultValues: {
      vehicleType: '',
      licenseNumber: '',
      availability: 'available',
      ...initialValues,
      isActive: String(initialValues?.isActive) === 'false' ? 'false' : 'true',
    },
  });

  const [showBank, setShowBank] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [daysOfWeekInput, setDaysOfWeekInput] = useState('');

  // Add state for selected user
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(initialValues?.userId ? {
    value: initialValues.userId,
    label: initialValues.userId,
  } : null);

  // Debounced async loader for available courier users
  const loadAvailableCourierUserOptions = React.useMemo(() =>
    debounce((inputValue: string, callback: (options: { value: string; label: string }[]) => void) => {
      getAvailableCouriers().then(users => {
        const filtered = (users || []).filter((user: any) => {
          if (!inputValue) return true;
          const search = inputValue.toLowerCase();
          return (
            (user.firstName && user.firstName.toLowerCase().includes(search)) ||
            (user.lastName && user.lastName.toLowerCase().includes(search)) ||
            (user.username && user.username.toLowerCase().includes(search)) ||
            (user.phoneNumber && user.phoneNumber.includes(search))
          );
        });
        callback(
          filtered.map((user: any) => ({
            value: user._id,
            label: `${user.firstName} ${user.lastName} (${user.username})`,
          }))
        );
      });
    }, 300),
  []);

  // Dark theme styles for react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#1a2236',
      color: 'white',
      borderColor: state.isFocused ? '#2563eb' : '#232b42',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
      minHeight: '40px',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#232b42',
      color: 'white',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#2563eb'
        : state.isFocused
        ? '#232b42'
        : '#1a2236',
      color: 'white',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#a3a3a3',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: '#a3a3a3',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: '#232b42',
    }),
  };

  const {
    data: couriersData,
    isLoading: couriersLoading,
    error: couriersError
  } = useQuery({
    queryKey: [isAdd ? 'available-couriers' : 'all-couriers'],
    queryFn: isAdd ? getAvailableCouriers : getAllUsers,
    enabled: open,
  });
  const courierOptions = React.useMemo(() => {
    if (!couriersData) return [];
    if (isAdd) return couriersData;
    // In edit mode, filter to only users with role 'courier'
    return couriersData.filter((u: any) => u.role === 'courier');
  }, [couriersData, isAdd]);

  useEffect(() => {
    if (open) {
      reset({
        vehicleType: initialValues?.vehicleType || '',
        licenseNumber: initialValues?.licenseNumber || '',
        availability: initialValues?.availability || 'available',
        userId: initialValues?.userId || '',
        isActive: String(initialValues?.isActive) === 'false' ? 'false' : 'true',
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
      <div className="fixed top-0 right-0 h-full w-1/2 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Courier' : 'Add Courier'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {/* Details rendering can be added here if needed */}
        <form onSubmit={handleSubmit((values) => {
          // Convert isActive from string to boolean
          let parsedValues: Partial<Courier> = {
            ...values,
            isActive: values.isActive === 'true',
            userId: selectedUser?.value,
          };
          onSubmit(parsedValues);
        })}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1">Vehicle Type</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('vehicleType', { required: 'Vehicle type is required' })} />
              {errors.vehicleType && <span className="text-red-400 text-xs">{errors.vehicleType.message as string}</span>}
            </div>
            <div className="col-span-2">
              <label className="block mb-1">License Number</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('licenseNumber', { required: 'License number is required' })} />
              {errors.licenseNumber && <span className="text-red-400 text-xs">{errors.licenseNumber.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">Availability</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('availability', { required: true })}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('isActive', { required: true })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">User</label>
              <AsyncSelect
                classNamePrefix="react-select"
                className="w-full"
                styles={selectStyles}
                isClearable
                isSearchable
                placeholder="Select courier user"
                cacheOptions
                defaultOptions
                loadOptions={loadAvailableCourierUserOptions}
                value={selectedUser}
                onChange={option => setSelectedUser(option)}
                required
              />
              {errors.userId && <span className="text-red-400 text-xs">{errors.userId.message as string}</span>}
            </div>
          </div>
          {/* Backend error details */}
          {details && (typeof details === 'string' ? (
            <div className="text-red-400 text-xs mt-2">{details}</div>
          ) : details.errors ? (
            <ul className="text-red-400 text-xs mb-2">
              {Object.entries(details.errors).map(([field, err]: any) => (
                <li key={field}>{field}: {err.message}</li>
              ))}
            </ul>
          ) : details.message ? (
            <div className="text-red-400 text-xs mb-2">{details.message}</div>
          ) : null)}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? 'Saving...' : 'Creating...') : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 