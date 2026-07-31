import axios from 'axios';

// Prefer Vite proxy in browser; fall back to direct API if env is set
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Clear bad tokens quietly — do NOT force-redirect guests to login
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      const url = error.config?.url || '';
      const isLogin = url.includes('/auth/login');
      if (!isLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

export const mediaUrl = (path) => {
  if (!path) return PLACEHOLDER_IMG;
  if (typeof path !== 'string') return PLACEHOLDER_IMG;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Local uploads served by API
  if (path.startsWith('/uploads')) {
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${path}`;
  }
  if (path.startsWith('uploads/')) {
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}/${path}`;
  }
  return path;
};

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n || 0);

/** Retry once on network / proxy blips (e.g. server restarting) */
export const postWithRetry = async (url, data, retries = 1) => {
  try {
    return await api.post(url, data);
  } catch (err) {
    const networkFail = !err.response;
    if (retries > 0 && networkFail) {
      await new Promise((r) => setTimeout(r, 800));
      return postWithRetry(url, data, retries - 1);
    }
    throw err;
  }
};

export default api;
