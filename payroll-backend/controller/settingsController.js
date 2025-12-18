const ResponseHelper = require('../helpers/responseHelper');
const payrollQueries = require('../queries/payrollQueries');
const { DEFAULT_PAYROLL_SETTINGS, DEFAULT_PAYE_SETTINGS } = require('./payroll/constants/defaultSettings');

class SettingsController {
  async getSalaryBands(req, res) {
    const { ctx: { db } } = req;
    try {
      // Get salary bands from settings collection, or return defaults
      const query = `
        LET settings = FIRST(
          FOR s IN settings
          FILTER s.type == 'salary_bands'
          RETURN s
        )
        
        RETURN settings != null ? settings.bands : {
          entry: 500000,
          junior: 800000,
          mid: 1000000,
          senior: 1200000,
          lead: 1500000,
          principal: 2000000,
          executive: 3000000
        }
      `;

      const salaryBands = await db.QueryFirst(query);
      ResponseHelper.success(res, salaryBands, 'Salary bands retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch salary bands', 500, error.message);
    }
  }

  async updateSalaryBands(req, res) {
    const { ctx: { db } } = req;
    try {
      const salaryBands = req.body;

      // Validate salary bands structure
      const requiredBands = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive'];
      const missingBands = requiredBands.filter(band => !(band in salaryBands));
      
      if (missingBands.length > 0) {
        return ResponseHelper.error(res, `Missing salary bands: ${missingBands.join(', ')}`, 400);
      }

      // Validate salary values
      for (const [band, salary] of Object.entries(salaryBands)) {
        if (typeof salary !== 'number' || salary < 100000 || salary > 10000000) {
          return ResponseHelper.error(res, `Invalid salary value for ${band} band`, 400);
        }
      }

      // Ensure logical progression of salaries
      const bandsOrder = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive'];
      for (let i = 1; i < bandsOrder.length; i++) {
        if (salaryBands[bandsOrder[i]] <= salaryBands[bandsOrder[i - 1]]) {
          return ResponseHelper.error(res, `${bandsOrder[i]} band salary must be greater than ${bandsOrder[i - 1]} band`, 400);
        }
      }

      // Upsert salary bands in settings collection
      const upsertQuery = `
        UPSERT { type: 'salary_bands' }
        INSERT { 
          type: 'salary_bands',
          bands: @salaryBands,
          updatedBy: @userId,
          updatedAt: @now
        }
        UPDATE { 
          bands: @salaryBands,
          updatedBy: @userId,
          updatedAt: @now
        }
        IN settings
        RETURN NEW
      `;

      const result = await db.QueryFirst(upsertQuery, {
        salaryBands,
        userId: req.user?.id || 'system',
        now: new Date().toISOString()
      });

      ResponseHelper.success(res, result.bands, 'Salary bands updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update salary bands', 500, error.message);
    }
  }

