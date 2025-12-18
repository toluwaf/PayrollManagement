import React from 'react';

const AnnualDeductions = ({ calculations, formatCurrency }) => {
  const { deductions } = calculations;
  const statutory = deductions.statutory;

  const annualDeductions = [
    {
      category: 'Tax Deductions',
      items: [
        { name: 'PAYE Tax', amount: deductions.monthlyTax * 12, type: 'tax' }
      ]
    },
    {
      category: 'Statutory Contributions',
      items: [
        { name: 'Pension (8%)', amount: statutory.employeePension * 12, type: 'pension' },
        { name: 'NHF (2.5%)', amount: statutory.nhf * 12, type: 'housing' },
        { name: 'NHIS', amount: (statutory.nhis || 0) * 12, type: 'health' },
        { name: 'Life Assurance', amount: (statutory.lifeAssurance || 0) * 12, type: 'insurance' },
        { name: 'Gratuities', amount: (statutory.gratuities || 0) * 12, type: 'retirement' }
      ]
    }
  ];

  const totalAnnualDeductions = annualDeductions.reduce((total, category) => 
    total + category.items.reduce((sum, item) => sum + item.amount, 0), 0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Deductions Breakdown</h3>
      
      <div className="space-y-4">
        {annualDeductions.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h4 className="font-medium text-gray-700 mb-3">{category.category}</h4>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                item.amount > 0 && (
                  <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        
        {/* Total Deductions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total Annual Deductions</span>
          <span className="text-xl font-bold text-red-600">
            {formatCurrency(totalAnnualDeductions)}
          </span>
        </div>
        
        {/* Deductions Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-700 mb-2">Deductions Distribution</h5>
          <div className="space-y-2">
            {annualDeductions.flatMap(category => category.items)
              .filter(item => item.amount > 0)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(item.amount / totalAnnualDeductions) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-500 w-12 text-right">
                      {((item.amount / totalAnnualDeductions) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualDeductions;