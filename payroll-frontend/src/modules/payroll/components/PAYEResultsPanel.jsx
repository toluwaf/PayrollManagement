// src/components/payroll/PAYEResultsPanel.jsx
import React from 'react';

const PAYEResultsPanel = ({ calculations, payeSettings, onShowAnnualBreakdown, formatCurrency }) => {
  return (
    <div className="space-y-6">
      {/* Settings Info Banner */}
      {payeSettings && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-800">
              Using configured Tax Year {payeSettings.taxYear} settings
            </span>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm font-medium text-green-800">Take Home Pay</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            {formatCurrency(calculations.netPay)}
          </p>
          <p className="text-xs text-green-600 mt-1">Monthly</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-800">Gross Salary</p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {formatCurrency(calculations.grossEmolument)}
          </p>
          <p className="text-xs text-blue-600 mt-1">Monthly</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm font-medium text-red-800">Total Deductions</p>
          <p className="text-xl font-bold text-red-900 mt-1">
            {formatCurrency(calculations.deductions.totalMonthlyDeductions)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {((calculations.deductions.totalMonthlyDeductions / calculations.grossEmolument) * 100).toFixed(1)}% of gross
          </p>
        </div>
      </div>

      {/* Tax Band Breakdown */}
      {calculations.taxCalculation.taxBreakdown && calculations.taxCalculation.taxBreakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">2026 Tax Band Calculation</h4>
          <div className="space-y-3">
            {calculations.taxCalculation.taxBreakdown.map((band, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{band.band}</div>
                  <div className="text-gray-500 text-xs">{band.rate} tax rate</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-600">{formatCurrency(band.taxableAmount)}</div>
                  <div className="text-red-600 font-semibold">{formatCurrency(band.tax)}</div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Annual Tax</span>
                <span className="text-red-600">
                  {formatCurrency(calculations.taxCalculation.annualTax)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>Monthly Equivalent</span>
                <span>{formatCurrency(calculations.taxCalculation.monthlyTax)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onShowAnnualBreakdown}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View Annual Breakdown
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default PAYEResultsPanel;