import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
);

// ✅ Add Response Interceptor with Auto-Refresh Token via HttpOnly Cookie
api.interceptors.response.use(
  (response) => {
    // If backend returned standard ApiResponse format { success, code, message, data, timestamp }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'code' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data !== undefined ? response.data.data : response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with Automatic Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth')) {
      originalRequest._retry = true;
      try {
        // Reuse shared refresh promise (Mutex)
        const refreshData = await performRefresh();
        const newAccessToken = refreshData?.accessToken;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearAccessToken();
        if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/login') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Standardize error message extraction from backend ErrorCode / ApiResponse format
    const errorData = error.response?.data;
    if (errorData && typeof errorData === 'object' && errorData.message) {
      error.customMessage = errorData.message;
    }
    return Promise.reject(error);
  }
);

export default api;
