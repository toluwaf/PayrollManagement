// frontend/src/services/bankService.js
import api from './api';

export const bankService = {
  // Bank Management
  async getAllBanks(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/bank-disbursement/banks', { params });
    return response.data;
  },

  async getBankById(id) {
    const response = await api.get(`/bank-disbursement/banks/${id}`);
    return response.data;
  },

  // Payment Batches
  async getPaymentBatches(filters = {}, pagination = { page: 1, limit: 50 }) {
    const params = { ...filters, ...pagination };
    const response = await api.get('/bank-disbursement/payment-batches', { params });
    return response.data;
  },

  async createPaymentBatch(batchData) {
    const response = await api.post('/bank-disbursement/payment-batches', batchData);
    return response.data;
  },

  async getPaymentBatchById(batchId) {
    const response = await api.get(`/bank-disbursement/payment-batches/${batchId}`);
    return response.data;
  },

  async generatePaymentFile(batchId, format = 'nibss') {
    const response = await api.post(`/bank-disbursement/payment-batches/${batchId}/generate-file`, { format });
    return response.data;
  },

  async simulateBankUpload(batchId) {
    const response = await api.post(`/bank-disbursement/payment-batches/${batchId}/upload`);
    return response.data;
  },

  // Payment Transactions
  async getPaymentTransactions(batchId, filters = {}) {
    const params = { ...filters };
    const response = await api.get(`/bank-disbursement/payment-batches/${batchId}/transactions`, { params });
    return response.data;
  },

  async updatePaymentTransaction(transactionId, updateData) {
    const response = await api.put(`/bank-disbursement/payment-transactions/${transactionId}`, updateData);
    return response.data;
  },

  // Statistics & Reports
  async getPaymentStatistics(period) {
    const response = await api.get(`/bank-disbursement/payment-statistics/${period}`);
    return response.data;
  },

  async getBankDisbursementReport(period, bankId = null) {
    const params = bankId ? { bankId } : {};
    const response = await api.get(`/bank-disbursement/reports/${period}`, { params });
    return response.data;
  },

  // Utility Methods
  async getSupportedFileFormats() {
    // This would typically come from the backend, but we'll define it here for now
    return {
      nibss: { name: 'NIBSS', extension: '.txt', description: 'Nigeria Inter-Bank Settlement System' },
      aba: { name: 'ABA', extension: '.aba', description: 'Australian Bankers Association format' },
      csv: { name: 'CSV', extension: '.csv', description: 'Comma Separated Values' },
      xml: { name: 'XML', extension: '.xml', description: 'Extended Markup Language' }
    };
  },

  async validateBankAccount(accountNumber, bankCode) {
    const response = await api.post('/bank-disbursement/validate-account', {
      accountNumber,
      bankCode
    });
    return response.data;
  },

  // Batch Operations
  async retryFailedPayments(batchId) {
    const response = await api.post(`/bank-disbursement/payment-batches/${batchId}/retry-failed`);
    return response.data;
  },

  async cancelPaymentBatch(batchId) {
    const response = await api.put(`/bank-disbursement/payment-batches/${batchId}/cancel`);
    return response.data;
  }
};