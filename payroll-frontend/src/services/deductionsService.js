// src/services/deductionsService.js
import api from './api';

export const deductionsService = {
  async getAllDeductions(filters = {}, pagination = { page: 1, limit: 50 }) {
    try {
      const params = { ...filters, ...pagination };
      const response = await api.get('/deductions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching deductions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch deductions',
        data: []
      };
    }
  },

  async calculateDeductions(deductionData) {
    try {
      const response = await api.post('/deductions/calculate', deductionData);
      return response.data;
    } catch (error) {
      console.error('Error calculating deductions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to calculate deductions'
      };
    }
  },

  async remitDeductions(id, remittanceData) {
    try {
      const response = await api.post(`/deductions/${id}/remit`, remittanceData);
      return response.data;
    } catch (error) {
      console.error('Error remitting deductions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remit deductions'
      };
    }
  },

  async getDeductionSummary(period) {
    try {
      const response = await api.get(`/deductions/summary/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deduction summary:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch deduction summary'
      };
    }
  },

  async generateComplianceReport(period, reportType) {
    try {
      const response = await api.get(`/deductions/compliance/${period}/${reportType}`);
      return response.data;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate compliance report'
      };
    }
  },

  async exportDeductions(period, format = 'pdf') {
    try {
      const response = await api.get(`/deductions/export/${period}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting deductions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export deductions'
      };
    }
  }
};