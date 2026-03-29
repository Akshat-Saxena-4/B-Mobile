import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import productService from '../../services/productService.js';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (filters, thunkAPI) => {
  try {
    return await productService.getProducts(filters);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Unable to fetch products'
    );
  }
});

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, thunkAPI) => {
    try {
      return await productService.getFeaturedProducts();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Unable to fetch featured products'
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (identifier, thunkAPI) => {
    try {
      return await productService.getProductDetails(identifier);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Unable to fetch product details'
      );
    }
  }
);

export const createReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, payload }, thunkAPI) => {
    try {
      await productService.createReview(productId, payload);
      return await productService.getProductDetails(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Unable to submit review'
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    currentProduct: null,
    meta: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
    },
    filters: {
      page: 1,
      limit: 12,
      sort: 'featured',
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setProductFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct, setProductFilters } = productSlice.actions;
export default productSlice.reducer;

