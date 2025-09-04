import api from './api';
import type { Address } from '@yaqiin/shared/types/user';

export interface CreateAddressData {
  title?: string;
  buildingNumber: string;
  entranceNumber?: string;
  apartmentNumber?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

export interface UpdateAddressData extends CreateAddressData {
  _id: string;
}

export async function addAddress(addressData: CreateAddressData): Promise<Address> {
  const res = await api.post('/users/me/addresses', addressData);
  return res.data.data;
}

export async function updateAddress(addressData: UpdateAddressData): Promise<Address> {
  const res = await api.put(`/users/me/addresses/${addressData._id}`, addressData);
  return res.data.data;
}

export async function deleteAddress(addressId: string): Promise<void> {
  await api.delete(`/users/me/addresses/${addressId}`);
}

export async function setDefaultAddress(addressId: string): Promise<Address> {
  const res = await api.patch(`/users/me/addresses/${addressId}/default`);
  return res.data.data;
}
