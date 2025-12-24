import api from './api';

// Update your payrollService.js
export const payrollService = {
  async getAllPayrollRuns(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const params = { ...filters, ...pagination };
      const response = await api.get('/payroll', { params });
      
      // Ensure consistent response structure
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payroll runs',
        data: []
      };
    }
  },

  async processPayroll(payrollData) {
    try {
      // Ensure payload matches backend expectations
      const payload = {
        period: payrollData.period,
        employeeIds: payrollData.employeeIds,
        options: {
          includeStatutory: true,
          adjustments: payrollData.adjustments || {}
        }
      };
      
      const response = await api.post('/payroll/process', payload);
      return response.data;
    } catch (error) {
      console.error('Payroll processing error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process payroll'
      };
    }
  },

  async approvePayroll(payrollId) {
    try {
      const response = await api.post(`/payroll/${payrollId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Payroll approval error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve payroll'
      };
    }
  },
  
  // Add cycle management methods
  async processPayrollWithCycle(payrollData) {
    try {
      const payload = {
        period: payrollData.period,
        employeeIds: payrollData.employeeIds,
        cycleType: payrollData.cycleType || 'monthly',
        options: {
          includeStatutory: true,
          adjustments: payrollData.adjustments || {}
        }
      };
      
      const response = await api.post('/payroll/process', payload);
      return response.data;
    } catch (error) {
      console.error('Payroll processing error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process payroll'
      };
    }
  },

  async generatePayrollPeriods(cycleType = 'monthly', count = 12) {
    try {
      const response = await api.get('/payroll/periods/generate', {
        params: { cycleType, count }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating payroll periods:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate payroll periods',
        data: []
      };
    }
  },

  async getPayrollRunById(id) {
    try {
      const response = await api.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payroll details'
      };
    }
  },

  async getPayrollSummary(period) {
    const response = await api.get(`/payroll/summary/${period}`);
    return response.data;
  },

  async getEmployeePayslip(employeeId, period) {
    const response = await api.get(`/payroll/payslip/${employeeId}/${period}`);
    return response.data;
  },

  // Approval Workflow Methods
  async initiateApprovalWorkflow(payrollRunId, approvers) {
    try {
      const response = await api.post(`/payroll/${payrollRunId}/approval/initiate`, { approvers });
      return response.data;
    } catch (error) {
      console.error('Error initiating approval workflow:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initiate approval workflow'
      };
    }
  },

  async approveWorkflowStep(workflowId, data) {
    try {
      const response = await api.post(`/payroll/approval/${workflowId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving workflow step:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve workflow step'
      };
    }
  },

  async rejectWorkflowStep(workflowId, data) {
    try {
      const response = await api.post(`/payroll/approval/${workflowId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting workflow step:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reject workflow step'
      };
    }
  },

  async getPendingApprovals() {
    try {
      const response = await api.get('/payroll/approval/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pending approvals',
        data: []
      };
    }
  },

  async getWorkflowByPayrollRun(payrollRunId) {
    try {
      const response = await api.get(`/payroll/${payrollRunId}/approval/workflow`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch workflow',
        data: null
      };
    }
  },

  // History methods
  async getPayrollHistory(filters = {}) {
    try {
      const params = { ...filters };
      const response = await api.get('/payroll/history/all', { params });
      
      
      return {
        success: true,
        data: response.data.data || [],
        summary: response.data.summary,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching payroll history:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payroll history',
        data: [],
        summary: {}
      };
    }
  },

  async exportPayrollHistory(period, format = 'csv') {
    try {
      const response = await api.get('/payroll/history/export', {
        params: { period, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Create download link for CSV
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payroll-history-${period || 'all'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error exporting payroll history:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export payroll history'
      };
    }
  },

  // Settings methods
  async getPayrollSettings() {
    try {
      const response = await api.get('/settings/payroll-settings/current');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching payroll settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payroll settings',
        data: null
      };
    }
  },

  async getDefaultPayrollSettings() {
    try {
      const response = await api.get('/settings/payroll-settings/default');
      console.log('defres', response)
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching default payroll settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payroll settings',
        data: null
      };
    }
  },

  async updatePayrollSettings(settings) {
    try {
      const response = await api.put('/settings/payroll-settings/update', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating payroll settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update payroll settings'
      };
    }
  },

  /**
   * Get PAYE tax settings
   */
  async getPAYESettings() {
    try {
      const response = await api.get('/settings/payroll-settings/paye');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching PAYE settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch PAYE settings',
        data: null
      };
    }
  },

  /**
   * Update PAYE tax settings
   */
  async updatePAYESettings(settings) {
    try {
      const response = await api.put('/settings/payroll-settings/paye', settings);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating PAYE settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update PAYE settings',
        data: null
      };
    }
  },

  
  // Method to refresh calculator with latest settings
  async refreshCalculatorWithLatestSettings(calculator) {
    try {
      const response = await this.getPAYESettings();
      if (response.success && response.data) {
        calculator.updateSettings(response.data);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh calculator settings:', error);
    }
    return false;
  },

  /**
   * Get default PAYE settings
   */
  async getDefaultPAYESettings() {
    return {
      taxYear: 2026,
      taxBrackets: [
        { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
        { min: 800000, max: 3000000, rate: 0.15, description: 'Next ₦2,200,000 (15%)' },
        { min: 3000000, max: 12000000, rate: 0.18, description: 'Next ₦9,000,000 (18%)' },
        { min: 12000000, max: 25000000, rate: 0.21, description: 'Next ₦13,000,000 (21%)' },
        { min: 25000000, max: 50000000, rate: 0.23, description: 'Next ₦25,000,000 (23%)' },
        { min: 50000000, max: Infinity, rate: 0.25, description: 'Above ₦50,000,000 (25%)' }
      ],
      statutoryRates: {
        employeePension: 0.08,
        employerPension: 0.10,
        nhf: 0.025,
        nhis: 0.05,
        nsitf: 0.01,
        itf: 0.01
      },
      reliefs: {
        rentRelief: 0.20,
        rentReliefCap: 500000
      }
    };
  }
};