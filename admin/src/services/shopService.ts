import api from './api';
import { Shop } from '@yaqiin/shared/types/shop';

export const getShops = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/shops?${params.toString()}`);
  return res.data;
};

export const createShop = async (input: any) => {
  const { photoFile, logoFile, ...rest } = input;
  let data: any;
  
  // Check if we have actual files to upload (not null/undefined)
  if (photoFile || logoFile) {
    const form = new FormData();
    
    // Add all non-file fields
    Object.keys(rest).forEach(key => {
      if (typeof rest[key] === 'object') {
        form.append(key, JSON.stringify(rest[key]));
      } else {
        form.append(key, rest[key]);
      }
    });
    
    // Add files if they exist
    if (photoFile) {
      form.append('photo', photoFile);
    }
    if (logoFile) {
      form.append('logo', logoFile);
    }
    
    data = form;
  } else {
    data = rest;
  }
  
  const res = await api.post('/shops', data, {
    headers: data instanceof FormData ? {} : undefined,
  });
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to create shop');
  return res.data.data;
};

export const updateShop = async (input: any) => {
  const { _id, photoFile, logoFile, removePhoto, removeLogo, ...rest } = input;
  let data: any;
  
  console.log('Shop update service - Input:', input);
  console.log('Shop update service - Fields to update:', Object.keys(rest));
  
  // Check if we have actual files to upload or remove flags (not null/undefined)
  if (photoFile || logoFile || removePhoto || removeLogo) {
    const form = new FormData();
    
    // Add all non-file fields
    Object.keys(rest).forEach(key => {
      if (typeof rest[key] === 'object') {
        form.append(key, JSON.stringify(rest[key]));
      } else {
        form.append(key, rest[key]);
      }
    });
    
    // Add files if they exist
    if (photoFile) {
      form.append('photo', photoFile);
    }
    if (logoFile) {
      form.append('logo', logoFile);
    }
    
    // Add remove flags if they exist
    if (removePhoto) {
      form.append('removePhoto', 'true');
    }
    if (removeLogo) {
      form.append('removeLogo', 'true');
    }
    
    data = form;
    console.log('Using FormData for shop update');
    console.log('FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}:`, value);
    }
  } else {
    data = rest;
    console.log('Using JSON for shop update:', data);
  }
  
  try {
    const res = await api.put(`/shops/${_id}`, data, {
      headers: data instanceof FormData ? {} : undefined,
    });
    if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to update shop');
    return res.data.data;
  } catch (error: any) {
    console.error('Shop update failed:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const deleteShop = async (_id: string) => {
  const res = await api.delete(`/shops/${_id}`);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete shop');
  return res.data.data;
};

export const getAllShops = async (): Promise<Shop[]> => {
  const res = await api.get('/shops');
  return res.data.data;
};

export const getShop = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}`);
  return res.data;
};

export const getShopCouriers = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}/couriers`);
  return res.data;
};

export const getShopAvailableCouriers = async (shopId: string) => {
  const res = await api.get(`/shops/${shopId}/available-couriers`);
  return res.data;
};

export const assignCourierToShop = async (shopId: string, courierId: string) => {
  const res = await api.post(`/shops/${shopId}/couriers/${courierId}`);
  return res.data;
};

export const unassignCourierFromShop = async (shopId: string, courierId: string) => {
  const res = await api.delete(`/shops/${shopId}/couriers/${courierId}`);
  return res.data;
};

export const getUnassignedGroups = async () => {
  const res = await api.get('/shops/groups/unassigned');
  return res.data.data;
}; 