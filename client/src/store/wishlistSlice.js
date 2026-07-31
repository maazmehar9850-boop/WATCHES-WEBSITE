import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/wishlist');
    return res.data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/users/wishlist/${productId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist || [];
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
