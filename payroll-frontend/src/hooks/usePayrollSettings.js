// src/hooks/usePayrollSettings.js
import { useState, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { payrollService } from '../services/payrollService';
import { validatePayrollSettings, validatePAYESettings } from '../utils/validationHelper';

export const usePayrollSettings = () => {
  const { refreshSettings } = useSettings();
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPAYE, setSavingPAYE] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '', details: null });
  const [hasChanges, setHasChanges] = useState(false);
  
  const saveTimeoutRef = useRef(null);
  const lastSaveAttemptRef = useRef(0);
  const MIN_SAVE_INTERVAL = 2000;

  // Load settings
  const loadSettings = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setMessage({ type: '', text: '', details: null });

    try {
      const response = await payrollService.getPayrollSettings();
      
      if (response.success) {
        setSettings(response.data);
        setHasChanges(false);
      } else {
        setMessage({
          type: 'error',
          text: `Failed to load settings: ${response.message}`,
          details: response.details
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to load settings. Please try again.',
        details: error.response?.data?.details
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Save settings with validation and debouncing
  const saveSettings = useCallback(async () => {
    const now = Date.now();
    if (now - lastSaveAttemptRef.current < MIN_SAVE_INTERVAL) {
      setMessage({ type: 'warning', text: 'Please wait before saving again' });
      return;
    }

    lastSaveAttemptRef.current = now;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    return new Promise((resolve) => {
      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        setMessage({ type: '', text: '', details: null });

        try {
          // Validation
          const validation = validatePayrollSettings(settings);
          if (!validation.isValid) {
            setMessage({
              type: 'error',
              text: `Validation errors: ${validation.errors.join(', ')}`
            });
            resolve({ success: false, errors: validation.errors });
            return;
          }

          // Ensure proper structure
          const payload = {
            payrollCycle: settings.payrollCycle,
            approvalWorkflow: settings.approvalWorkflow || {
              enabled: true,
              requiredApprovals: 2,
              approvers: []
            },
            taxSettings: settings.taxSettings || {
              taxYear: 2026,
              taxBrackets: [],
              statutoryRates: {},
              reliefs: {}
            },
            paymentSettings: settings.paymentSettings || {},
            notificationSettings: settings.notificationSettings || {},
            systemSettings: settings.systemSettings || {}
          };

          // API call
          const response = await payrollService.updatePayrollSettings(payload);

          if (response.success) {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setHasChanges(false);
            await refreshSettings();
            resolve({ success: true, data: response.data });
          } else {
            let errorText = response.message || 'Failed to save settings';
            if (response.details) {
              if (Array.isArray(response.details)) {
                errorText = `Validation failed: ${response.details.join(', ')}`;
              } else if (response.details.errors) {
                errorText = `Validation failed: ${response.details.errors.join(', ')}`;
              }
            }
            setMessage({ type: 'error', text: errorText });
            resolve({ success: false, error: errorText });
          }
        } catch (error) {
          console.error('Failed to save settings:', error);
          setMessage({ 
            type: 'error', 
            text: error.message || 'Failed to save settings. Please try again.' 
          });
          resolve({ success: false, error: error.message });
        } finally {
          setSaving(false);
        }
      }, 500); // 500ms debounce
    });
  }, [settings, refreshSettings]);

  // Update nested setting
  const updateNestedSetting = useCallback((section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  }, []);

  // Update PAYE settings
  const updatePAYESettings = useCallback(async () => {
    if (!settings?.taxSettings) {
      setMessage({ type: 'error', text: 'No PAYE settings to update' });
      return { success: false, error: 'No PAYE settings' };
    }

    setSavingPAYE(true);
    setMessage({ type: '', text: '', details: null });

    try {
      const payePayload = {
        ...settings.taxSettings,
        taxYear: settings.taxSettings.taxYear || 2026,
        taxBrackets: settings.taxSettings.taxBrackets || [],
        statutoryRates: settings.taxSettings.statutoryRates || {},
        reliefs: settings.taxSettings.reliefs || {}
      };

      const response = await payrollService.updatePAYESettings(payePayload);

      if (response.success) {
        setMessage({ type: 'success', text: 'PAYE settings updated successfully!' });
        setHasChanges(false);
        await refreshSettings();
        return { success: true, data: response.data };
      } else {
        const errorText = response.details?.errors 
          ? `PAYE validation failed: ${response.details.errors.join(', ')}`
          : response.message || 'Failed to update PAYE settings';
        
        setMessage({ type: 'error', text: errorText });
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('Failed to update PAYE settings:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update PAYE settings. Please try again.'
      });
      return { success: false, error: error.message };
    } finally {
      setSavingPAYE(false);
    }
  }, [settings, refreshSettings]);

  // Reset functions
  const resetPayrollCycleToDefault = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      payrollCycle: 'monthly',
      approvalWorkflow: {
        enabled: true,
        requiredApprovals: 2,
        approvers: []
      }
    }));
    setHasChanges(true);
  }, []);

  const resetPAYESettingsToDefault = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      taxSettings: {
        taxYear: 2026,
        taxBrackets: [
          { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
          { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
          { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
          { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
          { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
          { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
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
      }
    }));
    setHasChanges(true);
  }, []);

  const resetToDefaults = useCallback(async () => {
    const defaultSettings = payrollService.getDefaultPayrollSettings();
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  // Clear message
  const clearMessage = useCallback(() => {
    setMessage({ type: '', text: '', details: null });
  }, []);

  return {
    // State
    settings,
    loading,
    saving,
    savingPAYE,
    message,
    hasChanges,
    
    // Actions
    loadSettings,
    saveSettings,
    updatePAYESettings,
    updateNestedSetting,
    resetPayrollCycleToDefault,
    resetPAYESettingsToDefault,
    resetToDefaults,
    clearMessage,
    
    // Setters
    setSettings,
    setHasChanges
  };
};