  async getHRSettings(req, res) {
    const { ctx: { db } } = req;
    try {
      const query = `
        FOR s IN settings
        FILTER s.type IN ['leave_policy', 'probation_settings', 'hr_policies']
        RETURN {
          type: s.type,
          data: s.data
        }
      `;

      const settings = await db.QueryAll(query);
      
      // Transform to object format
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.type] = setting.data;
        return acc;
      }, {});

      // Set defaults if not found
      const defaultSettings = {
        leave_policy: {
          annualLeave: 21,
          sickLeave: 10,
          maternityLeave: 84, // 12 weeks in days
          paternityLeave: 10,
          carryOverLimit: 5
        },
        probation_settings: {
          duration: 3, // months
          noticePeriod: 1, // months
          extensionLimit: 3 // months
        },
        hr_policies: {
          workingHours: 8,
          overtimeRate: 1.5,
          retirementAge: 65
        }
      };

      const mergedSettings = { ...defaultSettings, ...settingsObj };
      ResponseHelper.success(res, mergedSettings, 'HR settings retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch HR settings', 500, error.message);
    }
  }

  async updateHRSettings(req, res) {
    const { ctx: { db } } = req;
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        return ResponseHelper.error(res, 'Type and data are required', 400);
      }

      const validTypes = ['leave_policy', 'probation_settings', 'hr_policies'];
      if (!validTypes.includes(type)) {
        return ResponseHelper.error(res, 'Invalid settings type', 400);
      }

      const upsertQuery = `
        UPSERT { type: @type }
        INSERT { 
          type: @type,
          data: @data,
          updatedBy: @userId,
          updatedAt: @now
        }
        UPDATE { 
          data: @data,
          updatedBy: @userId,
          updatedAt: @now
        }
        IN settings
        RETURN NEW
      `;

      const result = await db.QueryFirst(upsertQuery, {
        type,
        data,
        userId: req.user?.id || 'system',
        now: new Date().toISOString()
      });

      ResponseHelper.success(res, result.data, `${type.replace('_', ' ')} updated successfully`);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update HR settings', 500, error.message);
    }
  }


  // === PAYROLL SETTINGS   
  getPayrollSettings = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const settings = await payrollQueries.getPayrollSettings(db);
      
      // If no settings exist, return default settings
      if (!settings) {
        const defaultSettings = this.getDefaultPayrollSettings();
        ResponseHelper.success(res, defaultSettings, 'Default payroll settings retrieved');
        return;
      }

      ResponseHelper.success(res, settings, 'Payroll settings retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll settings', 500, error.message);
    }
  }

  updatePayrollSettings = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      
      const settings = req.body;
      // console.log(settings)

      // Validate settings
      const validation = this.validatePayrollSettings(settings);
      if (!validation.isValid) {
        return ResponseHelper.error(res, 'Invalid settings', 400, validation.errors);
      }
      
      // Add timestamp and user info
      settings.updatedAt = new Date().toISOString();
      settings.updatedBy = req.user?.id || 'system';
      

      // Update or create settings
      const updatedSettings = await payrollQueries.upsertPayrollSettings(settings, db);
      
      ResponseHelper.success(res, updatedSettings, 'Payroll settings updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update payroll settings', 500, error.message);
    }
  }

  // Helper methods for settings
  getDefaultPayrollSettings = () => {
    return ResponseHelper.success(null, DEFAULT_PAYROLL_SETTINGS, 'Default payroll settings generated');
  }

  validatePayrollSettings = (settings) => {
    const errors = [];
    
    // Validate payroll cycle
    const validCycles = ['monthly', 'weekly', 'bi-weekly', 'ad-hoc'];
    if (!validCycles.includes(settings.payrollCycle)) {
      errors.push('Invalid payroll cycle. Must be one of: monthly, weekly, bi-weekly, ad-hoc');
    }
    
    // Validate tax settings structure
    if (settings.taxSettings) {
      // Validate tax brackets
      if (!Array.isArray(settings.taxSettings.taxBrackets) || settings.taxSettings.taxBrackets.length === 0) {
        errors.push('Tax brackets must be a non-empty array');
      } else {
        let previousMax = -1;
        
        settings.taxSettings.taxBrackets.forEach((bracket, index) => {
          const maxValue = bracket.max === null ? Infinity : bracket.max;
          
          // Validate bracket structure
          if (typeof bracket.min !== 'number' || bracket.min < 0) {
            errors.push(`Tax bracket ${index + 1}: min must be a non-negative number`);
          }
          
          if (maxValue !== Infinity && (typeof maxValue !== 'number' || maxValue < 0)) {
            errors.push(`Bracket ${index + 1}: Maximum must be a positive number or Infinity`);
          }      

          // if (typeof bracket.max !== 'number' || (bracket.max !== Infinity && bracket.max < 0)) {
          //   errors.push(`Tax bracket ${index + 1}: max must be a positive number or Infinity`);
          // }
          
          if (typeof bracket.rate !== 'number' || bracket.rate < 0 || bracket.rate > 1) {
            errors.push(`Tax bracket ${index + 1}: rate must be between 0 and 1 (0% to 100%)`);
          }
          
          // Validate bracket order and continuity
          if (index === 0) {
            // First bracket must start from 0
            if (bracket.min !== 0) {
              errors.push('First tax bracket must start from 0');
            }
          } else {
            // Subsequent brackets must start from previous max + 1
            if (bracket.min !== previousMax + 1) {
              errors.push(`Tax bracket ${index + 1}: min (${bracket.min}) should be ${previousMax + 1} to maintain continuity`);
            }
          }
          
          // Validate min <= max
          if (bracket.min > maxValue && maxValue !== Infinity) {
            errors.push(`Tax bracket ${index + 1}: min (${bracket.min}) cannot be greater than max (${bracket.max})`);
          }
          
          previousMax = maxValue;
        });
        
        // Check if last bracket goes to infinity
        const lastBracket = settings.taxSettings.taxBrackets[settings.taxSettings.taxBrackets.length - 1];
        const lastMax = lastBracket.max === null ? Infinity : lastBracket.max;

        if (lastMax !== Infinity) {
          errors.push('Last tax bracket must extend to Infinity');
        }
        
        // Check for overlapping brackets
        for (let i = 1; i < settings.taxSettings.taxBrackets.length; i++) {
          const current = settings.taxSettings.taxBrackets[i];
          const previous = settings.taxSettings.taxBrackets[i - 1];
          
          if (current.min <= previous.max) {
            errors.push(`Tax brackets ${i} and ${i + 1} are overlapping`);
          }
        }
      }
      
      // Validate statutory rates
      if (settings.taxSettings.statutoryRates) {
        const rates = settings.taxSettings.statutoryRates;
        
        if (typeof rates.employeePension !== 'number' || rates.employeePension < 0 || rates.employeePension > 0.2) {
          errors.push('Employee pension rate must be between 0% and 20%');
        }
        
        if (typeof rates.employerPension !== 'number' || rates.employerPension < 0 || rates.employerPension > 0.2) {
          errors.push('Employer pension rate must be between 0% and 20%');
        }
        
        if (typeof rates.nhf !== 'number' || rates.nhf < 0 || rates.nhf > 0.1) {
          errors.push('NHF rate must be between 0% and 10%');
        }
        
        if (typeof rates.nhis !== 'number' || rates.nhis < 0 || rates.nhis > 0.1) {
          errors.push('NHIS rate must be between 0% and 10%');
        }
        
        if (typeof rates.nsitf !== 'number' || rates.nsitf < 0 || rates.nsitf > 0.05) {
          errors.push('NSITF rate must be between 0% and 5%');
        }
        
        if (typeof rates.itf !== 'number' || rates.itf < 0 || rates.itf > 0.05) {
          errors.push('ITF rate must be between 0% and 5%');
        }
      }
      
      // Validate reliefs
      if (settings.taxSettings.reliefs) {
        const reliefs = settings.taxSettings.reliefs;
        
        if (typeof reliefs.rentRelief !== 'number' || reliefs.rentRelief < 0 || reliefs.rentRelief > 1) {
          errors.push('Rent relief rate must be between 0% and 100%');
        }
        
        if (typeof reliefs.rentReliefCap !== 'number' || reliefs.rentReliefCap < 0) {
          errors.push('Rent relief cap must be a non-negative amount');
        }
      }
      
      // Validate tax year
      if (settings.taxSettings.taxYear) {
        const currentYear = new Date().getFullYear();
        if (settings.taxSettings.taxYear < currentYear - 1 || settings.taxSettings.taxYear > currentYear + 1) {
          errors.push(`Tax year should be between ${currentYear - 1} and ${currentYear + 1}`);
        }
      }
    }
    
    // Validate approval workflow
    if (settings.approvalWorkflow) {
      if (typeof settings.approvalWorkflow.enabled !== 'boolean') {
        errors.push('Approval workflow enabled must be a boolean');
      }
      
      if (settings.approvalWorkflow.enabled) {
        if (typeof settings.approvalWorkflow.requiredApprovals !== 'number' || 
            settings.approvalWorkflow.requiredApprovals < 1 || 
            settings.approvalWorkflow.requiredApprovals > 5) {
          errors.push('Required approvals must be between 1 and 5');
        }
        
        if (!Array.isArray(settings.approvalWorkflow.approvers)) {
          errors.push('Approvers must be an array');
        }
      }
    }
    
    // Validate payment settings
    if (settings.paymentSettings) {
      const payment = settings.paymentSettings;
      
      if (typeof payment.processingDays !== 'number' || payment.processingDays < 1 || payment.processingDays > 14) {
        errors.push('Processing days must be between 1 and 14');
      }
      
      if (typeof payment.autoGeneratePaymentFiles !== 'boolean') {
        errors.push('Auto generate payment files must be a boolean');
      }
      
      if (!Array.isArray(payment.paymentMethods) || payment.paymentMethods.length === 0) {
        errors.push('Payment methods must be a non-empty array');
      }
      
      const validPaymentMethods = ['bank_transfer', 'cash', 'cheque', 'mobile_money'];
      payment.paymentMethods.forEach(method => {
        if (!validPaymentMethods.includes(method)) {
          errors.push(`Invalid payment method: ${method}. Must be one of: ${validPaymentMethods.join(', ')}`);
        }
      });
    }
    
    // Validate notification settings
    if (settings.notificationSettings) {
      const notification = settings.notificationSettings;
      
      if (typeof notification.onPayrollProcess !== 'boolean') {
        errors.push('On payroll process notification must be a boolean');
      }
      
      if (typeof notification.onApprovalRequired !== 'boolean') {
        errors.push('On approval required notification must be a boolean');
      }
      
      if (typeof notification.onPaymentProcessed !== 'boolean') {
        errors.push('On payment processed notification must be a boolean');
      }
      
      if (!Array.isArray(notification.recipients)) {
        errors.push('Notification recipients must be an array');
      }
    }
    
    // Validate system settings
    if (settings.systemSettings) {
      const system = settings.systemSettings;
      
      if (typeof system.autoBackup !== 'boolean') {
        errors.push('Auto backup must be a boolean');
      }
      
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      if (!validFrequencies.includes(system.backupFrequency)) {
        errors.push(`Invalid backup frequency. Must be one of: ${validFrequencies.join(', ')}`);
      }
      
      if (typeof system.dataRetentionMonths !== 'number' || 
          system.dataRetentionMonths < 12 || 
          system.dataRetentionMonths > 120) {
        errors.push('Data retention months must be between 12 and 120');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }


  /**
   * Get PAYE tax settings
   */
  getPAYESettings = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const settings = await payrollQueries.getPAYESettings(db);
      
      // Return default settings if none exist
      if (!settings) {
        const defaultSettings = this.getDefaultPAYESettings();
        return ResponseHelper.success(res, defaultSettings, 'Default PAYE settings retrieved');
      }

      ResponseHelper.success(res, settings, 'PAYE settings retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch PAYE settings', 500, error.message);
    }
  }

  /**
   * Update PAYE tax settings
   */
  updatePAYESettings = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const settings = req.body;
      
      // // Validate settings structure
      // const validation = this.validatePAYESettings(settings);
      // if (!validation.isValid) {
      //   return ResponseHelper.error(res, 'Invalid PAYE settings', 400, validation.errors);
      // }

      const updatedSettings = await payrollQueries.upsertPAYESettings(settings, db);
      
      ResponseHelper.success(res, updatedSettings, 'PAYE settings updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update PAYE settings', 500, error.message);
    }
  }

  /**
   * Get default PAYE settings for NTA 2025
   */
  getDefaultPAYESettings = () => {
    return ResponseHelper.success(null, DEFAULT_PAYE_SETTINGS, 'Default PAYE settings generated');
  }

  /**
   * Validate PAYE settings structure
   */
  validatePAYESettings = (settings) => {
    const errors = [];
    
    // Validate tax brackets (same as above)
    if (!Array.isArray(settings.taxBrackets) || settings.taxBrackets.length === 0) {
      errors.push('Tax brackets must be a non-empty array');
    } else {
      let previousMax = -1;
      
      settings.taxBrackets.forEach((bracket, index) => {
        const maxValue = bracket.max === null ? Infinity : bracket.max;

        if (typeof bracket.min !== 'number' || bracket.min < 0) {
          errors.push(`Tax bracket ${index + 1}: min must be a non-negative number`);
        }
      
        if (maxValue !== Infinity && (typeof maxValue !== 'number' || maxValue < 0)) {
          errors.push(`Bracket ${index + 1}: Maximum must be a positive number or Infinity`);
        }

        // if (typeof bracket.max !== 'number' || (bracket.max !== Infinity && bracket.max < 0)) {
        //   errors.push(`Tax bracket ${index + 1}: max must be a positive number or Infinity`);
        // }
        
        if (typeof bracket.rate !== 'number' || bracket.rate < 0 || bracket.rate > 1) {
          errors.push(`Tax bracket ${index + 1}: rate must be between 0 and 1 (0% to 100%)`);
        }
        
        if (index === 0 && bracket.min !== 0) {
          errors.push('First tax bracket must start from 0');
        } else if (index > 0 && bracket.min !== previousMax + 1) {
          errors.push(`Tax bracket ${index + 1}: min (${bracket.min}) should be ${previousMax + 1}`);
        }
        
        if (bracket.min > maxValue && maxValue !== Infinity) {
          errors.push(`Tax bracket ${index + 1}: min cannot be greater than max`);
        }
        
        previousMax = maxValue;
      });
      
      const lastBracket = settings.taxBrackets[settings.taxBrackets.length - 1];
      const lastMax = lastBracket.max === null ? Infinity : lastBracket.max;

      if (lastMax !== Infinity && lastBracket.max !== null) {
        errors.push('Last tax bracket must extend to Infinity');
      }
    }
    
    // Validate statutory rates
    if (settings.statutoryRates) {
      const rates = settings.statutoryRates;
      
      if (typeof rates.employeePension !== 'number' || rates.employeePension < 0 || rates.employeePension > 0.2) {
        errors.push('Employee pension rate must be between 0% and 20%');
      }
      
      if (typeof rates.employerPension !== 'number' || rates.employerPension < 0 || rates.employerPension > 0.2) {
        errors.push('Employer pension rate must be between 0% and 20%');
      }
      
      if (typeof rates.nhf !== 'number' || rates.nhf < 0 || rates.nhf > 0.1) {
        errors.push('NHF rate must be between 0% and 10%');
      }
    }
    
    // Validate reliefs
    if (settings.reliefs) {
      const reliefs = settings.reliefs;
      
      if (typeof reliefs.rentRelief !== 'number' || reliefs.rentRelief < 0 || reliefs.rentRelief > 1) {
        errors.push('Rent relief rate must be between 0% and 100%');
      }
      
      if (typeof reliefs.rentReliefCap !== 'number' || reliefs.rentReliefCap < 0) {
        errors.push('Rent relief cap must be a non-negative amount');
      }
    }
    
    // Validate tax year
    if (settings.taxYear) {
      const currentYear = new Date().getFullYear();
      if (settings.taxYear < currentYear - 1 || settings.taxYear > currentYear + 1) {
        errors.push(`Tax year should be between ${currentYear - 1} and ${currentYear + 1}`);
      }
    }
  
    if (errors.length > 0) {
      return ResponseHelper.validationError(null, errors, 'PAYE settings validation failed');
    }
    
    return ResponseHelper.success(null, { isValid: true }, 'PAYE settings validation passed');
  }
 
}

module.exports = new SettingsController();