/**
 * Date Helpers
 * Utilities for date and period calculations
 */

/**
 * Get week number in year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get day of year
 * @param {Date} date - Date object
 * @returns {number} Day of year
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Generate payroll periods based on cycle type
 * @param {string} cycleType - Type of payroll cycle
 * @param {number} count - Number of periods to generate
 * @returns {Array} Array of period objects
 */
function generatePeriods(cycleType, count) {
  const periods = [];
  const currentDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(currentDate);
    
    switch (cycleType) {
      case 'monthly':
        date.setMonth(date.getMonth() - i);
        const monthlyPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthlyDisplay = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        periods.push({ value: monthlyPeriod, display: monthlyPeriod, label: monthlyDisplay });
        break;
        
      case 'weekly':
        date.setDate(date.getDate() - (i * 7));
        const weekNumber = getWeekNumber(date);
        const weeklyPeriod = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weeklyDisplay = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
        periods.push({ value: weeklyPeriod, display: weeklyPeriod, label: weeklyDisplay });
        break;
        
      case 'bi-weekly':
        date.setDate(date.getDate() - (i * 14));
        const biWeekNumber = Math.ceil(getDayOfYear(date) / 14);
        const biWeeklyPeriod = `${date.getFullYear()}-BW${String(biWeekNumber).padStart(2, '0')}`;
        const biWeekStart = new Date(date);
        biWeekStart.setDate(date.getDate() - date.getDay());
        const biWeekEnd = new Date(biWeekStart);
        biWeekEnd.setDate(biWeekStart.getDate() + 13);
        const biWeeklyDisplay = `${biWeekStart.toLocaleDateString()} - ${biWeekEnd.toLocaleDateString()}`;
        periods.push({ value: biWeeklyPeriod, display: biWeeklyPeriod, label: biWeeklyDisplay });
        break;
    }
  }
  
  return periods;
}

module.exports = {
  getWeekNumber,
  getDayOfYear,
  generatePeriods
};
