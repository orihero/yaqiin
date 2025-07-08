/// <reference types="vite/client" />
import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore';

const BASE_API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from zustand store if available, else from localStorage
    let token;
    try {
      // This will only work in React context, so fallback to localStorage for now
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
    if (error.response?.status === 401) {
      // Unauthorized, redirect to login or show message
      // window.location.href = '/login'; // Uncomment if you want to force logout
    }
    return Promise.reject(error);
  }
);

export default api; 