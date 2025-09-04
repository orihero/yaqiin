import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressFormProps {
  address?: {
    _id?: string;
    title?: string;
    buildingNumber: string;
    entranceNumber: string;
    apartmentNumber: string;
    isDefault?: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  onSave: (address: any) => void;
  onCancel: () => void;
}

interface LocationMarkerProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
  mapRef: React.RefObject<any>;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, mapRef }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const AddressForm: React.FC<AddressFormProps> = ({ address, onSave, onCancel }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    title: address?.title || '',
    buildingNumber: address?.buildingNumber || '',
    entranceNumber: address?.entranceNumber || '',
    apartmentNumber: address?.apartmentNumber || '',
    isDefault: address?.isDefault || false,
  });
  const [position, setPosition] = useState<[number, number]>(
    address?.coordinates ? [address.coordinates.lat, address.coordinates.lng] : [41.3111, 69.2797] // Tashkent default
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition: [number, number] = [latitude, longitude];
          setPosition(newPosition);
          
          // Center the map to the new location
          if (mapRef.current) {
            mapRef.current.setView(newPosition, 16);
          }
          
          setIsGettingLocation(false);
          toast.success(t('address.locationFound'));
        },
        (error) => {
          setIsGettingLocation(false);
          console.error('Error getting location:', error);
          toast.error(t('address.locationError'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error(t('address.geolocationNotSupported'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buildingNumber) {
      toast.error(t('address.fillRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      const addressData = {
        ...formData,
        coordinates: {
          lat: position[0],
          lng: position[1],
        },
        ...(address?._id && { _id: address._id }),
      };
      
      await onSave(addressData);
    } catch (error: any) {
      toast.error(error?.message || t('address.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
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
                onClick={onCancel}
              >
                <Icon icon="mdi:arrow-left" className="text-white text-xl" />
              </button>
              <h1 className="text-xl font-bold text-[#232c43] leading-tight">
                {address ? t('address.editAddress') : t('address.addAddress')}
              </h1>
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#232c43]">{t('address.selectLocation')}</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2 bg-[#ff7a00] text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Icon icon="mdi:crosshairs-gps" className="text-lg" />
                {isGettingLocation ? t('address.gettingLocation') : t('address.getCurrentLocation')}
              </button>
            </div>
            <div className="h-80 rounded-2xl overflow-hidden border border-gray-200">
              <MapContainer
                ref={mapRef}
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} mapRef={mapRef} />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('address.clickMapToSelect')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#232c43] mb-2">
                {t('address.title')} ({t('common.optional')})
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('address.titlePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-[#232c43] bg-white focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#232c43] mb-2">
                {t('address.buildingNumber')} *
              </label>
              <input
                type="text"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={handleInputChange}
                placeholder={t('address.buildingNumberPlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-[#232c43] bg-white focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#232c43] mb-2">
                  {t('address.entranceNumber')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  name="entranceNumber"
                  value={formData.entranceNumber}
                  onChange={handleInputChange}
                  placeholder={t('address.entranceNumberPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-[#232c43] bg-white focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#232c43] mb-2">
                  {t('address.apartmentNumber')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  name="apartmentNumber"
                  value={formData.apartmentNumber}
                  onChange={handleInputChange}
                  placeholder={t('address.apartmentNumberPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-[#232c43] bg-white focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#ff7a00] border-gray-300 rounded focus:ring-[#ff7a00]"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-[#232c43]">
                {t('address.setAsDefault')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-[#232c43] rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#ff7a00] text-white rounded-xl font-semibold hover:bg-[#e66a00] transition-colors disabled:opacity-50"
              >
                {isLoading ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
