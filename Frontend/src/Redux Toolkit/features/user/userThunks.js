import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// 🔹 Get user profile from Access Token
export const getUserProfile = createAsyncThunk('user/getProfile', async (token, { rejectWithValue }) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await api.get('/api/v1/users/profile', config);
    
    console.log('Get user profile success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get user profile error:', err);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const getAuthorizationProfile = createAsyncThunk('user/getAuthorizationProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/authorization/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch authorization profile');
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async ({ fullName, phone }, { rejectWithValue }) => {
  try {
    const res = await api.put('/api/v1/users/profile', { fullName, phone });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.customMessage || err.response?.data?.message || 'Failed to update profile');
  }
});

export const changePassword = createAsyncThunk('user/changePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    await api.patch('/api/v1/users/profile/password', { currentPassword, newPassword });
    return true;
  } catch (err) {
    return rejectWithValue(err.customMessage || err.response?.data?.message || 'Failed to change password');
  }
});

// 🔹 Get all customers
export const getCustomers = createAsyncThunk('user/getCustomers', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/users/customer', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Get customers success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get customers error:', err);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
  }
});

// 🔹 Get all cashiers
export const getCashiers = createAsyncThunk('user/getCashiers', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/users/cashier', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Get cashiers success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get cashiers error:', err);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cashiers');
  }
});

// 🔹 Get all users
export const getAllUsers = createAsyncThunk('user/getAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/users/list');
    console.log('Get all users success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get all users error:', err);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

// 🔹 Get user by ID
export const getUserById = createAsyncThunk('user/getById', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/v1/users/${userId}`);
    console.log('Get user by ID success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get user by ID error:', err);
    return rejectWithValue(err.response?.data?.message || 'User not found');
  }
});

// 🔹 Logout user
export const logout = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/api/v1/auth/logout', {});
    localStorage.removeItem('jwt');
    // Optionally, clear other relevant local storage items or session data
    console.log('User logged out successfully');
    return 'Logged out successfully';
  } catch (err) {
    console.error('Logout error:', err);
    localStorage.removeItem('jwt');
    return rejectWithValue(err.message || 'Failed to logout');
  }
});
