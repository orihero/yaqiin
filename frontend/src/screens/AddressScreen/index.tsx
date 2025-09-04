import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import TabBar from '../../components/TabBar';
import { toast } from 'react-toastify';
import AddressForm from './components/AddressForm';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/addressService';
import { fetchCurrentUser } from '../../services/userService';

const AddressScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (addressId: string) => {
    const address = user?.addresses?.find(addr => addr._id === addressId);
    if (address) {
      setEditingAddress(address);
      setShowForm(true);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t('address.confirmDelete'))) return;
    
    setIsLoading(true);
    try {
      await deleteAddress(addressId);
      toast.success(t('address.deleteSuccess'));
      
      // Refresh user data to get updated addresses
      const updatedUser = await fetchCurrentUser();
      setUser(updatedUser, localStorage.getItem('token') || '');
    } catch (error: any) {
      toast.error(error?.message || t('address.deleteFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setIsLoading(true);
    try {
      await setDefaultAddress(addressId);
      toast.success(t('address.setDefaultSuccess'));
      
      // Refresh user data to get updated addresses
      const updatedUser = await fetchCurrentUser();
      setUser(updatedUser, localStorage.getItem('token') || '');
    } catch (error: any) {
      toast.error(error?.message || t('address.setDefaultFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    setIsLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(addressData);
        toast.success(t('address.updateSuccess'));
      } else {
        // Add new address
        await addAddress(addressData);
        toast.success(t('address.addSuccess'));
      }
      
      // Refresh user data to get updated addresses
      const updatedUser = await fetchCurrentUser();
      setUser(updatedUser, localStorage.getItem('token') || '');
      
      setShowForm(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error?.message || t('address.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (showForm) {
    return (
      <AddressForm
        address={editingAddress}
        onSave={handleSaveAddress}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      {/* Main Content Card */}
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{
            minHeight: "calc(100vh - 90px)",
            maxHeight: "calc(100vh - 90px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex items-center">
              <button
                className="bg-[#232c43] rounded-full p-2 mr-3"
                onClick={() => navigate(-1)}
              >
                <Icon icon="mdi:arrow-left" className="text-white text-xl" />
              </button>
              <h1 className="text-xl font-bold text-[#232c43] leading-tight">
                {t('address.title')}
              </h1>
            </div>
            <button
              className="bg-[#ff7a00] text-white rounded-full px-4 py-2 text-sm font-semibold"
              onClick={handleAddAddress}
            >
              {t('address.addNew')}
            </button>
          </div>

          {/* Addresses List */}
          <div className="flex flex-col gap-4">
            {!user?.addresses || user.addresses.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Icon icon="mdi:map-marker-off" className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">{t('address.noAddresses')}</p>
                <p className="text-sm">{t('address.addFirstAddress')}</p>
                <button
                  className="mt-4 bg-[#ff7a00] text-white rounded-full px-6 py-3 font-semibold"
                  onClick={handleAddAddress}
                >
                  {t('address.addAddress')}
                </button>
              </div>
            ) : (
              user.addresses.map((address, index) => (
                <div
                  key={address._id || index}
                  className="bg-[#f8f8f8] rounded-2xl p-4 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:map-marker" className="text-[#ff7a00] text-xl" />
                      <div>
                        <h3 className="font-semibold text-[#232c43] text-base">
                          {address.title || t('address.address')} {index + 1}
                        </h3>
                        {address.isDefault && (
                          <span className="text-xs bg-[#ff7a00] text-white px-2 py-1 rounded-full">
                            {t('address.default')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          className="text-[#ff7a00] text-sm font-medium"
                          onClick={() => handleSetDefault(address._id || String(index))}
                          disabled={isLoading}
                        >
                          {t('address.setDefault')}
                        </button>
                      )}
                      <button
                        className="text-gray-500 hover:text-[#232c43]"
                        onClick={() => handleEditAddress(address._id || String(index))}
                        disabled={isLoading}
                      >
                        <Icon icon="mdi:pencil" className="text-lg" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAddress(address._id || String(index))}
                        disabled={isLoading}
                      >
                        <Icon icon="mdi:delete" className="text-lg" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>{t('address.building')}: {address.buildingNumber}</p>
                    {address.entranceNumber && (
                      <p>{t('address.entrance')}: {address.entranceNumber}</p>
                    )}
                    {address.apartmentNumber && (
                      <p>{t('address.apartment')}: {address.apartmentNumber}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default AddressScreen;
