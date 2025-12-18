/**
 * Payroll Constants
 * Central location for all payroll-related constants
 */

const PAYROLL_CYCLES = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi-weekly',
  SEMI_MONTHLY: 'semi-monthly',
  ANNUALLY: 'annually',
  AD_HOC: 'ad-hoc'
};

const ADJUSTMENT_TYPES = [
  'bonus',
  'overtime',
  'loan',
  'advance',
  'penalty',
  'allowance',
  'deduction',
  'commission'
];

const PAYMENT_METHODS = [
  'bank_transfer',
  'cash',
  'cheque',
  'mobile_money'
];

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress'
};

const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PROCESSED: 'processed',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

const CYCLE_MULTIPLIERS = {
  'annually': 1,
  'monthly': 1/12,
  'weekly': 1/52,
  'bi-weekly': 1/26,
  'semi-monthly': 1/24
};

const OVERTIME_RATES = {
  WEEKDAY: 1.5,
  WEEKEND: 2.0,
  HOLIDAY: 2.5
};

const LOAN_DEDUCTION_TYPES = {
  FIXED: 'fixed',
  PERCENTAGE: 'percentage',
  AMORTIZING: 'amortizing',
  INTEREST_ONLY: 'interest_only'
};

// Nigerian labor law: Maximum loan deduction as percentage of net salary
const MAX_LOAN_DEDUCTION_PERCENTAGE = 0.33;

// Working hours per year (standard)
const ANNUAL_WORKING_HOURS = 2080;

// Backup frequencies
const BACKUP_FREQUENCIES = ['daily', 'weekly', 'monthly'];

// Validation limits
const VALIDATION_LIMITS = {
  MIN_REQUIRED_APPROVALS: 1,
  MAX_REQUIRED_APPROVALS: 5,
  MIN_PROCESSING_DAYS: 1,
  MAX_PROCESSING_DAYS: 14,
  MIN_DATA_RETENTION_MONTHS: 12,
  MAX_DATA_RETENTION_MONTHS: 120
};

module.exports = {
  PAYROLL_CYCLES,
  ADJUSTMENT_TYPES,
  PAYMENT_METHODS,
  APPROVAL_STATUS,
  PAYROLL_STATUS,
  CYCLE_MULTIPLIERS,
  OVERTIME_RATES,
  LOAN_DEDUCTION_TYPES,
  MAX_LOAN_DEDUCTION_PERCENTAGE,
  ANNUAL_WORKING_HOURS,
  BACKUP_FREQUENCIES,
  VALIDATION_LIMITS
};
