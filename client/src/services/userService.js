import api from './api.js';

const userService = {
  async getWishlist() {
    const response = await api.get('/users/wishlist');
    return response.data.data;
  },
  async toggleWishlist(productId) {
    const response = await api.post(`/users/wishlist/${productId}`);
    return response.data.data;
  },
  async getCart() {
    const response = await api.get('/users/cart');
    return response.data.data;
  },
  async upsertCartItem(payload) {
    const response = await api.post('/users/cart', payload);
    return response.data.data;
  },
  async removeCartItem(productId) {
    const response = await api.delete(`/users/cart/${productId}`);
    return response.data.data;
  },
  async clearCart() {
    const response = await api.delete('/users/cart');
    return response.data.data;
  },
  async getUsers(params = '') {
    const response = await api.get(`/users${params ? `?${params}` : ''}`);
    return response.data.data;
  },
  async toggleUserStatus(userId, isActive) {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data.data;
  },
  async updateSellerApproval(userId, payload) {
    const response = await api.patch(`/users/${userId}/seller-approval`, payload);
    return response.data.data;
  },
};

export default userService;

