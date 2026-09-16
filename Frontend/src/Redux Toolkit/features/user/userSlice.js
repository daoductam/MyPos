import { createSlice } from '@reduxjs/toolkit';
import {
  getUserProfile,
  getAuthorizationProfile,
  getCustomers,
  getCashiers,
  getAllUsers,
  getUserById,
  logout
} from './userThunks';

const initialState = {
  userProfile: null,
  authorizationProfile: null,
  authorizationLoading: false,
  users: [],
  customers: [],
  cashiers: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.userProfile = null;
      state.authorizationProfile = null;
      state.selectedUser = null;
      state.users = [];
      state.customers = [];
      state.cashiers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => { state.loading = true; })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAuthorizationProfile.pending, (state) => {
        state.authorizationLoading = true;
      })
      .addCase(getAuthorizationProfile.fulfilled, (state, action) => {
        state.authorizationLoading = false;
        state.authorizationProfile = action.payload;
      })
      .addCase(getAuthorizationProfile.rejected, (state, action) => {
        state.authorizationLoading = false;
        state.authorizationProfile = null;
        state.error = action.payload;
      })

      .addCase(getCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })

      .addCase(getCashiers.fulfilled, (state, action) => {
        state.cashiers = action.payload;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userProfile = null;
        state.authorizationProfile = null;
        state.selectedUser = null;
        state.error = null;
      })

      .addMatcher(
        (action) => action.type.startsWith('user/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
