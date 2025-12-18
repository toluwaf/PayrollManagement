import api from './api';

export const settingsService = {
  async getSalaryBands() {
    const response = await api.get('/settings/salary-bands');
    return response.data;
  },

  async updateSalaryBands(salaryBands) {
    const response = await api.put('/settings/salary-bands', salaryBands);
    return response.data;
  }
};