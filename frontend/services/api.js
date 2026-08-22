import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '');

const api = axios.create({
  baseURL: API_URL || '/api',
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
