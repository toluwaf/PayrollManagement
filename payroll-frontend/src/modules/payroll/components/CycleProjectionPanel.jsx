// src/components/payroll/CycleProjectionPanel.jsx
import React from 'react';

const CycleProjectionPanel = ({ projection, formData, calculations, formatCurrency }) => {
  const isFullYear = projection.completionPercentage === 100;
  
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isFullYear ? 'Annual Summary' : 'Year-to-Date Projection'}
      </h3>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Progress This Year</h4>
            <p className="text-sm text-gray-600">
              {projection.monthsWorked.toFixed(1)} of 12 months completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {projection.completionPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Year completed</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${projection.completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* YTD vs Projection Comparison */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Year-to-Date Column */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Year-to-Date ({projection.monthsWorked.toFixed(1)} {projection.monthsWorked === 1 ? 'month' : 'months'})
          </h5>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Income:</span>
              <span className="font-semibold">{formatCurrency(projection.ytdGross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Paid:</span>
              <span className="font-semibold text-red-600">{formatCurrency(projection.ytdTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Income:</span>
              <span className="font-semibold text-green-600">{formatCurrency(projection.ytdNet)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {projection.monthsWorked < 12 ? (
                <span>Remaining: {projection.remainingMonths.toFixed(1)} months</span>
              ) : (
                <span className="text-green-600">✓ Year completed</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Projected Annual Column */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            Projected Full Year
          </h5>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Gross:</span>
              <span className="font-semibold">{formatCurrency(projection.projectedAnnual.gross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Tax:</span>
              <span className="font-semibold text-red-600">{formatCurrency(projection.projectedAnnual.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Net:</span>
              <span className="font-semibold text-green-600">{formatCurrency(projection.projectedAnnual.net)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm">
              <div className="text-gray-500">Monthly average:</div>
              <div className="flex justify-between mt-1">
                <span>Gross:</span>
                <span>{formatCurrency(projection.projectedAnnual.gross / 12)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(projection.projectedAnnual.tax / 12)}</span>
              </div>
              <div className="flex justify-between">
                <span>Net:</span>
                <span>{formatCurrency(projection.projectedAnnual.net / 12)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cycle Breakdown */}
      <div className="bg-gray-50 rounded-lg p-5">
        <h5 className="font-semibold text-gray-900 mb-4">Cycle Breakdown</h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Per Month</div>
            <div className="mt-2 space-y-1">
              <div className="text-lg font-semibold">{formatCurrency(calculations.grossEmolument)}</div>
              <div className="text-sm text-gray-600">Gross</div>
            </div>
            <div className="mt-1 space-y-1">
              <div className="text-red-600 font-medium">{formatCurrency(calculations.taxCalculation.monthlyTax)}</div>
              <div className="text-sm text-gray-600">Tax</div>
            </div>
            <div className="mt-1 space-y-1">
              <div className="text-green-600 font-medium">{formatCurrency(calculations.netPay)}</div>
              <div className="text-sm text-gray-600">Net</div>
            </div>
          </div>
          
          {formData.payrollCycle === 'weekly' && (
            <div className="text-center">
              <div className="text-sm text-gray-500">Per Week</div>
              <div className="mt-2 space-y-1">
                <div className="text-lg font-semibold">{formatCurrency(calculations.grossEmolument / 4.33)}</div>
                <div className="text-sm text-gray-600">Gross</div>
              </div>
              <div className="mt-1 space-y-1">
                <div className="text-red-600 font-medium">{formatCurrency(calculations.taxCalculation.monthlyTax / 4.33)}</div>
                <div className="text-sm text-gray-600">Tax</div>
              </div>
              <div className="mt-1 space-y-1">
                <div className="text-green-600 font-medium">{formatCurrency(calculations.netPay / 4.33)}</div>
                <div className="text-sm text-gray-600">Net</div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Per Year</div>
            <div className="mt-2 space-y-1">
              <div className="text-lg font-semibold">{formatCurrency(calculations.annualGrossEmolument)}</div>
              <div className="text-sm text-gray-600">Gross</div>
            </div>
            <div className="mt-1 space-y-1">
              <div className="text-red-600 font-medium">{formatCurrency(calculations.taxCalculation.annualTax)}</div>
              <div className="text-sm text-gray-600">Tax</div>
            </div>
            <div className="mt-1 space-y-1">
              <div className="text-green-600 font-medium">{formatCurrency(calculations.annualGrossEmolument - calculations.taxCalculation.annualTax)}</div>
              <div className="text-sm text-gray-600">Net</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Effective Tax Rate */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Effective Tax Rate</div>
          <div className="text-lg font-semibold text-gray-900">
            {calculations.taxCalculation.effectiveTaxRate.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tax Efficiency</div>
          <div className={`text-lg font-semibold ${
            calculations.taxCalculation.effectiveTaxRate < 10 ? 'text-green-600' :
            calculations.taxCalculation.effectiveTaxRate < 20 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {calculations.taxCalculation.effectiveTaxRate < 10 ? 'Highly Efficient' :
             calculations.taxCalculation.effectiveTaxRate < 20 ? 'Moderate' : 'Less Efficient'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleProjectionPanel;