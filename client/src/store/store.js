import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import productReducer from './slices/productSlice.js';
import cartReducer from './slices/cartSlice.js';
import experienceReducer from './slices/experienceSlice.js';
import { saveExperienceState } from '../utils/experienceStorage.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    experience: experienceReducer,
  },
});

store.subscribe(() => {
  saveExperienceState(store.getState().experience);
});

export default store;
