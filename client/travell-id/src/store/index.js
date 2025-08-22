import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tripsReducer from './slices/tripsSlice';
import favouritesReducer from './slices/favouritesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripsReducer,
    favourites: favouritesReducer,
  },
});

export default store;
