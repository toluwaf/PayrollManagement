/**
 * Overtime Calculator
 * Utilities for calculating overtime pay according to Nigerian labor law
 */

const { OVERTIME_RATES, ANNUAL_WORKING_HOURS } = require('../constants/payrollConstants');

/**
 * Calculate overtime pay based on Nigerian labor law standards
 * @param {number|object} overtime - Overtime hours or object with details
 * @param {number} multiplier - Cycle multiplier
 * @param {number} employeeSalary - Employee's annual salary
 * @returns {number} Total overtime pay
 */
function calculateOvertime(overtime, multiplier, employeeSalary = 0) {
  if (!overtime || overtime === 0) {
    return 0;
  }

  // If overtime is a simple number (hours)
  if (typeof overtime === 'number') {
    // Calculate based on Nigerian standard: 1.5x for weekdays
    const standardRate = OVERTIME_RATES.WEEKDAY;
    const hours = overtime;
    
    // Calculate hourly rate from annual salary
    const hourlyRate = employeeSalary / ANNUAL_WORKING_HOURS;
    return hours * hourlyRate * standardRate * multiplier;
  }

  // If overtime is an object with detailed breakdown
  if (typeof overtime === 'object') {
    const {
      weekdayHours = 0,
      weekendHours = 0,
      publicHolidayHours = 0,
      hourlyRate: customHourlyRate,
      rateMultipliers = {
        weekday: OVERTIME_RATES.WEEKDAY,
        weekend: OVERTIME_RATES.WEEKEND,
        holiday: OVERTIME_RATES.HOLIDAY
      }
    } = overtime;

    // Use custom hourly rate if provided, otherwise calculate from salary
    let hourlyRate = customHourlyRate;
    if (!hourlyRate && employeeSalary) {
      hourlyRate = employeeSalary / ANNUAL_WORKING_HOURS;
    } else if (!hourlyRate) {
      // Fallback to minimum wage hourly rate (Nigerian context)
      const monthlyMinimumWage = 30000; // ₦30,000 monthly minimum wage
      hourlyRate = (monthlyMinimumWage * 12) / ANNUAL_WORKING_HOURS;
    }

    // Calculate total overtime pay
    const weekdayOvertime = weekdayHours * hourlyRate * rateMultipliers.weekday;
    const weekendOvertime = weekendHours * hourlyRate * rateMultipliers.weekend;
    const holidayOvertime = publicHolidayHours * hourlyRate * rateMultipliers.holiday;

    const totalOvertime = weekdayOvertime + weekendOvertime + holidayOvertime;
    
    return totalOvertime * multiplier;
  }

  return 0;
}

/**
 * Get detailed overtime breakdown for payslip
 * @param {number|object} overtime - Overtime hours or object
 * @param {number} multiplier - Cycle multiplier
 * @param {number} employeeSalary - Employee's annual salary
 * @returns {object|null} Overtime breakdown or null
 */
function getOvertimeBreakdown(overtime, multiplier, employeeSalary = 0) {
  if (!overtime || overtime === 0) return null;
  
  const hourlyRate = employeeSalary / ANNUAL_WORKING_HOURS;
  
  if (typeof overtime === 'number') {
    return {
      hours: overtime,
      rate: hourlyRate,
      multiplier: OVERTIME_RATES.WEEKDAY,
      amount: calculateOvertime(overtime, multiplier, employeeSalary)
    };
  }
  
  if (typeof overtime === 'object') {
    const customHourlyRate = overtime.hourlyRate || hourlyRate;
    const rateMultipliers = overtime.rateMultipliers || {
      weekday: OVERTIME_RATES.WEEKDAY,
      weekend: OVERTIME_RATES.WEEKEND,
      holiday: OVERTIME_RATES.HOLIDAY
    };
    
    return {
      weekday: {
        hours: overtime.weekdayHours || 0,
        rate: customHourlyRate,
        multiplier: rateMultipliers.weekday,
        amount: (overtime.weekdayHours || 0) * customHourlyRate * rateMultipliers.weekday * multiplier
      },
      weekend: {
        hours: overtime.weekendHours || 0,
        rate: customHourlyRate,
        multiplier: rateMultipliers.weekend,
        amount: (overtime.weekendHours || 0) * customHourlyRate * rateMultipliers.weekend * multiplier
      },
      holiday: {
        hours: overtime.publicHolidayHours || 0,
        rate: customHourlyRate,
        multiplier: rateMultipliers.holiday,
        amount: (overtime.publicHolidayHours || 0) * customHourlyRate * rateMultipliers.holiday * multiplier
      }
    };
  }
  
  return null;
}

module.exports = {
  calculateOvertime,
  getOvertimeBreakdown
};
