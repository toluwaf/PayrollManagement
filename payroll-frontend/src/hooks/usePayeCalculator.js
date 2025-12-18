// src/hooks/usePayeCalculator.js
import { useState, useCallback, useMemo } from 'react';
import PAYECalculator from '../services/payeCalculator';

export const usePayeCalculator = (settings) => {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculator = useMemo(() => {
    if (!settings) return null;
    return new PAYECalculator(settings);
  }, [settings]);

  const calculatePaye = useCallback(async (formData) => {
    if (!calculator) {
      setError('Calculator not initialized');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare salary components
      const salaryComponents = {
        basic: formData.basic || 0,
        housing: formData.housing || 0,
        transport: formData.transport || 0,
        entertainment: (formData.other || 0) * 0.3,
        mealSubsidy: (formData.other || 0) * 0.2,
        medical: (formData.other || 0) * 0.5,
        benefitsInKind: 0
      };

      // Prepare employee data
      const employeeData = {
        name: formData.employeeName || 'Employee',
        employeeId: 'CALC-' + Date.now(),
        salaryComponents,
        monthsWorked: 12,
        annualRentPaid: formData.annualRent || 0,
        additionalDeductions: {
          nhis: formData.nhis || 0,
          lifeAssurance: 0,
          gratuities: 0
        },
        payrollCycle: formData.payrollCycle || 'monthly'
      };

      // Perform calculation
      const result = calculator.computePAYE(employeeData);
      setCalculation(result);
      return result;

    } catch (err) {
      console.error('PAYE calculation error:', err);
      setError(err.message || 'Failed to calculate PAYE');
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculator]);

  const resetCalculation = useCallback(() => {
    setCalculation(null);
    setError(null);
  }, []);

  return {
    calculation,
    loading,
    error,
    calculatePaye,
    resetCalculation,
    hasCalculator: !!calculator
  };
};