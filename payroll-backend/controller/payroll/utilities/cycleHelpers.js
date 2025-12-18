/**
 * Cycle Helpers
 * Utilities for managing payroll cycles and periods
 */

const { CYCLE_MULTIPLIERS, PAYROLL_CYCLES } = require('../constants/payrollConstants');

/**
 * Get cycle multiplier for salary calculations
 * @param {string} cycleType - Type of payroll cycle
 * @returns {number} Multiplier for cycle
 */
function getCycleMultiplier(cycleType) {
  const validCycleTypes = Object.keys(CYCLE_MULTIPLIERS);
  
  // Normalize input
  const normalizedCycleType = cycleType?.toLowerCase().trim();
  
  if (!validCycleTypes.includes(normalizedCycleType)) {
    console.error(`Invalid cycleType: ${cycleType}. Valid options: ${validCycleTypes.join(', ')}`);
    throw new Error(`Invalid pay cycle: ${cycleType}`);
  }
  
  return CYCLE_MULTIPLIERS[normalizedCycleType];
}

/**
 * Get cycle configuration
 * @param {string} cycleType - Type of payroll cycle
 * @param {object} settings - Optional payroll settings
 * @returns {object} Cycle configuration
 */
function getCycleConfiguration(cycleType, settings = {}) {
  const baseConfig = {
    monthly: { multiplier: 1, description: 'Monthly' },
    weekly: { multiplier: 0.25, description: 'Weekly' },
    'bi-weekly': { multiplier: 0.5, description: 'Bi-weekly' },
    'ad-hoc': { multiplier: 1, description: 'Ad-hoc' }
  };

  return baseConfig[cycleType] || baseConfig.monthly;
}

/**
 * Adjust employee salary components for cycle type
 * @param {object} employee - Employee data
 * @param {object} cycleConfig - Cycle configuration
 * @returns {object} Adjusted employee data
 */
function adjustEmployeeForCycle(employee, cycleConfig) {
  if (cycleConfig.multiplier === 1) {
    return employee; // No adjustment needed for monthly
  }

  return {
    ...employee,
    salary: employee.salary * cycleConfig.multiplier,
    basicSalary: (employee.basicSalary || employee.salary) * cycleConfig.multiplier,
    housingAllowance: (employee.housingAllowance || 0) * cycleConfig.multiplier,
    transportAllowance: (employee.transportAllowance || 0) * cycleConfig.multiplier,
    otherAllowances: (employee.otherAllowances || 0) * cycleConfig.multiplier
  };
}

/**
 * Validate payroll period format based on cycle type
 * @param {string} period - Period string
 * @param {string} cycleType - Type of payroll cycle
 * @returns {object} Validation result with isValid and message
 */
function validatePayrollPeriod(period, cycleType) {
  switch (cycleType) {
    case PAYROLL_CYCLES.MONTHLY:
      if (!/^\d{4}-\d{2}$/.test(period)) {
        return { isValid: false, message: 'Invalid monthly period format. Use YYYY-MM' };
      }
      break;
    case PAYROLL_CYCLES.WEEKLY:
      if (!/^\d{4}-W\d{2}$/.test(period)) {
        return { isValid: false, message: 'Invalid weekly period format. Use YYYY-Www' };
      }
      break;
    case PAYROLL_CYCLES.BI_WEEKLY:
      if (!/^\d{4}-BW\d{2}$/.test(period)) {
        return { isValid: false, message: 'Invalid bi-weekly period format. Use YYYY-BWbb' };
      }
      break;
    case PAYROLL_CYCLES.AD_HOC:
      // Ad-hoc periods can be any format
      break;
    default:
      return { isValid: false, message: 'Invalid cycle type' };
  }
  return { isValid: true };
}

module.exports = {
  getCycleMultiplier,
  getCycleConfiguration,
  adjustEmployeeForCycle,
  validatePayrollPeriod
};
