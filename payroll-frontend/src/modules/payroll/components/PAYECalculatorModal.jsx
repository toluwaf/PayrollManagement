// src/components/payroll/PAYECalculatorModal.jsx
import React, { useState, useEffect } from 'react';
import PAYECalculator from '../../../services/payeCalculator';
import { useSettings } from '../../../context/SettingsContext';

// Import the split components
import PAYECalculatorForm from './PAYECalculatorForm';
import PAYEResultsPanel from './PAYEResultsPanel';
import AnnualBreakdownModal from './AnnualBreakdownModal';
import CycleProjectionPanel from './CycleProjectionPanel';

const PAYECalculatorModal = ({ isOpen, onClose, defaultSalary = 0 }, defaultCycle = 'monthly') => {
  const [calculator, setCalculator] = useState(null);
  const [formData, setFormData] = useState({
    // Cycle selection
    payrollCycle: defaultCycle,
    periodWorked: 12, // For annual projection
    
    // Salary input (user inputs in selected cycle)
    salaryAmount: defaultSalary,
    
    // Breakdown percentages (optional)
    basicPercentage: 60,
    housingPercentage: 25,
    transportPercentage: 10,
    otherPercentage: 5,
    
    // Deductions
    annualRentPaid: 0,
    nhisContribution: 0,
    lifeAssurance: 0,
    gratuities: 0,
    employeeCount: 1,
    
    // Optional direct component override
    useDirectComponents: false,
    directComponents: {
      basic: 0,
      housing: 0,
      transport: 0,
      entertainment: 0,
      mealSubsidy: 0,
      medical: 0,
      benefitsInKind: 0
    }
  });

  const [calculations, setCalculations] = useState(null);
  const [projectedAnnual, setProjectedAnnual] = useState(null);
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

  
  // Convert between cycles
  const cycleConverters = {
    monthly: {
      toAnnual: (amount) => amount * 12,
      toMonthly: (amount) => amount,
      toWeekly: (amount) => amount / 4.33,
      fromAnnual: (amount) => amount / 12,
      fromWeekly: (amount) => amount * 4.33
    },
    annual: {
      toAnnual: (amount) => amount,
      toMonthly: (amount) => amount / 12,
      toWeekly: (amount) => (amount / 12) / 4.33,
      fromMonthly: (amount) => amount * 12,
      fromWeekly: (amount) => (amount * 4.33) * 12
    },
    weekly: {
      toAnnual: (amount) => (amount * 4.33) * 12,
      toMonthly: (amount) => amount * 4.33,
      toWeekly: (amount) => amount,
      fromAnnual: (amount) => (amount / 12) / 4.33,
      fromMonthly: (amount) => amount / 4.33
    }
  };

  // Calculate salary components based on input method
  const getSalaryComponents = () => {
    const currentAmount = parseFloat(formData.salaryAmount) || 0;
    const converter = cycleConverters[formData.payrollCycle];
    const monthlyAmount = converter.toMonthly(currentAmount);
    
    if (formData.useDirectComponents) {
      // Use direct component values (convert to monthly if needed)
      return {
        basic: parseFloat(formData.directComponents.basic) || 0,
        housing: parseFloat(formData.directComponents.housing) || 0,
        transport: parseFloat(formData.directComponents.transport) || 0,
        entertainment: parseFloat(formData.directComponents.entertainment) || 0,
        mealSubsidy: parseFloat(formData.directComponents.mealSubsidy) || 0,
        medical: parseFloat(formData.directComponents.medical) || 0,
        benefitsInKind: parseFloat(formData.directComponents.benefitsInKind) || 0
      };
    } else {
      // Calculate components based on percentages
      const totalMonthly = monthlyAmount;
      return {
        basic: totalMonthly * (formData.basicPercentage / 100),
        housing: totalMonthly * (formData.housingPercentage / 100),
        transport: totalMonthly * (formData.transportPercentage / 100),
        entertainment: totalMonthly * ((formData.otherPercentage * 0.4) / 100), // 40% of "other"
        mealSubsidy: totalMonthly * ((formData.otherPercentage * 0.3) / 100), // 30% of "other"
        medical: totalMonthly * ((formData.otherPercentage * 0.2) / 100), // 20% of "other"
        benefitsInKind: totalMonthly * ((formData.otherPercentage * 0.1) / 100) // 10% of "other"
      };
    }
  };
  
  // Calculate YTD (Year-to-Date) based on period worked
  const calculateYTDProjection = (annualResult, periodWorked, cycle) => {
    let monthsWorked;
    
    switch(cycle) {
      case 'monthly':
        monthsWorked = Math.min(periodWorked, 12);
        break;
      case 'annual':
        // If annual cycle, periodWorked is in months of the annual salary
        monthsWorked = Math.min(periodWorked, 12);
        break;
      case 'weekly':
        // Convert weeks to months (approx 4.33 weeks per month)
        monthsWorked = Math.min(periodWorked / 4.33, 12);
        break;
      default:
        monthsWorked = 12;
    }
    
    const fractionOfYear = monthsWorked / 12;
    
    return {
      monthsWorked: monthsWorked,
      weeksWorked: cycle === 'weekly' ? periodWorked : Math.round(monthsWorked * 4.33),
      ytdGross: annualResult.annualGrossEmolument * fractionOfYear,
      ytdTax: annualResult.taxCalculation.annualTax * fractionOfYear,
      ytdNet: (annualResult.annualGrossEmolument - annualResult.taxCalculation.annualTax) * fractionOfYear,
      remainingMonths: 12 - monthsWorked,
      projectedAnnual: {
        gross: annualResult.annualGrossEmolument,
        tax: annualResult.taxCalculation.annualTax,
        net: annualResult.annualGrossEmolument - annualResult.taxCalculation.annualTax
      },
      completionPercentage: (monthsWorked / 12) * 100
    };
  };

  const calculatePAYE = async () => {
    if (!calculator) return;

    setLoading(true);
    try {
      const salaryComponents = getSalaryComponents();

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
        additionalDeductions,
        monthsWorked: 12
      };

      const result = calculator.computePAYE(employee);
      setCalculations(result);
            
      // Calculate YTD projection
      const projection = calculateYTDProjection(
        result, 
        formData.periodWorked, 
        formData.payrollCycle
      );
      setProjectedAnnual(projection);

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

  const handleComponentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      directComponents: {
        ...prev.directComponents,
        [field]: value
      }
    }));
  };
  
  const handleCycleChange = (cycle) => {
    const currentAmount = parseFloat(formData.salaryAmount) || 0;
    const currentCycle = formData.payrollCycle;
    
    if (currentAmount > 0) {
      // Convert amount to new cycle
      const converter = cycleConverters[currentCycle];
      let annualAmount;
      
      switch(currentCycle) {
        case 'monthly':
          annualAmount = converter.toAnnual(currentAmount);
          break;
        case 'annual':
          annualAmount = currentAmount;
          break;
        case 'weekly':
          annualAmount = converter.toAnnual(currentAmount);
          break;
      }
      
      // Convert from annual to new cycle
      const newConverter = cycleConverters[cycle];
      let newAmount;
      
      switch(cycle) {
        case 'monthly':
          newAmount = newConverter.fromAnnual(annualAmount);
          break;
        case 'annual':
          newAmount = annualAmount;
          break;
        case 'weekly':
          newAmount = newConverter.fromAnnual(annualAmount);
          break;
      }
      
      setFormData(prev => ({
        ...prev,
        payrollCycle: cycle,
        salaryAmount: Math.round(newAmount)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        payrollCycle: cycle
      }));
    }
  };

  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  
  const getCurrentCycleLabel = () => {
    const cycles = {
      monthly: 'Monthly',
      annual: 'Annual',
      weekly: 'Weekly'
    };
    return cycles[formData.payrollCycle] || 'Monthly';
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
    // setFormData({
    //   basicSalary: 0,
    //   housingAllowance: 0,
    //   transportAllowance: 0,
    //   entertainmentAllowance: 0,
    //   mealSubsidy: 0,
    //   medicalAllowance: 0,
    //   benefitsInKind: 0,
    //   annualRentPaid: 0,
    //   nhisContribution: 0,
    //   lifeAssurance: 0,
    //   gratuities: 0,
    //   employeeCount: 1
    // });

    setFormData({
      payrollCycle: 'monthly',
      periodWorked: 12,
      salaryAmount: 0,
      basicPercentage: 60,
      housingPercentage: 25,
      transportPercentage: 10,
      otherPercentage: 5,
      annualRentPaid: 0,
      nhisContribution: 0,
      lifeAssurance: 0,
      gratuities: 0,
      employeeCount: 1,
      useDirectComponents: false,
      directComponents: {
        basic: 0,
        housing: 0,
        transport: 0,
        entertainment: 0,
        mealSubsidy: 0,
        medical: 0,
        benefitsInKind: 0
      }
    });
  };

  // Show current tax year and settings info
  const getTaxYearInfo = () => {
    if (settingsLoading) return 'Loading settings...';
    if (settingsError) return 'Using default settings';
    if (payeSettings) return `Tax Year ${payeSettings.taxYear} • NTA Compliant`;
    return 'Using default settings';
  };

  const getSampleSalaries = () => {
    const samples = {
      monthly: [
        { label: '₦100k/mo', value: 100000 },
        { label: '₦500k/mo', value: 500000 },
        { label: '₦1M/mo', value: 1000000 }
      ],
      annual: [
        { label: '₦1.2M/yr', value: 1200000 },
        { label: '₦6M/yr', value: 6000000 },
        { label: '₦12M/yr', value: 12000000 }
      ],
      weekly: [
        { label: '₦25k/wk', value: 25000 },
        { label: '₦100k/wk', value: 100000 },
        { label: '₦250k/wk', value: 250000 }
      ]
    };
    return samples[formData.payrollCycle] || samples.monthly;
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

            {/* Cycle Selector */}
            <div className="mb-6">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                {['monthly', 'annual', 'weekly'].map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => handleCycleChange(cycle)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      formData.payrollCycle === cycle
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cycle === 'monthly' && 'Monthly'}
                    {cycle === 'annual' && 'Annual'}
                    {cycle === 'weekly' && 'Weekly'}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Input salary as {getCurrentCycleLabel().toLowerCase()} amount</span>
                {formData.payrollCycle === 'weekly' && (
                  <span>× 4.33 = monthly, × 52 = annual</span>
                )}
              </div>
            </div>

            {/* Quick Sample Salaries */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Samples:</p>
              <div className="flex flex-wrap gap-2">
                {getSampleSalaries().map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange('salaryAmount', sample.value)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Settings Info */}
            {payeSettings && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">NTA 2026 Tax Structure</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• First ₦800,000: 0%</div>
                  <div>• Next ₦2,200,000: 15%</div>
                  <div>• Next ₦9,000,000: 18%</div>
                  <div>• Next ₦13,000,000: 21%</div>
                  <div>• Next ₦25,000,000: 23%</div>
                  <div>• Above ₦50,000,000: 25%</div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {['input', 'breakdown', 'deductions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'input' && 'Salary Input'}
                  {tab === 'breakdown' && 'Components'}
                  {tab === 'deductions' && 'Deductions'}
                </button>
              ))}
            </div>

            <PAYECalculatorForm
              activeTab={activeTab}
              formData={formData}
              onInputChange={handleInputChange}
              onComponentChange={handleComponentChange}
              onCycleChange={handleCycleChange}
              formatCurrency={formatCurrency}
              cycleConverters={cycleConverters}
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
              <>
                <PAYEResultsPanel 
                  calculations={calculations} 
                  payeSettings={payeSettings}
                  onShowAnnualBreakdown={() => setShowAnnualBreakdown(true)}
                  formatCurrency={formatCurrency}
                />
                                
                {projectedAnnual && (
                  <CycleProjectionPanel
                    projection={projectedAnnual}
                    formData={formData}
                    calculations={calculations}
                    formatCurrency={formatCurrency}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Annual Breakdown Modal */}
      {showAnnualBreakdown && calculations && (
        <AnnualBreakdownModal
          calculations={calculations}
          projection={projectedAnnual}
          onClose={() => setShowAnnualBreakdown(false)}
        />
      )}
    </div>
  );
};

export default PAYECalculatorModal;