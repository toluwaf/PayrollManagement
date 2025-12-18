import React from 'react';

const PAYECalculatorForm = ({ activeTab, formData, onInputChange, getTotalGross, formatCurrency }) => {
  const handleChange = (field, value) => {
    onInputChange(field, value);
  };

  return (
    <>
      {activeTab === 'input' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tax Year 2026 Updates</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• First ₦800,000 tax-free</li>
              <li>• Rent Relief replaces CRA</li>
              <li>• Updated tax brackets</li>
              <li>• No minimum tax rule</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Salary *
            </label>
            <input
              type="number"
              value={formData.basicSalary}
              onChange={(e) => handleChange('basicSalary', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter basic salary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Housing Allowance
              </label>
              <input
                type="number"
                value={formData.housingAllowance}
                onChange={(e) => handleChange('housingAllowance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Allowance
              </label>
              <input
                type="number"
                value={formData.transportAllowance}
                onChange={(e) => handleChange('transportAllowance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entertainment
              </label>
              <input
                type="number"
                value={formData.entertainmentAllowance}
                onChange={(e) => handleChange('entertainmentAllowance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Subsidy
              </label>
              <input
                type="number"
                value={formData.mealSubsidy}
                onChange={(e) => handleChange('mealSubsidy', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Allowance
              </label>
              <input
                type="number"
                value={formData.medicalAllowance}
                onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits in Kind
              </label>
              <input
                type="number"
                value={formData.benefitsInKind}
                onChange={(e) => handleChange('benefitsInKind', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Gross Monthly:</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(getTotalGross())}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deductions' && (
        <div className="space-y-4">
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
                NHIS Contribution
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
                Life Assurance
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
              Gratuities
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
              Number of Employees
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
              ITF levy applies for 5+ employees
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PAYECalculatorForm;