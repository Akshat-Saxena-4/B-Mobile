import { createSlice } from '@reduxjs/toolkit';
import { COMPARE_LIMIT } from '../../utils/constants.js';
import { loadExperienceState } from '../../utils/experienceStorage.js';

const clampNumber = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

const slimProduct = (product = {}) => ({
  _id: product._id,
  slug: product.slug || '',
  title: product.title || 'Untitled product',
  shortDescription: product.shortDescription || '',
  brand: product.brand || '',
  category: product.category || '',
  subcategory: product.subcategory || '',
  price: clampNumber(product.price),
  compareAtPrice: clampNumber(product.compareAtPrice),
  thumbnail: product.thumbnail || product.images?.[0] || '',
  images: Array.isArray(product.images) ? product.images.slice(0, 4) : [],
  ratings: {
    average: clampNumber(product.ratings?.average),
    count: clampNumber(product.ratings?.count),
  },
  specifications: Array.isArray(product.specifications) ? product.specifications : [],
  inventory: {
    stock: clampNumber(product.inventory?.stock),
    sku: product.inventory?.sku || '',
  },
  tags: Array.isArray(product.tags) ? product.tags : [],
});

const hydrate = loadExperienceState();

const experienceSlice = createSlice({
  name: 'experience',
  initialState: {
    compare: hydrate.compare || [],
    recentlyViewed: hydrate.recentlyViewed || [],
  },
  reducers: {
    toggleCompareItem(state, action) {
      const product = slimProduct(action.payload);
      const exists = state.compare.some((item) => item._id === product._id);

      if (exists) {
        state.compare = state.compare.filter((item) => item._id !== product._id);
        return;
      }

      state.compare = [product, ...state.compare].slice(0, COMPARE_LIMIT);
    },
    removeCompareItem(state, action) {
      state.compare = state.compare.filter((item) => item._id !== action.payload);
    },
    clearCompare(state) {
      state.compare = [];
    },
    addRecentlyViewed(state, action) {
      const product = slimProduct(action.payload);
      state.recentlyViewed = [product, ...state.recentlyViewed.filter((item) => item._id !== product._id)].slice(0, 8);
    },
    clearRecentlyViewed(state) {
      state.recentlyViewed = [];
    },
  },
});

export const {
  toggleCompareItem,
  removeCompareItem,
  clearCompare,
  addRecentlyViewed,
  clearRecentlyViewed,
} = experienceSlice.actions;

export default experienceSlice.reducer;
