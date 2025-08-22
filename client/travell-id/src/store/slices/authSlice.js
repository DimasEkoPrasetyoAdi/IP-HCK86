import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../lib/http';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  bootstrapDone: false,
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return { user: null };
    const { data } = await http.get('/me');
    return { user: data.user };
  } catch (e) {
    localStorage.removeItem('access_token');
    return rejectWithValue(e.response?.data?.error || 'Bootstrap failed');
  }
});

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await http.post('/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    const me = await http.get('/me');
    return { user: me.data.user };
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Login failed');
  }
});

export const googleLoginThunk = createAsyncThunk('auth/googleLogin', async (id_token, { rejectWithValue }) => {
  try {
    const { data } = await http.post('/google-login', { id_token });
    localStorage.setItem('access_token', data.access_token);
    const me = await http.get('/me');
    return { user: me.data.user };
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Google login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('access_token');
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.loading = false; state.bootstrapDone = true;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.loading = false; state.bootstrapDone = true; state.error = action.payload || 'Failed';
        state.user = null; state.isAuthenticated = false;
      })
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || 'Login failed';
      })
      .addCase(googleLoginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.isAuthenticated = true;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || 'Google login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
