// services/dashboardService.js
import api from './api';

export const dashboardService = {
  async getHRStatistics() {
    const response = await api.get('/dashboard/hr-statistics');
    return response.data;
  }
};
