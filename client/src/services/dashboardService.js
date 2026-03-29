import api from './api.js';

const dashboardService = {
  async getShopkeeperDashboard() {
    const response = await api.get('/dashboard/shopkeeper');
    return response.data.data;
  },
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  },
};

export default dashboardService;

