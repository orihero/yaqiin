/// <reference types="vite/client" />
import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore';
import type { Shop } from '@yaqiin/shared/types/shop';

// Get the API URL from environment or use a default
const getApiUrl = () => {
  // If we have a specific API URL from environment, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to relative path for production
  return '/api';
};

const BASE_API_URL = getApiUrl();

console.log('API Base URL:', BASE_API_URL);

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only send JWT from localStorage
    let token;
    try {
      token = localStorage.getItem('token');
    } catch {}
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Unauthorized, redirect to login or show message
      // window.location.href = '/login'; // Uncomment if you want to force logout
    }
    
    // Handle network errors (like mixed content)
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - possible mixed content issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// shopService.ts
export const getShopById = async (id: string): Promise<Shop> => {
  const res = await api.get(`/shops/${id}`);
  return res.data.data;
};

export const getShopByOwnerId = async (ownerId: string): Promise<Shop | null> => {
  const res = await api.get(`/shops?ownerId=${ownerId}`);
  return res.data.data?.[0] || null;
}; 