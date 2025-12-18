import api from './api';

export const positionService = {
  async getAllPositions() {
    const response = await api.get('/positions');
    return response.data;
  },

  async createPosition(positionData) {
    const response = await api.post('/positions', positionData);
    return response.data;
  },

  async updatePosition(id, positionData) {
    const response = await api.put(`/positions/${id}`, positionData);
    return response.data;
  },

  async deletePosition(id) {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  },

  async getDepartments() {
    const response = await api.get('/departments');
    return response.data;
  }
};