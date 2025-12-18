import api from './api';

export const reportsService = {
  async getPayrollSummary(filters = {}) {
    const params = { ...filters };
    const response = await api.get('/reports/payroll-summary', { params });
    return response.data;
  },

  async getDepartmentBreakdown(period) {
    const response = await api.get(`/reports/department-breakdown/${period}`);
    return response.data;
  },

  async getDeductionAnalysis(filters = {}) {
    const params = { ...filters };
    const response = await api.get('/reports/deduction-analysis', { params });
    return response.data;
  },

  async getComplianceStatus(period) {
    const response = await api.get(`/reports/compliance-status/${period}`);
    return response.data;
  },

  async getDashboardMetrics() {
    const response = await api.get('/reports/dashboard-metrics');
    return response.data;
  },

  async exportReport(format, reportType, filters = {}) {
    const params = { ...filters };
    const response = await api.get(`/reports/export/${format}/${reportType}`, {
      params,
      responseType: 'blob' // Important for file downloads
    });
    return response;
  }
};