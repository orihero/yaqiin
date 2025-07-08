import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// You can set this to your actual API base URL or use an environment variable
const BASE_API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or sessionStorage if you prefer)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Do not handle navigation or throw errors here
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    // Handle global errors (e.g., auth, network)
    if (error.response?.status === 401) {
      // Unauthorized, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 