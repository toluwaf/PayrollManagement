// src/utils/validationHelper.js
export const validatePayrollSettings = (settings) => {
  const errors = [];

  // Validate payroll cycle
  const validCycles = ['monthly', 'weekly', 'bi-weekly', 'ad-hoc'];
  if (!validCycles.includes(settings.payrollCycle)) {
    errors.push('Invalid payroll cycle');
  }

  // Validate tax settings if they exist
  if (settings.taxSettings) {
    // Validate tax brackets
    if (!Array.isArray(settings.taxSettings.taxBrackets)) {
      errors.push('Tax brackets must be an array');
    } else if (settings.taxSettings.taxBrackets.length === 0) {
      errors.push('At least one tax bracket is required');
    } else {
      // Validate each bracket
      settings.taxSettings.taxBrackets.forEach((bracket, index) => {
        if (typeof bracket.min !== 'number' || bracket.min < 0) {
          errors.push(`Bracket ${index + 1}: Minimum amount must be a positive number`);
        }
        if (typeof bracket.max !== 'number' || (bracket.max !== Infinity && bracket.max < 0)) {
          errors.push(`Bracket ${index + 1}: Maximum amount must be a positive number or Infinity`);
        }
        if (typeof bracket.rate !== 'number' || bracket.rate < 0 || bracket.rate > 1) {
          errors.push(`Bracket ${index + 1}: Rate must be between 0 and 1 (0% to 100%)`);
        }
        if (bracket.min > bracket.max && bracket.max !== Infinity) {
          errors.push(`Bracket ${index + 1}: Minimum cannot be greater than maximum`);
        }
      });

      // Check bracket continuity
      let previousMax = -1;
      settings.taxSettings.taxBrackets.forEach((bracket, index) => {
        if (index === 0 && bracket.min !== 0) {
          errors.push('First tax bracket must start from 0');
        } else if (index > 0 && bracket.min !== previousMax + 1) {
          errors.push(`Bracket ${index + 1}: Must start from ${previousMax + 1} for continuity`);
        }
        previousMax = bracket.max;
      });

      // Last bracket must go to Infinity
      const lastBracket = settings.taxSettings.taxBrackets[settings.taxSettings.taxBrackets.length - 1];
      if (lastBracket.max !== Infinity) {
        errors.push('Last tax bracket must extend to Infinity');
      }
    }

    // Validate statutory rates
    if (settings.taxSettings.statutoryRates) {
      const rates = settings.taxSettings.statutoryRates;
      
      if (rates.employeePension < 0 || rates.employeePension > 0.2) {
        errors.push('Employee pension rate must be between 0% and 20%');
      }
      if (rates.employerPension < 0 || rates.employerPension > 0.2) {
        errors.push('Employer pension rate must be between 0% and 20%');
      }
      if (rates.nhf < 0 || rates.nhf > 0.1) {
        errors.push('NHF rate must be between 0% and 10%');
      }
    }

    // Validate reliefs
    if (settings.taxSettings.reliefs) {
      const reliefs = settings.taxSettings.reliefs;
      
      if (reliefs.rentRelief < 0 || reliefs.rentRelief > 1) {
        errors.push('Rent relief rate must be between 0% and 100%');
      }
      if (reliefs.rentReliefCap < 0) {
        errors.push('Rent relief cap must be a positive amount');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePAYESettings = (payeSettings) => {
  const errors = [];

  if (!payeSettings) {
    errors.push('PAYE settings object is required');
    return { isValid: false, errors };
  }

  // Validate tax year
  const currentYear = new Date().getFullYear();
  if (payeSettings.taxYear < currentYear - 1 || payeSettings.taxYear > currentYear + 1) {
    errors.push(`Tax year must be between ${currentYear - 1} and ${currentYear + 1}`);
  }

  // Validate tax brackets
  if (!Array.isArray(payeSettings.taxBrackets)) {
    errors.push('Tax brackets must be an array');
  } else if (payeSettings.taxBrackets.length < 2) {
    errors.push('At least 2 tax brackets are required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};