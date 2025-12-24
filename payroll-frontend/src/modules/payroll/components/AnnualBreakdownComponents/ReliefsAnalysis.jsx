import React from 'react';

const ReliefsAnalysis = ({ calculations, formatCurrency }) => {
  const { deductions, taxCalculation } = calculations;
  const annualGross = calculations.annualGrossEmolument;
  
  const reliefs = [
    {
      name: 'Rent Relief',
      amount: deductions.rentRelief,
      description: '20% of annual rent paid',
      savings: deductions.rentRelief * 0.25, // Approximate tax savings
      type: 'housing'
    },
    {
      name: 'Pension Relief',
      amount: deductions.statutory.employeePension * 12,
      description: '8% employee contribution',
      savings: (deductions.statutory.employeePension * 12) * 0.25,
      type: 'retirement'
    },
    {
      name: 'NHF Relief',
      amount: deductions.statutory.nhf * 12,
      description: '2.5% of basic salary',
      savings: (deductions.statutory.nhf * 12) * 0.25,
      type: 'housing'
    },
    {
      name: 'NHIS Relief',
      amount: (deductions.statutory.nhis || 0) * 12,
      description: 'Health insurance contribution',
      savings: ((deductions.statutory.nhis || 0) * 12) * 0.25,
      type: 'health'
    }
  ];

  const totalReliefs = reliefs.reduce((sum, relief) => sum + relief.amount, 0);
  const totalSavings = reliefs.reduce((sum, relief) => sum + relief.savings, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Reliefs & Allowances</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reliefs Breakdown */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Reliefs Applied</h4>
          <div className="space-y-3">
            {reliefs.map((relief, index) => (
              relief.amount > 0 && (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{relief.name}</div>
                    <div className="text-sm text-gray-500">{relief.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">-{formatCurrency(relief.amount)}</div>
                    <div className="text-xs text-gray-500">
                      Saves ~{formatCurrency(relief.savings)} in tax
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Reliefs Impact */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Tax Impact</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Income:</span>
              <span className="font-semibold">{formatCurrency(annualGross)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Reliefs:</span>
              <span className="font-semibold text-green-600">-{formatCurrency(totalReliefs)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-700 font-medium">Taxable Income:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(taxCalculation.annualTaxableIncome)}
              </span>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="text-sm text-yellow-800">
                💡 <strong>Tax Savings:</strong> Reliefs reduced your tax liability by approximately{' '}
                <strong>{formatCurrency(totalSavings)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReliefsAnalysis;