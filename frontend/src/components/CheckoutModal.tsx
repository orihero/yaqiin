import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@yaqiin/shared/utils/formatPrice';
import type { Address } from '@yaqiin/shared/types/user';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (address: Address, paymentMethod: 'cash' | 'card') => void;
  onAddNewAddress?: () => void;
  addresses: Address[];
  totalAmount: number;
  isLoading?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onClose,
  onConfirm,
  onAddNewAddress,
  addresses,
  totalAmount,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    addresses.find(addr => addr.isDefault) || addresses[0] || null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match the animation duration
  };

  if (!open && !isClosing) return null;

  const handleConfirm = () => {
    if (selectedAddress) {
      onConfirm(selectedAddress, selectedPaymentMethod);
    }
  };

  const handleAddNewAddress = () => {
    if (onAddNewAddress) {
      onAddNewAddress();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-opacity-20 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        style={{ backdropFilter: 'blur(8px)' }}
      />
 
      {/* Modal Content */}
      <div className={`relative w-full max-w-md bg-white rounded-t-3xl shadow-lg max-h-[90vh] overflow-hidden transition-transform duration-300 ${
        isClosing ? 'animate-slideDown' : 'animate-slideUp'
      }`}>
        {/* Header */}
        <div className="bg-[#232c43] text-white px-6 py-4 flex items-center justify-between">
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="text-lg font-semibold">{t('checkout.title')}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <Icon icon="mdi:close" className="text-black text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Address Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#232c43]">{t('checkout.address')}</h3>
              <button
                onClick={handleAddNewAddress}
                className="text-[#ff7a00] text-sm font-medium"
              >
                {t('checkout.addNew')}
              </button>
            </div>

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon icon="mdi:map-marker-off" className="text-4xl mx-auto mb-2" />
                  <p className="text-sm">{t('checkout.noAddresses')}</p>
                  <button
                    onClick={handleAddNewAddress}
                    className="mt-2 text-[#ff7a00] text-sm font-medium"
                  >
                    {t('checkout.addFirstAddress')}
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:border-[#ff7a00]"
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon
                          icon={address.title?.toLowerCase().includes('office') ? 'mdi:office-building' : 'mdi:home'}
                          className="text-[#ff7a00] text-xl"
                        />
                        <div>
                          <h4 className="font-semibold text-[#232c43]">
                            {address.title || t('checkout.address')}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {t('checkout.building')} {address.buildingNumber}
                            {address.entranceNumber && `, ${t('checkout.entrance')} ${address.entranceNumber}`}
                            {address.apartmentNumber && `, ${t('checkout.apartment')} ${address.apartmentNumber}`}
                          </p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddress?._id === address._id
                          ? 'bg-[#232c43] border-[#232c43]'
                          : 'border-gray-300'
                        }`}>
                        {selectedAddress?._id === address._id && (
                          <Icon icon="mdi:check" className="text-white text-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#232c43]">{t('checkout.payment')}</h3>
            </div>
            <div className="space-y-3">
              {/* Cash Payment */}
              <div
                className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:border-[#ff7a00]"
                onClick={() => setSelectedPaymentMethod('cash')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center">
                      <Icon icon="mdi:cash" className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#232c43]">{t('checkout.cash')}</h4>
                      <p className="text-sm text-gray-600 mt-1">{t('checkout.cashDescription')}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'cash'
                      ? 'bg-[#232c43] border-[#232c43]'
                      : 'border-gray-300'
                    }`}>
                    {selectedPaymentMethod === 'cash' && (
                      <Icon icon="mdi:check" className="text-white text-sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card Payment */}
              <div
                className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:border-[#ff7a00]"
                onClick={() => setSelectedPaymentMethod('card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <Icon icon="mdi:credit-card" className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#232c43]">{t('checkout.card')}</h4>
                      <p className="text-sm text-gray-600 mt-1">{t('checkout.cardDescription')}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'card'
                      ? 'bg-[#232c43] border-[#232c43]'
                      : 'border-gray-300'
                    }`}>
                    {selectedPaymentMethod === 'card' && (
                      <Icon icon="mdi:check" className="text-white text-sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#232c43] px-6 py-4">
          <div className="text-center mb-4">
            <p className="text-gray-300 text-sm">{t('checkout.totalAmount')}</p>
            <p className="text-white text-xl font-bold">{formatPrice(totalAmount)}</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selectedAddress || isLoading}
            className="w-full bg-[#ff7a00] text-white rounded-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('checkout.processing') : t('checkout.continue')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;
