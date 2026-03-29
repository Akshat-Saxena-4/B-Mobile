import api from './api.js';

const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return response.data.data;
  },
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data.data;
  },
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  async updateProfile(payload) {
    const response = await api.put('/auth/me', payload);
    return response.data.data;
  },
};

export default authService;

