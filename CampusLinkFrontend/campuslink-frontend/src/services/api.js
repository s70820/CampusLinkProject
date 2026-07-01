import axios from 'axios';
import { apiBaseUrl, appPath } from '../config/appConfig';

const API_URL = apiBaseUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (never attach stale JWT to sign-in/register calls)
api.interceptors.request.use((config) => {
  if (!isAuthAttemptRequest(config)) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

const isAuthAttemptRequest = (config) => {
  const url = config?.url || '';
  return url.includes('/api/login')
    || url.includes('/api/auth/login')
    || url.includes('/api/register')
    || url.includes('/api/auth/forgot-password')
    || url.includes('/api/auth/reset-password');
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthAttemptRequest(error.config)) {
      localStorage.removeItem('authToken');
      window.location.href = appPath('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
