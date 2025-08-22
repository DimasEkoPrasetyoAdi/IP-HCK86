import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../lib/http';

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchFavourites = createAsyncThunk('favourites/fetchAll', async (_, { rejectWithValue }) => {
  try {
  const { data } = await http.get('/favourite-trips');
    return data.favourites || data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Fetch favourites failed');
  }
});

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {},
  extraReducers: (builder)=>{
    builder
      .addCase(fetchFavourites.pending, (state)=>{ state.loading = true; state.error = null; })
      .addCase(fetchFavourites.fulfilled, (state, action)=>{ state.loading = false; state.list = action.payload; })
      .addCase(fetchFavourites.rejected, (state, action)=>{ state.loading = false; state.error = action.payload; });
  }
});

export default favouritesSlice.reducer;
