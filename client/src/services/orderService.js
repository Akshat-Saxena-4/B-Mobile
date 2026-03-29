import api from './api.js';

const orderService = {
  async createOrder(payload) {
    const response = await api.post('/orders', payload);
    return response.data.data;
  },
  async getMyOrders() {
    const response = await api.get('/orders/mine');
    return response.data.data;
  },
  async getSellerOrders() {
    const response = await api.get('/orders/seller');
    return response.data.data;
  },
  async getAllOrders() {
    const response = await api.get('/orders/admin/all');
    return response.data.data;
  },
  async updateOrderStatus(orderId, payload) {
    const response = await api.patch(`/orders/${orderId}/status`, payload);
    return response.data.data;
  },
  async cancelOrder(orderId, payload = {}) {
    const response = await api.patch(`/orders/${orderId}/cancel`, payload);
    return response.data.data;
  },
  async trackOrder(orderId) {
    const response = await api.get(`/orders/${orderId}/track`);
    return response.data.data;
  },
};

export default orderService;

