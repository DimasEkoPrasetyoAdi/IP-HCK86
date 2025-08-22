import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../lib/http';

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk('trips/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await http.get('/trips');
    return data.trips || data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Fetch trips failed');
  }
});

export const fetchTripById = createAsyncThunk('trips/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await http.get(`/trips/${id}`);
    return data.trip || data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Fetch trip failed');
  }
});

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
  clearCurrent(state){ state.current = null; },
  removeById(state, action){ state.list = state.list.filter(t=>t.id !== action.payload); }
  },
  extraReducers: (builder)=>{
    builder
      .addCase(fetchTrips.pending, (state)=>{ state.loading = true; state.error = null; })
      .addCase(fetchTrips.fulfilled, (state, action)=>{ state.loading = false; state.list = action.payload; })
      .addCase(fetchTrips.rejected, (state, action)=>{ state.loading = false; state.error = action.payload; })
      .addCase(fetchTripById.pending, (state)=>{ state.loading = true; state.error = null; })
      .addCase(fetchTripById.fulfilled, (state, action)=>{ state.loading = false; state.current = action.payload; })
      .addCase(fetchTripById.rejected, (state, action)=>{ state.loading = false; state.error = action.payload; });
  }
});

export const { clearCurrent, removeById } = tripsSlice.actions;
export default tripsSlice.reducer;
