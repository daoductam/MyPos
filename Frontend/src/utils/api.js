import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add Request Interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
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
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        // Call refresh API (HttpOnly Cookie automatically sent)
        const refreshResponse = await axios.post(
          'http://localhost:5000/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('jwt', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('jwt');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
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
