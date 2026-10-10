import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAccessToken, performRefresh } from "../../../utils/api";

// ✅ Signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/signup", userData);
      const token = res.data.accessToken || res.data.jwt;
      if (token) {
        setAccessToken(token);
      }
      console.log("Signup success:", res.data);
      return res.data;
    } catch (err) {
      console.error("Signup error:", err);
      return rejectWithValue(err.response?.data?.message || err.customMessage || "Signup failed");
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    console.log("Credentials:", credentials);
    try {
      const res = await api.post("/api/v1/auth/login", credentials);
      const data = res.data;
      console.log("Login success:", data);
      const token = data.accessToken || data.jwt || data.token;
      if (token) {
        setAccessToken(token);
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      return rejectWithValue(err.response?.data?.message || err.customMessage || "Login failed");
    }
  }
);

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/forgot-password", { email });
      console.log("Forgot password success:", res.data);
      return res.data;
    } catch (err) {
      console.error("Forgot password error:", err);
      return rejectWithValue(err.response?.data?.message || err.customMessage || "Failed to send reset email");
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/v1/auth/reset-password", { token, password });
      console.log("Reset password success:", res.data);
      return res.data;
    } catch (err) {
      console.error("Reset password error:", err);
      return rejectWithValue(err.response?.data?.message || err.customMessage || "Failed to reset password");
    }
  }
);

// ✅ Refresh Access Token (Silent Refresh via HttpOnly Cookie with Mutex)
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const data = await performRefresh();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.customMessage || "Session expired");
    }
  }
);