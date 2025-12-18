import React from 'react';

const TaxEfficiencyAnalysis = ({ calculations, formatCurrency }) => {
  const annualGross = calculations.annualGrossEmolument;
  const annualNet = calculations.netPay * 12;
  const annualTax = calculations.taxCalculation.annualTax;
  const totalDeductions = annualGross - annualNet;

  const metrics = [
    {
      label: 'Effective Tax Rate',
      value: ((annualTax / annualGross) * 100).toFixed(1) + '%',
      description: 'Total tax as percentage of gross income',
      benchmark: '15-25%',
      status: ((annualTax / annualGross) * 100) < 20 ? 'good' : 'high'
    },
    {
      label: 'Net to Gross Ratio',
      value: ((annualNet / annualGross) * 100).toFixed(1) + '%',
      description: 'Take-home pay percentage',
      benchmark: '70-80%',
      status: ((annualNet / annualGross) * 100) > 75 ? 'good' : 'low'
    },
    {
      label: 'Tax Savings from Reliefs',
      value: formatCurrency(calculations.deductions.rentRelief * 0.25 + 
             (calculations.deductions.statutory.employeePension * 12) * 0.25),
      description: 'Estimated tax reduction from reliefs',
      benchmark: 'N/A',
      status: 'info'
    },
    {
      label: 'Monthly Cash Flow',
      value: formatCurrency(calculations.netPay),
      description: 'Actual monthly take-home',
      benchmark: 'N/A',
      status: 'info'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Efficiency Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            metric.status === 'good' ? 'bg-green-50 border-green-200' :
            metric.status === 'high' ? 'bg-yellow-50 border-yellow-200' :
            metric.status === 'low' ? 'bg-orange-50 border-orange-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900">{metric.label}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                metric.status === 'good' ? 'bg-green-100 text-green-800' :
                metric.status === 'high' ? 'bg-yellow-100 text-yellow-800' :
                metric.status === 'low' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {metric.benchmark}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Optimization Recommendations */}
      {/* <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Optimization Opportunities</h4>
        <div className="space-y-2 text-sm text-purple-800">
          <div>• Consider increasing pension contributions for additional tax relief</div>
          <div>• Ensure all rent payments are documented for maximum relief</div>
          <div>• Review NHIS coverage for potential health expense deductions</div>
          <div>• Explore approved investment schemes for additional reliefs</div>
        </div>
      </div> */}
    </div>
  );
};

export default TaxEfficiencyAnalysis;