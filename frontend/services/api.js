import axios from 'axios';

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return '/api';
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return '/api';
    }

    if (origin.includes('vercel.app')) {
      console.warn('VITE_API_URL is not configured for production. If the backend is hosted separately, set VITE_API_URL to the backend URL in Vercel.');
    }

    return `${origin.replace(/\/$/, '')}/api`;
  }

  return '/api';
};

const API_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const isValidUser = (value) => !!value && typeof value === 'object' && !Array.isArray(value) && (value._id || value.id);
export const normalizeAddressList = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.addresses)) return value.addresses;
  return [];
};

export default api;
