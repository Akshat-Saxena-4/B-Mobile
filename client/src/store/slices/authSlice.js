import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService.js';

const getStoredItem = (key) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

const persistAuth = (user, token) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('velora_user', JSON.stringify(user));
  window.localStorage.setItem('velora_token', token);
};

const clearPersistedAuth = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('velora_user');
  window.localStorage.removeItem('velora_token');
};

const storedUser = getStoredItem('velora_user');
const storedToken = getStoredItem('velora_token');

export const loginUser = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    return await authService.login(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to log in'
    );
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to register'
    );
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  try {
    return await authService.getProfile();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to fetch profile'
    );
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, thunkAPI) => {
  try {
    return await authService.updateProfile(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to update profile'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      clearPersistedAuth();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(action.payload.user, action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(action.payload.user, action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        if (state.token) {
          persistAuth(action.payload, state.token);
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        if (state.token) {
          persistAuth(action.payload, state.token);
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;

