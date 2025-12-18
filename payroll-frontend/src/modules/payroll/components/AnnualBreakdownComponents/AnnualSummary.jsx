// src/components/payroll/AnnualBreakdownComponents/AnnualSummary.jsx
import React from 'react';

const AnnualSummary = ({ calculations, formatCurrency }) => {
  const annualGross = calculations.annualGrossEmolument;
  const annualTax = calculations.taxCalculation.annualTax;
  const annualNet = calculations.netPay * 12;
  const totalDeductions = annualGross - annualNet;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <p className="text-sm font-medium text-green-800">Annual Net Income</p>
        <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(annualNet)}</p>
        <p className="text-xs text-green-600 mt-1">
          {((annualNet / annualGross) * 100).toFixed(1)}% of gross
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-sm font-medium text-blue-800">Annual Gross Income</p>
        <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(annualGross)}</p>
        <p className="text-xs text-blue-600 mt-1">Taxable Base</p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <p className="text-sm font-medium text-red-800">Annual Tax Paid</p>
        <p className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(annualTax)}</p>
        <p className="text-xs text-red-600 mt-1">
          {((annualTax / annualGross) * 100).toFixed(1)}% effective rate
        </p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <p className="text-sm font-medium text-purple-800">Total Deductions</p>
        <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(totalDeductions)}</p>
        <p className="text-xs text-purple-600 mt-1">
          {((totalDeductions / annualGross) * 100).toFixed(1)}% of income
        </p>
      </div>
    </div>
  );
};

export default AnnualSummary;