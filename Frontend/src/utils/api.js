import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
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

// ✅ Add Response Interceptor to unwrap standard ApiResponse format
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
  (error) => {
    // Standardize error message extraction from backend ErrorCode / ApiResponse format
    const errorData = error.response?.data;
    if (errorData && typeof errorData === 'object' && errorData.message) {
      error.customMessage = errorData.message;
    }
    return Promise.reject(error);
  }
);

export default api;
