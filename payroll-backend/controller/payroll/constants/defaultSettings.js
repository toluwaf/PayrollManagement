/**
 * Default Settings
 * Default payroll and PAYE settings for Nigerian payroll system
 */

const DEFAULT_PAYROLL_SETTINGS = {
  payrollCycle: 'annually',
  approvalWorkflow: {
    enabled: true,
    requiredApprovals: 2,
    approvers: []
  },
  taxSettings: {
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
  },
  paymentSettings: {
    defaultBank: 'bank_1',
    paymentMethods: ['bank_transfer'],
    processingDays: 3,
    autoGeneratePaymentFiles: true
  },
  notificationSettings: {
    onPayrollProcess: true,
    onApprovalRequired: true,
    onPaymentProcessed: true,
    recipients: []
  },
  systemSettings: {
    autoBackup: true,
    backupFrequency: 'weekly',
    dataRetentionMonths: 36
  }
};

const DEFAULT_PAYE_SETTINGS = {
  taxYear: 2026,
  effectiveDate: '2026-01-01',
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

module.exports = {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_PAYE_SETTINGS
};
