// src/components/payroll/PAYECalculatorModal.jsx
import React, { useState, useEffect } from 'react';
import PAYECalculator from '../../../services/payeCalculator';
import { useSettings } from '../../../context/SettingsContext';

// Import the split components
import PAYECalculatorForm from './PAYECalculatorForm';
import PAYEResultsPanel from './PAYEResultsPanel';
import AnnualBreakdownModal from './AnnualBreakdownModal';

const PAYECalculatorModal = ({ isOpen, onClose, defaultSalary = 0 }) => {
  const [calculator, setCalculator] = useState(null);
  const [formData, setFormData] = useState({
    basicSalary: defaultSalary * 0.6,
    housingAllowance: 0,
    transportAllowance: 0,
    entertainmentAllowance: 0,
    mealSubsidy: 0,
    medicalAllowance: 0,
    benefitsInKind: 0,
    annualRentPaid: 0,
    nhisContribution: 0,
    lifeAssurance: 0,
    gratuities: 0,
    employeeCount: 1
  });

  const [calculations, setCalculations] = useState(null);
  const [showAnnualBreakdown, setShowAnnualBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [loading, setLoading] = useState(false);

  // Use settings from context
  const { payeSettings, loading: settingsLoading, error: settingsError } = useSettings();

  // Initialize calculator when settings are loaded
  useEffect(() => {
    if (payeSettings && !settingsLoading) {
      const newCalculator = new PAYECalculator(payeSettings);
      setCalculator(newCalculator);
    } else if (!settingsLoading && !payeSettings) {
      // Fallback to default calculator if no settings
      const defaultCalculator = new PAYECalculator();
      setCalculator(defaultCalculator);
    }
  }, [payeSettings, settingsLoading]);

  useEffect(() => {
    if (calculator && isOpen) {
      calculatePAYE();
    }
  }, [formData, calculator, isOpen]);

  const calculatePAYE = async () => {
    if (!calculator) return;

    setLoading(true);
    try {
      const salaryComponents = {
        basic: parseFloat(formData.basicSalary) || 0,
        housing: parseFloat(formData.housingAllowance) || 0,
        transport: parseFloat(formData.transportAllowance) || 0,
        entertainment: parseFloat(formData.entertainmentAllowance) || 0,
        mealSubsidy: parseFloat(formData.mealSubsidy) || 0,
        medical: parseFloat(formData.medicalAllowance) || 0,
        benefitsInKind: parseFloat(formData.benefitsInKind) || 0
      };

      const additionalDeductions = {
        nhis: parseFloat(formData.nhisContribution) || 0,
        lifeAssurance: parseFloat(formData.lifeAssurance) || 0,
        gratuities: parseFloat(formData.gratuities) || 0,
        employeeCount: parseInt(formData.employeeCount) || 1
      };

      const employee = {
        name: "Sample Employee",
        employeeId: "CALC-001",
        salaryComponents,
        annualRentPaid: parseFloat(formData.annualRentPaid) || 0,
        additionalDeductions
      };

      const result = calculator.computePAYE(employee);
      setCalculations(result);
    } catch (error) {
      console.error('PAYE calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getTotalGross = () => {
    return Object.values(formData).reduce((sum, value, index) => {
      if (index < 7) { // First 7 fields are salary components
        return sum + (parseFloat(value) || 0);
      }
      return sum;
    }, 0);
  };

  const resetForm = () => {
    setFormData({
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      entertainmentAllowance: 0,
      mealSubsidy: 0,
      medicalAllowance: 0,
      benefitsInKind: 0,
      annualRentPaid: 0,
      nhisContribution: 0,
      lifeAssurance: 0,
      gratuities: 0,
      employeeCount: 1
    });
  };

  // Show current tax year and settings info
  const getTaxYearInfo = () => {
    if (settingsLoading) return 'Loading settings...';
    if (settingsError) return 'Using default settings';
    if (payeSettings) return `Tax Year ${payeSettings.taxYear} • NTA Compliant`;
    return 'Using default settings';
  };

  if (!isOpen) return null;
  
  if (settingsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading calculator settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex">
        {/* Left Panel - Input Form */}
        <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">PAYE Calculator 2026</h2>
                <p className="text-sm text-gray-600 mt-1">{getTaxYearInfo()}</p>
                {payeSettings && (
                  <p className="text-xs text-green-600 mt-1">
                    Using configured tax brackets and rates
                  </p>
                )}
                {settingsError && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {settingsError} - using default calculation
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Current Settings Info */}
            {payeSettings && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Current Tax Settings</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• First ₦{payeSettings.taxBrackets?.[0]?.max?.toLocaleString() || '800,000'} tax-free</div>
                  <div>• {payeSettings.taxBrackets?.length || 6} tax brackets</div>
                  <div>• Rent relief: {(payeSettings.reliefs?.rentRelief * 100) || 20}% up to ₦{(payeSettings.reliefs?.rentReliefCap || 500000).toLocaleString()}</div>
                  <div>• Pension: {(payeSettings.statutoryRates?.employeePension * 100) || 8}% employee</div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('input')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'input'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Salary Input
              </button>
              <button
                onClick={() => setActiveTab('deductions')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'deductions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Deductions
              </button>
            </div>

            <PAYECalculatorForm
              activeTab={activeTab}
              formData={formData}
              onInputChange={handleInputChange}
              getTotalGross={getTotalGross}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-3/5 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !calculations ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No calculation yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter salary details to see PAYE calculation
                </p>
              </div>
            ) : (
              <PAYEResultsPanel 
                calculations={calculations} 
                payeSettings={payeSettings}
                onShowAnnualBreakdown={() => setShowAnnualBreakdown(true)}
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        </div>
      </div>

      {/* Annual Breakdown Modal */}
      {showAnnualBreakdown && calculations && (
        <AnnualBreakdownModal
          calculations={calculations}
          onClose={() => setShowAnnualBreakdown(false)}
        />
      )}
    </div>
  );
};

export default PAYECalculatorModal;