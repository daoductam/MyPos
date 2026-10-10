import axios from 'axios';

const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL,
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const publicAuthPaths = new Set([
  '/api/v1/auth/login', '/api/v1/auth/signup', '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password',
]);
const unwrap = (data) => data && typeof data === 'object'
  && 'success' in data && 'code' in data && 'data' in data ? data.data : data;
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (publicAuthPaths.has(config.url)) {
    delete config.headers.Authorization;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
// In-Memory Token Storage (Protected in module closure, immune to XSS)
let memoryAccessToken = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

export const clearAccessToken = () => {
  memoryAccessToken = null;
};

// Mutex / In-flight Promise for Refresh Token to prevent duplicate simultaneous refresh requests
let refreshPromise = null;

export const performRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        let resData = response.data;
        if (resData && typeof resData === 'object' && 'data' in resData) {
          resData = resData.data;
        }
        const newAccessToken = resData?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
        }
        return resData;
      })
      .catch((err) => {
        clearAccessToken();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ✅ Add Request Interceptor to attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const isPublicAuthEndpoint =
      config.url?.includes('/api/v1/auth/login') ||
      config.url?.includes('/api/v1/auth/signup') ||
      config.url?.includes('/api/v1/auth/forgot-password') ||
      config.url?.includes('/api/v1/auth/reset-password');

    if (token && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrap(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry
      && !originalRequest.url?.startsWith('/api/v1/auth/')) {
      originalRequest._retry = true;
      try {
        // One rotation for concurrent failing requests; never reuse the old cookie.
        if (!refreshPromise) {
          refreshPromise = axios.post(`${baseURL}/api/v1/auth/refresh`, {}, { withCredentials: true })
            .then((response) => {
              const token = unwrap(response.data)?.accessToken;
              if (!token) throw new Error('Refresh response is missing an access token');
              localStorage.setItem('jwt', token);
              return token;
            }).finally(() => { refreshPromise = null; });
        // Reuse shared refresh promise (Mutex)
        const refreshData = await performRefresh();
        const newAccessToken = refreshData?.accessToken;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('jwt');
        if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login';
        clearAccessToken();
        if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/login') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    const errorData = error.response?.data;
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('authorization:denied', { detail: errorData }));
    }
    if (errorData?.message) error.customMessage = errorData.message;
    return Promise.reject(error);
  }
);

export default api;
