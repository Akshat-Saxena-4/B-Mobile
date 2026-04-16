import axios from 'axios';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const isLocalHostname = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || '');

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (isLocalHostname()) {
    return 'http://localhost:5000/api/v1';
  }

  return '/api/v1';
};

export const apiBaseUrl = resolveApiBaseUrl();
export const isApiBaseUrlConfigured = Boolean(trimTrailingSlash(import.meta.env.VITE_API_URL || ''));

if (!isApiBaseUrlConfigured && typeof window !== 'undefined' && !isLocalHostname()) {
  console.warn(
    'VITE_API_URL is not configured. Netlify deployments should point to the Render backend API.'
  );
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('velora_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
