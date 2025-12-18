// src/components/payroll/PayrollCycleSettings.jsx
import React from 'react';

const PayrollCycleSettings = ({ payrollCycle, onCycleChange, onReset }) => {
  const cycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'ad-hoc', label: 'Ad-hoc' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Payroll Cycle</h3>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="space-y-3">
        {cycles.map(({ value, label }) => (
          <label key={value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            <input
              type="radio"
              name="payrollCycle"
              value={value}
              checked={payrollCycle === value}
              onChange={(e) => onCycleChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="capitalize">{label}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium mb-1">Cycle Information:</p>
        <ul className="space-y-1">
          <li>• Monthly: Standard 12 periods per year</li>
          <li>• Weekly: 52 periods per year</li>
          <li>• Bi-weekly: 26 periods per year</li>
          <li>• Ad-hoc: Manual period creation</li>
        </ul>
      </div>
    </div>
  );
};

export default PayrollCycleSettings;