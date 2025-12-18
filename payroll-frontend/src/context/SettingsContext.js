// contexts/SettingsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { payrollService } from '../services/payrollService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [payrollSettings, setPayrollSettings] = useState(null);
  const [payeSettings, setPayeSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both payroll and PAYE settings
      const [payrollResponse, payeResponse] = await Promise.all([
        payrollService.getPayrollSettings(),
        payrollService.getPAYESettings()
      ]);

      if (payrollResponse.success) {
        setPayrollSettings(payrollResponse.data);
      }

      if (payeResponse.success) {
        setPayeSettings(payeResponse.data);
      }

    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    payrollSettings,
    payeSettings,
    loading,
    error,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};