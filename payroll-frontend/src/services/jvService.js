// frontend/src/services/jvService.js
import api from './api';

export const jvService = {
  // JV Partners
  async getPartners(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/jv/partners', { params });
    return response.data;
  },

  async getPartnerById(id) {
    const response = await api.get(`/jv/partners/${id}`);
    return response.data;
  },

  // JV Agreements
  async getAgreements(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/jv/agreements', { params });
    return response.data;
  },

  async getAgreementById(id) {
    const response = await api.get(`/jv/agreements/${id}`);
    return response.data;
  },

  // Allocation Rules
  async getAllocationRules(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/jv/allocation-rules', { params });
    return response.data;
  },

  // Allocation Calculations
  async calculateAllocations(payrollRunId) {
    const response = await api.post('/jv/allocations/calculate', { payrollRunId });
    return response.data;
  },

  async getAllocationResults(payrollRunId) {
    const response = await api.get(`/jv/allocations/results/${payrollRunId}`);
    return response.data;
  },

  // Reports & Statistics
  async getAllocationReport(period, filters = {}) {
    const params = { ...filters };
    const response = await api.get(`/jv/reports/${period}`, { params });
    return response.data;
  },

  async getAllocationStatistics(period) {
    const response = await api.get(`/jv/statistics/${period}`);
    return response.data;
  },

  // Validation
  async validateAllocationRules(agreementId) {
    const response = await api.get(`/jv/validate-rules/${agreementId}`);
    return response.data;
  }
};

export default jvService;