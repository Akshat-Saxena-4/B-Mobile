import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import userService from '../../services/userService.js';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  try {
    return await userService.getCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to fetch cart'
    );
  }
});

export const fetchWishlist = createAsyncThunk('cart/fetchWishlist', async (_, thunkAPI) => {
  try {
    return await userService.getWishlist();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to fetch wishlist'
    );
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (payload, thunkAPI) => {
  try {
    return await userService.upsertCartItem(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to update cart'
    );
  }
});

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (productId, thunkAPI) => {
    try {
      return await userService.removeCartItem(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Unable to remove cart item'
      );
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    return await userService.clearCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to clear cart'
    );
  }
});

export const toggleWishlist = createAsyncThunk(
  'cart/toggleWishlist',
  async (productId, thunkAPI) => {
    try {
      return await userService.toggleWishlist(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Unable to update wishlist'
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    wishlist: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  },
});

export default cartSlice.reducer;

