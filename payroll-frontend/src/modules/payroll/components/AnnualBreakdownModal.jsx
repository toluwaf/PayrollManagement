// src/components/payroll/AnnualBreakdownModal.jsx
import React from 'react';
import AnnualSummary from './AnnualBreakdownComponents/AnnualSummary';
import IncomeComposition from './AnnualBreakdownComponents/IncomeComposition';
import ReliefsAnalysis from './AnnualBreakdownComponents/ReliefsAnalysis';
import TaxBandVisualization from './AnnualBreakdownComponents/TaxBandVisualization';
import AnnualDeductions from './AnnualBreakdownComponents/AnnualDeductions';
import TaxEfficiencyAnalysis from './AnnualBreakdownComponents/TaxEfficiencyAnalysis';
import YTDProjectionSection from './AnnualBreakdownComponents/YTDProjectionSection';

const AnnualBreakdownModal = ({ calculations, projection, onClose }) => {
  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Annual Tax Breakdown 2026</h2>
            <p className="text-sm text-gray-600">
              {calculations.employee.name} • {calculations.employee.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* 1. Annual Summary */}
          <AnnualSummary calculations={calculations} formatCurrency={formatCurrency} />
          
          {/* 2. Income Composition */}
          <IncomeComposition calculations={calculations} formatCurrency={formatCurrency} />
          
          {/* 3. Reliefs Analysis */}
          <ReliefsAnalysis calculations={calculations} formatCurrency={formatCurrency} />
          
          {/* 4. Tax Band Visualization */}
          <TaxBandVisualization calculations={calculations} formatCurrency={formatCurrency} />
          
          {/* 5. Annual Deductions */}
          <AnnualDeductions calculations={calculations} formatCurrency={formatCurrency} />
          
          {/* 6. Tax Efficiency Analysis */}
          <TaxEfficiencyAnalysis calculations={calculations} formatCurrency={formatCurrency} />

          {/* 7. Year-to-Date predictions */}
         {projection && <YTDProjectionSection projection={projection} formatCurrency={formatCurrency} />}
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Generated on {new Date().toLocaleDateString()} • NTA 2025 Compliant
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Print Report
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualBreakdownModal;