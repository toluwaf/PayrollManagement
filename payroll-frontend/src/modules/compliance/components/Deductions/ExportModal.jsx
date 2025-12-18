// src/components/Deductions/ExportModal.jsx
import React, { useState } from 'react';
import { deductionsService } from '../../../../services/deductionsService';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  period 
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportType, setExportType] = useState('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setExporting(true);

      let exportParams = {
        format: exportFormat,
        type: exportType,
        includeDetails,
        includeSummary
      };

      // For now, we'll use the service method. In a real implementation,
      // you might need to adjust the backend to handle these parameters
      const response = await deductionsService.exportDeductions(period, exportFormat);

      if (response.success) {
        // Create a blob and download the file
        const blob = new Blob([response.data], { 
          type: getContentType(exportFormat) 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `deductions-${period}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(`Deductions exported successfully as ${exportFormat.toUpperCase()}!`);
        onClose();
      } else {
        alert(`Failed to export deductions: ${response.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export deductions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getContentType = (format) => {
    const contentTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };
    return contentTypes[format] || 'application/pdf';
  };

  const getFormatDescription = (format) => {
    const descriptions = {
      pdf: 'Best for printing and formal reports',
      excel: 'Ideal for data analysis and further processing',
      csv: 'Simple format for data import into other systems'
    };
    return descriptions[format] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Export Deductions</h2>
              <p className="text-gray-600">Period: {period}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'pdf', label: 'PDF', icon: '📄' },
                  { value: 'excel', label: 'Excel', icon: '📊' },
                  { value: 'csv', label: 'CSV', icon: '📋' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{format.icon}</div>
                    <div className="text-sm font-medium">{format.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getFormatDescription(exportFormat)}
              </p>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Deductions', description: 'Complete deduction details for all employees' },
                  { value: 'paye', label: 'PAYE Only', description: 'PAYE tax computations and summaries' },
                  { value: 'pension', label: 'Pension Only', description: 'Employee and employer pension contributions' },
                  { value: 'nhf', label: 'NHF Only', description: 'National Housing Fund deductions' },
                  { value: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance summary' }
                ].map((type) => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      value={type.value}
                      checked={exportType === type.value}
                      onChange={(e) => setExportType(e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include employee details</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include summary and totals</span>
              </label>
            </div>

            {/* Preview Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Export Preview</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Format: {exportFormat.toUpperCase()}</div>
                <div>• Content: {exportType.replace(/_/g, ' ').toUpperCase()}</div>
                <div>• Period: {period}</div>
                {includeDetails && <div>• Includes employee breakdown</div>}
                {includeSummary && <div>• Includes summary reports</div>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              disabled={exporting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${
                exporting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {exporting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Deductions
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;