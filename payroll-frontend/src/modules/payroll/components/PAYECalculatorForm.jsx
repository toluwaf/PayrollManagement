import React from 'react';

const PAYECalculatorForm = ({ 
  activeTab, 
  formData, 
  onInputChange, 
  onComponentChange,
  onCycleChange,
  formatCurrency,
  cycleConverters 
}) => {

  const handleChange = (field, value) => {
    onInputChange(field, value);
  };

  const getCycleSymbol = () => {
    switch(formData.payrollCycle) {
      case 'monthly': return '/mo';
      case 'annual': return '/yr';
      case 'weekly': return '/wk';
      default: return '/mo';
    }
  };

  const getConversionDisplay = () => {
    const amount = parseFloat(formData.salaryAmount) || 0;
    const converter = cycleConverters[formData.payrollCycle];
    
    switch(formData.payrollCycle) {
      case 'monthly':
        return {
          monthly: amount,
          annual: converter.toAnnual(amount),
          weekly: converter.toWeekly(amount)
        };
      case 'annual':
        return {
          monthly: converter.toMonthly(amount),
          annual: amount,
          weekly: (amount / 12) / 4.33
        };
      case 'weekly':
        return {
          monthly: converter.toMonthly(amount),
          annual: converter.toAnnual(amount),
          weekly: amount
        };
      default:
        return { monthly: amount, annual: amount * 12, weekly: amount / 4.33 };
    }
  };

  const conversions = getConversionDisplay();


  return (
    <>
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Salary Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Salary ({getCycleSymbol()})
            </label>
            <input
              type="number"
              value={formData.salaryAmount}
              onChange={(e) => handleChange('salaryAmount', e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${formData.payrollCycle} salary`}
            />
          </div>

          {/* Period Worked (for YTD calculation) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Worked This Year
              <span className="text-xs text-gray-500 ml-2">
                ({formData.payrollCycle === 'weekly' ? 'Weeks' : 'Months'} worked so far)
              </span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max={formData.payrollCycle === 'weekly' ? 52 : 12}
                value={formData.periodWorked}
                onChange={(e) => handleChange('periodWorked', e.target.value)}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                {formData.periodWorked} {formData.payrollCycle === 'weekly' ? 'weeks' : 'months'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {formData.periodWorked === 12 && formData.payrollCycle === 'monthly' && 'Full year'}
              {formData.periodWorked === 52 && formData.payrollCycle === 'weekly' && 'Full year'}
              {formData.periodWorked < 12 && formData.payrollCycle === 'monthly' && 
                `YTD calculation for ${formData.periodWorked}/12 months`}
              {formData.periodWorked < 52 && formData.payrollCycle === 'weekly' && 
                `YTD calculation for ${formData.periodWorked}/52 weeks`}
            </div>
          </div>

          {/* Conversion Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Equivalent Amounts:</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Monthly</div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(conversions.monthly)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Annual</div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(conversions.annual)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Weekly</div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(conversions.weekly)}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle for direct component input */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Use custom component breakdown
            </span>
            <button
              onClick={() => handleChange('useDirectComponents', !formData.useDirectComponents)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.useDirectComponents ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.useDirectComponents ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          {formData.useDirectComponents ? (
            // Direct component input
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Enter Component Amounts (Monthly):</h4>
              {[
                { label: 'Basic Salary', field: 'basic' },
                { label: 'Housing Allowance', field: 'housing' },
                { label: 'Transport Allowance', field: 'transport' },
                { label: 'Entertainment', field: 'entertainment' },
                { label: 'Meal Subsidy', field: 'mealSubsidy' },
                { label: 'Medical Allowance', field: 'medical' },
                { label: 'Benefits in Kind', field: 'benefitsInKind' }
              ].map((item) => (
                <div key={item.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    value={formData.directComponents[item.field]}
                    onChange={(e) => onComponentChange(item.field, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Percentage breakdown
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Salary Breakdown (Percentages):</h4>
              
              {[
                { label: 'Basic Salary', field: 'basicPercentage', color: 'bg-blue-500' },
                { label: 'Housing Allowance', field: 'housingPercentage', color: 'bg-green-500' },
                { label: 'Transport Allowance', field: 'transportPercentage', color: 'bg-yellow-500' },
                { label: 'Other Allowances', field: 'otherPercentage', color: 'bg-purple-500' }
              ].map((item) => (
                <div key={item.field}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="font-semibold text-gray-900">{formData[item.field]}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-300`}
                      style={{ width: `${formData[item.field]}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData[item.field]}
                    onChange={(e) => handleChange(item.field, e.target.value)}
                    className="w-full mt-2"
                  />
                </div>
              ))}
              
              {/* Component Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h5 className="font-medium text-gray-700 mb-3">Monthly Component Preview:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary:</span>
                    <span className="font-medium">
                      {formatCurrency(conversions.monthly * (formData.basicPercentage / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Housing:</span>
                    <span className="font-medium">
                      {formatCurrency(conversions.monthly * (formData.housingPercentage / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport:</span>
                    <span className="font-medium">
                      {formatCurrency(conversions.monthly * (formData.transportPercentage / 100))}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total Monthly:</span>
                      <span>{formatCurrency(conversions.monthly)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deductions' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Rent Paid
            </label>
            <input
              type="number"
              value={formData.annualRentPaid}
              onChange={(e) => handleChange('annualRentPaid', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter annual rent paid"
            />
            <p className="text-xs text-gray-500 mt-1">
              20% relief up to ₦500,000 annually
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NHIS Contribution (/mo)
              </label>
              <input
                type="number"
                value={formData.nhisContribution}
                onChange={(e) => handleChange('nhisContribution', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Life Assurance (/mo)
              </label>
              <input
                type="number"
                value={formData.lifeAssurance}
                onChange={(e) => handleChange('lifeAssurance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gratuities (/mo)
            </label>
            <input
              type="number"
              value={formData.gratuities}
              onChange={(e) => handleChange('gratuities', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees in Company
            </label>
            <input
              type="number"
              value={formData.employeeCount}
              onChange={(e) => handleChange('employeeCount', e.target.value)}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              ITF levy (1%) applies for companies with 5+ employees
            </p>
          </div>
        </div>
      )}
    </>
  );
};


export default PAYECalculatorForm;