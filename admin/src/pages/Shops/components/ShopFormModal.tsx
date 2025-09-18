import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Shop } from '@yaqiin/shared/types/shop';
import { useQuery } from '@tanstack/react-query';
import { getAvailableOwners, getUserById } from '../../../services/userService';
import { ShopOperatingHours, OperatingHoursDay } from '@yaqiin/shared/types/shop';
import { getUnassignedGroups } from '../../../services/shopService';
import { getOnlyChangedFields } from '../../../utils/changeTracker';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

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
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const defaultAddress = {
    street: '',
    city: '',
    district: '',
    coordinates: { lat: 0, lng: 0 },
  };
  const defaultContactInfo = { phoneNumber: '', email: '', telegramUsername: '' };
  
  // State for file uploads
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialValues?.photo || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialValues?.logo || null);
  const [imagePreview, setImagePreview] = useState<{ images: string[]; initialIndex: number } | null>(null);
  
  // State for tracking if user wants to remove existing images
  const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);
  
  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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
  const {
    data: groupsData,
    isLoading: groupsLoading,
    error: groupsError
  } = useQuery({
    queryKey: ['unassigned-groups'],
    queryFn: getUnassignedGroups,
    enabled: open,
  });
  const [operatingHours, setOperatingHours] = useState<ShopOperatingHours>(
    initialValues?.operatingHours || getDefaultOperatingHours()
  );
  const [extraOwner, setExtraOwner] = useState<any>(null);

  // File handling functions
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Photo file selected:', file);
    if (file) {
      setPhotoFile(file);
      setShouldRemovePhoto(false); // Reset remove flag when new file is selected
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Logo file selected:', file);
    if (file) {
      setLogoFile(file);
      setShouldRemoveLogo(false); // Reset remove flag when new file is selected
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setShouldRemovePhoto(true);
    // Clear the file input
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setShouldRemoveLogo(true);
    // Clear the file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleImagePreview = (images: string[], initialIndex: number = 0) => {
    setImagePreview({ images, initialIndex });
  };

  useEffect(() => {
    if (open && mode === 'edit' && initialValues) {
      console.log('Setting up edit mode with initial values:', initialValues);
      console.log('Photo URL:', initialValues.photo);
      console.log('Logo URL:', initialValues.logo);
      
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
       setPhotoPreview(initialValues.photo || null);
       setLogoPreview(initialValues.logo || null);
       
       // Reset remove flags when opening edit mode
       setShouldRemovePhoto(false);
       setShouldRemoveLogo(false);
       
       console.log('Photo preview set to:', initialValues.photo);
       console.log('Logo preview set to:', initialValues.logo);
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
      setPhotoFile(null);
      setLogoFile(null);
      setPhotoPreview(null);
      setLogoPreview(null);
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
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all z-[9999]"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-1/2 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0 z-[99999]">
        <h2 className="text-xl font-bold mb-4">{isEdit ? t('shops.editShop') : t('shops.addShop')}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {renderDetails(details)}
                 <form onSubmit={handleSubmit((values) => {
           console.log('=== FORM SUBMISSION START ===');
           console.log('Form values:', values);
           console.log('Photo file state at submission:', photoFile);
           console.log('Logo file state at submission:', logoFile);
                     const currentValues: Partial<Shop> & { photoFile?: File | null; logoFile?: File | null } = {
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
           
           // Always include file fields if they exist
           if (photoFile) {
             currentValues.photoFile = photoFile;
             console.log('Photo file added to currentValues:', photoFile.name);
           }
           if (logoFile) {
             currentValues.logoFile = logoFile;
             console.log('Logo file added to currentValues:', logoFile.name);
           }
           
           console.log('Current values after file addition:', currentValues);
          
          // For edit mode, handle file uploads and changes
          let submitValues: Partial<Shop> & { 
            photoFile?: File | null; 
            logoFile?: File | null;
            removePhoto?: boolean;
            removeLogo?: boolean;
          };
          
          if (isEdit && initialValues) {
            console.log('=== EDIT MODE DEBUG ===');
            console.log('Photo file state:', photoFile);
            console.log('Logo file state:', logoFile);
            console.log('Photo preview:', photoPreview);
            console.log('Logo preview:', logoPreview);
            
            // If we have file uploads or remove flags, we need to send them regardless of other changes
            if (photoFile || logoFile || shouldRemovePhoto || shouldRemoveLogo) {
              console.log('File uploads or removals detected - sending FormData');
              submitValues = {
                _id: initialValues._id,
                photoFile: photoFile || undefined,
                logoFile: logoFile || undefined,
              };
              
              // Handle remove flags
              if (shouldRemovePhoto) {
                submitValues.removePhoto = true;
              }
              if (shouldRemoveLogo) {
                submitValues.removeLogo = true;
              }
              
              // Also include any other changed fields
              const { photoFile: _, logoFile: __, ...currentValuesWithoutFiles } = currentValues;
              const changedFields = getOnlyChangedFields(initialValues, currentValuesWithoutFiles);
              submitValues = { ...submitValues, ...changedFields };
            } else {
              // No file uploads, only send changed fields
              console.log('No file uploads - sending only changed fields');
              const { photoFile: _, logoFile: __, ...currentValuesWithoutFiles } = currentValues;
              const changedFields = getOnlyChangedFields(initialValues, currentValuesWithoutFiles);
              
              submitValues = { ...changedFields };
              
              // Ensure we always include the _id for identification
              if (!submitValues._id) {
                submitValues._id = initialValues._id;
              }
              
              // Always include existing photo and logo URLs if they exist
              if (initialValues.photo) {
                submitValues.photo = initialValues.photo;
              }
              if (initialValues.logo) {
                submitValues.logo = initialValues.logo;
              }
            }
            
            console.log('Final submit values:', submitValues);
            console.log('Submit values keys:', Object.keys(submitValues));
          } else {
            // For add mode, send all values
            submitValues = currentValues;
          }
          
          onSubmit(submitValues);
        })}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1">{t('shops.shopName')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('name', { required: t('forms.validation.required') })} />
              {errors.name && <span className="text-red-400 text-xs">{errors.name.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('shops.owner')}</label>
              {ownersLoading ? (
                <div className="text-gray-400 text-xs">{t('common.loading')}</div>
              ) : ownersError ? (
                <div className="text-red-400 text-xs">{ownersError instanceof Error ? ownersError.message : t('shops.failedToLoadOwners', 'Failed to load owners')}</div>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('ownerId', { required: t('forms.validation.required') })}>
                  <option value="" disabled>{t('common.select')} {t('shops.owner').toLowerCase()}</option>
                  {ownerOptions.map((owner: any) => (
                    <option key={owner._id} value={owner._id}>
                      {owner.firstName || ''} {owner.lastName || ''} {owner.username ? `(@${owner.username})` : ''} {owner.phoneNumber ? `- ${owner.phoneNumber}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.ownerId && <span className="text-red-400 text-xs">{errors.ownerId.message as string}</span>}
            </div>
            {/* Orders Chat ID field */}
            <div>
              <label className="block mb-1">{t('shops.telegramOrdersChatGroup', 'Telegram Orders Chat Group')}</label>
              {groupsLoading ? (
                <div className="text-gray-400 text-xs">{t('common.loading')}</div>
              ) : groupsError ? (
                <div className="text-red-400 text-xs">{t('shops.failedToLoadGroups', 'Failed to load groups')}</div>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('orders_chat_id')} defaultValue={initialValues?.orders_chat_id || ''}>
                  <option value="">{t('common.select')} {t('common.group', 'group')}</option>
                  {groupsData && groupsData.map((group: any) => (
                    <option key={group.chatId} value={group.chatId}>
                      {group.title || group.chatId} ({group.chatId})
                    </option>
                  ))}
                  {/* If editing and current value is not in unassigned, show it */}
                  {isEdit && initialValues?.orders_chat_id &&
                    !groupsData?.some((g: any) => String(g.chatId) === String(initialValues.orders_chat_id)) && (
                      <option value={initialValues.orders_chat_id}>
                        {initialValues.orders_chat_id} ({t('shops.currentlyAssigned', 'currently assigned')})
                      </option>
                    )}
                </select>
              )}
              <span className="text-gray-400 text-xs">{t('shops.telegramGroupDescription', 'Select the Telegram group chat for this shop\'s orders.')}</span>
              {errors.orders_chat_id && <span className="text-red-400 text-xs">{errors.orders_chat_id.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('common.phone')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('contactInfo.phoneNumber', { required: t('forms.validation.required') })} />
              {errors.contactInfo?.phoneNumber && <span className="text-red-400 text-xs">{errors.contactInfo.phoneNumber.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('common.email')}</label>
              <input type="email" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('contactInfo.email')} />
              {errors.contactInfo?.email && <span className="text-red-400 text-xs">{errors.contactInfo.email.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('common.telegramUsername', 'Telegram Username')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('contactInfo.telegramUsername')} />
              {errors.contactInfo?.telegramUsername && <span className="text-red-400 text-xs">{errors.contactInfo.telegramUsername.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('users.city')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.city', { required: t('forms.validation.required') })} />
              {errors.address?.city && <span className="text-red-400 text-xs">{errors.address.city.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('shops.street', 'Street')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.street', { required: t('forms.validation.required') })} />
              {errors.address?.street && <span className="text-red-400 text-xs">{errors.address.street.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('shops.district', 'District')}</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('address.district', { required: t('forms.validation.required') })} />
              {errors.address?.district && <span className="text-red-400 text-xs">{errors.address.district.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('shops.latitude', 'Latitude')}</label>
              <input 
                type="number" 
                step="any"
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                {...register('address.coordinates.lat', { 
                  required: t('forms.validation.required'),
                  valueAsNumber: true 
                })} 
              />
              {errors.address?.coordinates?.lat && <span className="text-red-400 text-xs">{errors.address.coordinates.lat.message as string}</span>}
            </div>
            <div>
              <label className="block mb-1">{t('shops.longitude', 'Longitude')}</label>
              <input 
                type="number" 
                step="any"
                className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" 
                {...register('address.coordinates.lng', { 
                  required: t('forms.validation.required'),
                  valueAsNumber: true 
                })} 
              />
              {errors.address?.coordinates?.lng && <span className="text-red-400 text-xs">{errors.address.coordinates.lng.message as string}</span>}
            </div>
            <div className="col-span-2">
              <label className="block mb-1">{t('shops.openingHours')}</label>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="p-1">{t('shops.day', 'Day')}</th>
                      <th className="p-1">{t('shops.open', 'Open?')}</th>
                      <th className="p-1">{t('shops.openTime', 'Open Time')}</th>
                      <th className="p-1">{t('shops.closeTime', 'Close Time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daysOfWeek.map((day) => (
                      <tr key={day}>
                        <td className="p-1 capitalize">{t(`shops.days.${day}`, day)}</td>
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
              <label className="block mb-1">{t('common.description')}</label>
              <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} {...register('description')} />
            </div>
            
            {/* Photo Upload */}
            <div className="col-span-2">
              <label className="block mb-1">{t('shops.shopPhoto', 'Shop Photo')}</label>
              <div className="flex items-center gap-4">
                                 <input
                   ref={photoInputRef}
                   type="file"
                   accept="image/*"
                   onChange={handlePhotoChange}
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                 />
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
                  >
                    {t('common.remove', 'Remove')}
                  </button>
                )}
              </div>
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Shop photo preview"
                    className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImagePreview([photoPreview], 0)}
                    title="Click to preview"
                    onError={(e) => {
                      console.error('Failed to load photo:', photoPreview);
                      console.error('Error event:', e);
                    }}
                    onLoad={() => {
                      console.log('Photo loaded successfully:', photoPreview);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div className="col-span-2">
              <label className="block mb-1">{t('shops.shopLogo', 'Shop Logo')}</label>
              <div className="flex items-center gap-4">
                                 <input
                   ref={logoInputRef}
                   type="file"
                   accept="image/*"
                   onChange={handleLogoChange}
                   className="flex-1 px-3 py-2 rounded bg-[#1a2236] text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                 />
                {logoPreview && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
                  >
                    {t('common.remove', 'Remove')}
                  </button>
                )}
              </div>
              {logoPreview && (
                <div className="mt-2">
                  <img
                    src={logoPreview}
                    alt="Shop logo preview"
                    className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImagePreview([logoPreview], 0)}
                    title="Click to preview"
                    onError={(e) => {
                      console.error('Failed to load logo:', logoPreview);
                      console.error('Error event:', e);
                    }}
                    onLoad={() => {
                      console.log('Logo loaded successfully:', logoPreview);
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1">{t('common.status')}</label>
              <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" {...register('status', { required: true })}>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
                <option value="suspended">{t('shops.suspended', 'Suspended')}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? t('common.saving', 'Saving...') : t('common.creating', 'Creating...')) : t('common.save')}</button>
          </div>
        </form>
      </div>

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