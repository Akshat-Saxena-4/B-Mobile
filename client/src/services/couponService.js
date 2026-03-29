import api from './api.js';

const couponService = {
  async getCoupons() {
    const response = await api.get('/coupons');
    return response.data.data;
  },
  async createCoupon(payload) {
    const response = await api.post('/coupons', payload);
    return response.data.data;
  },
  async updateCoupon(couponId, payload) {
    const response = await api.put(`/coupons/${couponId}`, payload);
    return response.data.data;
  },
  async deleteCoupon(couponId) {
    const response = await api.delete(`/coupons/${couponId}`);
    return response.data;
  },
  async validateCoupon(payload) {
    const response = await api.post('/coupons/validate', payload);
    return response.data.data;
  },
};

export default couponService;

