import React from 'react';

const IncomeComposition = ({ calculations, formatCurrency }) => {
  const monthly = calculations.grossEmolument;
  const {
    basic = monthly * 0.6,
    housing = 0,
    transport = 0,
    entertainment = 0,
    mealSubsidy = 0,
    medical = 0,
    benefitsInKind = 0
  } = calculations.employee?.salaryComponents || {};

  const components = [
    { name: 'Basic Salary', monthly: basic, annual: basic * 12, color: 'blue' },
    { name: 'Housing Allowance', monthly: housing, annual: housing * 12, color: 'green' },
    { name: 'Transport Allowance', monthly: transport, annual: transport * 12, color: 'yellow' },
    { name: 'Entertainment', monthly: entertainment, annual: entertainment * 12, color: 'purple' },
    { name: 'Meal Subsidy', monthly: mealSubsidy, annual: mealSubsidy * 12, color: 'pink' },
    { name: 'Medical Allowance', monthly: medical, annual: medical * 12, color: 'indigo' },
    { name: 'Benefits in Kind', monthly: benefitsInKind, annual: benefitsInKind * 12, color: 'gray' }
  ];

  const totalAnnual = components.reduce((sum, comp) => sum + comp.annual, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Composition</h3>
      
      {/* Visual Percentage Chart */}
      <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
        {components.map((comp, index) => (
          <div
            key={index}
            className={`h-full bg-${comp.color}-500`}
            style={{ width: `${(comp.annual / totalAnnual) * 100}%` }}
            title={`${comp.name}: ${((comp.annual / totalAnnual) * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        {components.map((comp, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className={`w-3 h-3 bg-${comp.color}-500 rounded mr-3`}></div>
              <span className="text-sm text-gray-700">{comp.name}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{formatCurrency(comp.annual)}</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(comp.monthly)} monthly • {((comp.annual / totalAnnual) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
          <span className="text-gray-900">Total Annual Income</span>
          <span className="text-lg text-blue-600">{formatCurrency(totalAnnual)}</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeComposition;