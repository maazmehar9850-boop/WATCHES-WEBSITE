import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
  },
});

export default store;
