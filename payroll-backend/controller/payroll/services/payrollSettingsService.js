/**
 * Settings Service
 * Unified settings manager for payroll cycle, approval workflow, and PAYE settings
 * Eliminates duplicate functionality and provides a single source of truth for all settings
 */

const { DEFAULT_PAYROLL_SETTINGS, DEFAULT_PAYE_SETTINGS } = require('../constants/defaultSettings');
const payrollQueries = require('../../../queries/payrollQueries');
/**
 * Get all settings (unified payroll + PAYE)
 * This combines payroll settings and PAYE settings into one cohesive object
 * 
 * @param {object} db - Database connection
 * @returns {Promise<object>} Unified settings object
 */
async function getSettings(db) {
  
  
  try {
    // Try to get unified settings first
    const settings = await payrollQueries.getPayrollSettings(db);
    
    if (!settings) {
      // Return default settings if none exist
      return getDefaultSettings();
    }
    
    // Ensure PAYE settings are included in the response
    // If taxSettings exists in payroll settings, use it as PAYE settings
    return {
      ...settings,
      paye: settings.taxSettings || DEFAULT_PAYE_SETTINGS,
      // Keep taxSettings for backward compatibility
      taxSettings: settings.taxSettings || DEFAULT_PAYE_SETTINGS
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

/**
 * Update settings (unified approach)
 * Handles both payroll cycle/workflow settings and PAYE tax settings in one operation
 * 
 * @param {object} updates - Settings updates
 * @param {object} db - Database connection
 * @param {string} userId - User making the update
 * @returns {Promise<object>} Updated settings
 */
async function updateSettings(updates, db, userId = 'system') {
  const payrollQueries = require('../queries/payrollQueries');
  const validationService = require('./validationService');
  
  try {
    // Get current settings
    const currentSettings = await getSettings(db);
    
    // Merge updates with current settings
    const mergedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };
    
    // Handle PAYE updates if present
    if (updates.paye) {
      mergedSettings.taxSettings = {
        ...currentSettings.taxSettings,
        ...updates.paye
      };
      // Also update the paye property for consistency
      mergedSettings.paye = mergedSettings.taxSettings;
    }
    
    // Handle taxSettings updates (for backward compatibility)
    if (updates.taxSettings) {
      mergedSettings.taxSettings = {
        ...currentSettings.taxSettings,
        ...updates.taxSettings
      };
      mergedSettings.paye = mergedSettings.taxSettings;
    }
    
    // Validate the merged settings
    const validation = validationService.validateSettings(mergedSettings);
    if (!validation.isValid) {
      throw new Error(`Settings validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Upsert settings
    const updatedSettings = await payrollQueries.upsertPayrollSettings(mergedSettings, db);
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Update specific section of settings
 * Allows updating only payroll cycle, approval workflow, or PAYE settings
 * 
 * @param {string} section - Section to update ('cycle', 'approval', 'paye', 'payment', 'notification', 'system')
 * @param {object} updates - Section-specific updates
 * @param {object} db - Database connection
 * @param {string} userId - User making the update
 * @returns {Promise<object>} Updated settings
 */
async function updateSettingsSection(section, updates, db, userId = 'system') {
  const sectionMap = {
    'cycle': 'payrollCycle',
    'approval': 'approvalWorkflow',
    'paye': 'taxSettings',
    'tax': 'taxSettings',
    'payment': 'paymentSettings',
    'notification': 'notificationSettings',
    'system': 'systemSettings'
  };
  
  const settingsKey = sectionMap[section];
  if (!settingsKey) {
    throw new Error(`Invalid settings section: ${section}`);
  }
  
  // Build update object
  const updateObject = {
    [settingsKey]: updates
  };
  
  // If updating PAYE, also update the paye property
  if (section === 'paye' || section === 'tax') {
    updateObject.paye = updates;
  }
  
  return updateSettings(updateObject, db, userId);
}

/**
 * Get default settings (unified)
 * @returns {object} Complete default settings
 */
function getDefaultSettings() {
  return {
    ...DEFAULT_PAYROLL_SETTINGS,
    paye: DEFAULT_PAYE_SETTINGS,
    // Keep taxSettings for backward compatibility
    taxSettings: DEFAULT_PAYE_SETTINGS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  };
}

/**
 * Get payroll cycle settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} Payroll cycle configuration
 */
async function getPayrollCycleSettings(db) {
  const settings = await getSettings(db);
  return {
    payrollCycle: settings.payrollCycle,
    cycleConfiguration: settings.cycleConfiguration || {}
  };
}

/**
 * Get approval workflow settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} Approval workflow configuration
 */
async function getApprovalWorkflowSettings(db) {
  const settings = await getSettings(db);
  return settings.approvalWorkflow || getDefaultSettings().approvalWorkflow;
}

/**
 * Get PAYE settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} PAYE tax settings
 */
async function getPAYESettings(db) {
  const settings = await getSettings(db);
  return settings.paye || settings.taxSettings || DEFAULT_PAYE_SETTINGS;
}

/**
 * Get payment settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} Payment settings
 */
async function getPaymentSettings(db) {
  const settings = await getSettings(db);
  return settings.paymentSettings || getDefaultSettings().paymentSettings;
}

/**
 * Get notification settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} Notification settings
 */
async function getNotificationSettings(db) {
  const settings = await getSettings(db);
  return settings.notificationSettings || getDefaultSettings().notificationSettings;
}

/**
 * Get system settings only
 * @param {object} db - Database connection
 * @returns {Promise<object>} System settings
 */
async function getSystemSettings(db) {
  const settings = await getSettings(db);
  return settings.systemSettings || getDefaultSettings().systemSettings;
}

/**
 * Update payroll cycle settings
 * @param {string} cycleType - New cycle type
 * @param {object} db - Database connection
 * @param {string} userId - User making the update
 * @returns {Promise<object>} Updated settings
 */
async function updatePayrollCycle(cycleType, db, userId = 'system') {
  const { PAYROLL_CYCLES } = require('../constants/payrollConstants');
  
  const validCycles = Object.values(PAYROLL_CYCLES);
  if (!validCycles.includes(cycleType)) {
    throw new Error(`Invalid payroll cycle: ${cycleType}`);
  }
  
  return updateSettingsSection('cycle', cycleType, db, userId);
}

/**
 * Update approval workflow settings
 * @param {object} workflowConfig - Workflow configuration
 * @param {object} db - Database connection
 * @param {string} userId - User making the update
 * @returns {Promise<object>} Updated settings
 */
async function updateApprovalWorkflow(workflowConfig, db, userId = 'system') {
  return updateSettingsSection('approval', workflowConfig, db, userId);
}

/**
 * Update PAYE tax settings
 * @param {object} payeConfig - PAYE configuration
 * @param {object} db - Database connection
 * @param {string} userId - User making the update
 * @returns {Promise<object>} Updated settings
 */
async function updatePAYESettings(payeConfig, db, userId = 'system') {
  return updateSettingsSection('paye', payeConfig, db, userId);
}

/**
 * Reset settings to defaults
 * @param {object} db - Database connection
 * @param {string} userId - User making the reset
 * @returns {Promise<object>} Default settings
 */
async function resetToDefaults(db, userId = 'system') {
  const payrollQueries = require('../queries/payrollQueries');
  
  const defaultSettings = getDefaultSettings();
  defaultSettings.updatedBy = userId;
  defaultSettings.resetAt = new Date().toISOString();
  
  return payrollQueries.upsertPayrollSettings(defaultSettings, db);
}

/**
 * Get settings summary (overview of all sections)
 * @param {object} db - Database connection
 * @returns {Promise<object>} Settings summary
 */
async function getSettingsSummary(db) {
  const settings = await getSettings(db);
  
  return {
    payrollCycle: settings.payrollCycle,
    approvalWorkflowEnabled: settings.approvalWorkflow?.enabled || false,
    requiredApprovals: settings.approvalWorkflow?.requiredApprovals || 0,
    approverCount: settings.approvalWorkflow?.approvers?.length || 0,
    taxYear: settings.paye?.taxYear || settings.taxSettings?.taxYear,
    taxBracketCount: settings.paye?.taxBrackets?.length || settings.taxSettings?.taxBrackets?.length || 0,
    defaultPaymentMethod: settings.paymentSettings?.defaultBank,
    autoBackupEnabled: settings.systemSettings?.autoBackup || false,
    lastUpdated: settings.updatedAt,
    lastUpdatedBy: settings.updatedBy
  };
}

/**
 * Export settings (for backup or migration)
 * @param {object} db - Database connection
 * @returns {Promise<object>} Complete settings object
 */
async function exportSettings(db) {
  const settings = await getSettings(db);
  
  return {
    ...settings,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
}

/**
 * Import settings (from backup or migration)
 * @param {object} importedSettings - Settings to import
 * @param {object} db - Database connection
 * @param {string} userId - User performing the import
 * @returns {Promise<object>} Imported settings
 */
async function importSettings(importedSettings, db, userId = 'system') {
  const payrollQueries = require('../queries/payrollQueries');
  const validationService = require('./validationService');
  
  // Validate imported settings
  const validation = validationService.validateSettings(importedSettings);
  if (!validation.isValid) {
    throw new Error(`Invalid settings for import: ${validation.errors.join(', ')}`);
  }
  
  // Add import metadata
  const settingsToImport = {
    ...importedSettings,
    importedAt: new Date().toISOString(),
    importedBy: userId,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  return payrollQueries.upsertPayrollSettings(settingsToImport, db);
}

module.exports = {
  // Main unified operations
  getSettings,
  updateSettings,
  updateSettingsSection,
  getDefaultSettings,
  
  // Section-specific getters
  getPayrollCycleSettings,
  getApprovalWorkflowSettings,
  getPAYESettings,
  getPaymentSettings,
  getNotificationSettings,
  getSystemSettings,
  
  // Section-specific updaters
  updatePayrollCycle,
  updateApprovalWorkflow,
  updatePAYESettings,
  
  // Utility operations
  resetToDefaults,
  getSettingsSummary,
  exportSettings,
  importSettings
};
