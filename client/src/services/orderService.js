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

const orderService = {
  async createOrder(payload) {
    const response = await api.post('/orders', payload);
    return response.data.data;
  },
  async getMyOrders() {
    const response = await api.get('/orders/mine');
    return response.data.data;
  },
  async getSellerOrders(filters = {}) {
    const query = buildQueryString(filters);
    const response = await api.get(`/orders/seller${query ? `?${query}` : ''}`);
    return response.data.data;
  },
  async getAllOrders(filters = {}) {
    const query = buildQueryString(filters);
    const response = await api.get(`/orders/admin/all${query ? `?${query}` : ''}`);
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
