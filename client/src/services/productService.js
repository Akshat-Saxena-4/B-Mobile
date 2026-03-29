import api from './api.js';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

const productService = {
  async getProducts(filters = {}) {
    const query = buildQueryString(filters);
    const response = await api.get(`/products${query ? `?${query}` : ''}`);
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
  async getFeaturedProducts() {
    const response = await api.get('/products/featured');
    return response.data.data;
  },
  async getProductDetails(identifier) {
    const response = await api.get(`/products/${identifier}`);
    return response.data.data;
  },
  async getSellerProducts(sellerId) {
    const response = await api.get(
      `/products/seller/my-products${sellerId ? `?sellerId=${sellerId}` : ''}`
    );
    return response.data.data;
  },
  async getAdminProducts(filters = {}) {
    const query = buildQueryString(filters);
    const response = await api.get(`/products/admin/all${query ? `?${query}` : ''}`);
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
  async createProduct(payload) {
    const response = await api.post('/products', payload);
    return response.data.data;
  },
  async updateProduct(productId, payload) {
    const response = await api.put(`/products/${productId}`, payload);
    return response.data.data;
  },
  async deleteProduct(productId) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },
  async createReview(productId, payload) {
    const response = await api.post(`/products/${productId}/reviews`, payload);
    return response.data.data;
  },
};

export default productService;

