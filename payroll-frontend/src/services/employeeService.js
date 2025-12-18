import api from './api';

export const employeeService = {
  // Core Employee Operations
  async getAllEmployees(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Enhanced Profile Methods
  async getEmployeeFullProfile(id) {
    const response = await api.get(`/employees/${id}/full-profile`);
    return response.data;
  },

  // Conflict Resolution Methods
  async updateEmployeeWithConflictResolution(id, data, resolutionStrategy = 'auto') {
    const response = await api.put(`/employees/${id}/secure-update`, { 
      data, 
      resolutionStrategy 
    });
    return response.data;
  },

  // Multi-section Updates
  async updateEmployeeProfileSections(id, sections, transactionId = `tx_${Date.now()}`) {
    const response = await api.put(`/employees/${id}/profile-sections`, {
      sections,
      transactionId
    });
    return response.data;
  },

  // Address Management 
  async getEmployeeAddresses(id) {
    const response = await api.get(`/employees/${id}/addresses`);
    return response.data;
  },

  async addEmployeeAddress(id, addressData) {
    const response = await api.post(`/employees/${id}/addresses`, addressData);
    return response.data;
  },

  async updateEmployeeAddress(id, addressId, updateData) {
    const response = await api.put(`/employees/${id}/addresses/${addressId}`, updateData);
    return response.data;
  },

  async deleteEmployeeAddress(id, addressId) {
    const response = await api.delete(`/employees/${id}/addresses/${addressId}`);
    return response.data;
  },

  // Education Management
  async getEmployeeEducation(id) {
    const response = await api.get(`/employees/${id}/education`);
    return response.data;
  },

  async addEmployeeEducation(id, educationData) {
    const response = await api.post(`/employees/${id}/education`, educationData);
    return response.data;
  },

  async updateEmployeeEducation(id, educationId, updateData) {
    const response = await api.put(`/employees/${id}/education/${educationId}`, updateData);
    return response.data;
  },

  async deleteEmployeeEducation(id, educationId) {
    const response = await api.delete(`/employees/${id}/education/${educationId}`);
    return response.data;
  },

  // Employment History Management
  async getEmployeeEmploymentHistory(id) {
    const response = await api.get(`/employees/${id}/employment-history`);
    return response.data;
  },

  async addEmployeeEmploymentHistory(id, employmentData) {
    const response = await api.post(`/employees/${id}/employment-history`, employmentData);
    return response.data;
  },

  async updateEmployeeEmploymentHistory(id, historyId, updateData) {
    const response = await api.put(`/employees/${id}/employment-history/${historyId}`, updateData);
    return response.data;
  },

  async deleteEmployeeEmploymentHistory(id, historyId) {
    const response = await api.delete(`/employees/${id}/employment-history/${historyId}`);
    return response.data;
  },

  // Document Management
  async getEmployeeDocuments(id) {
    const response = await api.get(`/employees/${id}/documents`);
    return response.data;
  },

  async addEmployeeDocument(id, documentData) {
    const response = await api.post(`/employees/${id}/documents`, documentData);
    return response.data;
  },

  async updateEmployeeDocument(id, documentId, updateData) {
    const response = await api.put(`/employees/${id}/documents/${documentId}`, updateData);
    return response.data;
  },

  async deleteEmployeeDocument(id, documentId) {
    const response = await api.delete(`/employees/${id}/documents/${documentId}`);
    return response.data;
  },

  // Personal Details Management
  async getEmployeePersonalDetails(id) {
    const response = await api.get(`/employees/${id}/personal-details`);
    return response.data;
  },

  async updateEmployeePersonalDetails(id, personalDetailsData) {
    const response = await api.put(`/employees/${id}/personal-details`, personalDetailsData);
    return response.data;
  },


  // Finance Data
  async getEmployeeFinanceData(id) {
    const response = await api.get(`/finance/employee/${id}`);
    return response.data;
  },

  // Contract Management
  async getEmployeeContracts(employeeId) {
    const response = await api.get(`/employees/${employeeId}/contracts`);
    return response.data;
  },

  async addEmployeeContract(employeeId, contractData) {
    const response = await api.post(`/employees/${employeeId}/contracts`, contractData);
    return response.data;
  },

  // JV Allocation Management
  async getEmployeeJVAllocations(employeeId) {
    const response = await api.get(`/employees/${employeeId}/jv-allocations`);
    return response.data;
  },

  // async updateEmployeeJVAllocation(employeeId, allocationData) {
  //   const response = await api.put(`/employees/${employeeId}/jv-allocations`, allocationData);
  //   return response.data;
  // },

  // Payroll Calculations
  async calculateEmployeePayroll(id, payrollData) {
    const response = await api.post(`/employees/${id}/calculate-payroll`, payrollData);
    return response.data;
  },

  async getEmployeePayslip(employeeId, period) {
    const response = await api.get(`/payroll/payslip/${employeeId}/${period}`);
    return response.data;
  },

  // Utility Methods
  async getDepartments() {
    const response = await api.get('/departments');
    return response.data;
  },

  async getJVPartners() {
    const response = await api.get('/jv/partners');
    return response.data;
  },

    // Enhanced profile methods
  async getEmployeeCompleteProfile(id) {
    const response = await api.get(`/employees/${id}/complete-profile`);
    return response.data;
  },

  async getEmployeeJVAllocationsWithRules(id) {
    const response = await api.get(`/employees/${id}/jv-allocations-with-rules`);
    return response.data;
  },

  async getEmployeePayrollSummary(id) {
    const response = await api.get(`/employees/${id}/payroll-summary`);
    return response.data;
  },

  async getEmployeeComplianceData(id, period = null) {
    const params = period ? { period } : {};
    const response = await api.get(`/employees/${id}/compliance-data`, { params });
    return response.data;
  },

  async searchEmployeesAdvanced(filters = {}, pagination = {}) {
    // Combine filters and pagination into one params object
    const params = {
      ...filters,
      page: pagination.page || 1,
      limit: pagination.limit || 50
    };
    
    const response = await api.get('/employees/search/advanced', { params });
    return response.data;
  },

  // JV Allocation Management
  async assignEmployeeToJV(employeeId, allocationData) {
    const response = await api.post(`/employees/${employeeId}/jv-allocations`, allocationData);
    return response.data;
  },

  async updateEmployeeJVAllocation(employeeId, allocationId, updateData) {
    const response = await api.put(`/employees/${employeeId}/jv-allocations/${allocationId}`, updateData);
    return response.data;
  },

  async removeEmployeeJVAllocation(employeeId, allocationId) {
    const response = await api.delete(`/employees/${employeeId}/jv-allocations/${allocationId}`);
    return response.data;
  },

  // Payroll History
  async getEmployeePayrollHistory(id, options = {}) {
    const response = await api.get(`/employees/${id}/payroll-history`, { params: options });
    return response.data;
  },

  // Payment Transactions
  async getEmployeePaymentTransactions(id, options = {}) {
    const response = await api.get(`/employees/${id}/payment-transactions`, { params: options });
    return response.data;
  },

  async createJVAllocation(employeeId, allocationData) {
    const response = await api.post(`/employees/${employeeId}/jv-allocations`, allocationData);
    return response.data;
  }
};