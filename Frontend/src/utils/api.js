import axios from 'axios';

const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL,
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
        }
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('jwt');
        if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login';
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
