import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const PayrollHistoryDetailsModal = ({ 
  payrollDetails, 
  isOpen, 
  onClose, 
  onExport,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');

  if (!isOpen || !payrollDetails) return null;

  const {
    _key,
    period,
    status,
    totalEmployees,
    totalGross,
    totalDeductions,
    totalNet,
    processedBy,
    processedAt,
    approvedBy,
    approvedAt,
    breakdown,
    employees = [],
    cycleType = 'monthly',
    cycleConfig
  } = payrollDetails;

  // Calculate percentages for visual representation
  const deductionPercentage = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;
  const netPercentage = totalGross > 0 ? (totalNet / totalGross) * 100 : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get cycle description
  const getCycleDescription = () => {
    const cycleMap = {
      monthly: 'Monthly',
      weekly: 'Weekly',
      'bi-weekly': 'Bi-weekly',
      'ad-hoc': 'Ad-hoc'
    };
    return cycleMap[cycleType] || 'Monthly';
  };

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport(_key, exportFormat);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payroll Run Details</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Period:</span>
                    <span className="text-sm font-semibold text-gray-900">{period}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Cycle:</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {getCycleDescription()}
                    </span>
                  </div>
                  <StatusBadge status={status} size="lg" showIcon={true} />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-8 px-6">
            {['overview', 'breakdown', 'employees', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' ? 'Overview' : 
                 tab === 'breakdown' ? 'Financial Breakdown' :
                 tab === 'employees' ? `Employees (${employees.length})` : 'Documents'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800">Total Employees</h3>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{totalEmployees}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800">Total Gross</h3>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatCurrency(totalGross)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h3 className="text-sm font-medium text-red-800">Total Deductions</h3>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {formatCurrency(totalDeductions)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-sm font-medium text-purple-800">Total Net Pay</h3>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {formatCurrency(totalNet)}
                  </p>
                </div>
              </div>

              {/* Financial Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Gross Pay</span>
                      <span>{formatCurrency(totalGross)} (100%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Deductions</span>
                      <span>{formatCurrency(totalDeductions)} ({deductionPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${deductionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Net Pay</span>
                      <span>{formatCurrency(totalNet)} ({netPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${netPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline and Processing Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Processed</p>
                        <p className="text-sm text-gray-500">by {processedBy || 'System'}</p>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(processedAt)}</p>
                    </div>
                    
                    {approvedAt && (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Approved</p>
                          <p className="text-sm text-gray-500">by {approvedBy || 'System'}</p>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(approvedAt)}</p>
                      </div>
                    )}
                    
                    {cycleConfig && (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Payroll Cycle</p>
                          <p className="text-sm text-gray-500">{cycleConfig.description}</p>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{cycleType}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Gross per Employee</span>
                      <span className="font-semibold">
                        {formatCurrency(totalEmployees > 0 ? totalGross / totalEmployees : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Net per Employee</span>
                      <span className="font-semibold">
                        {formatCurrency(totalEmployees > 0 ? totalNet / totalEmployees : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deduction Rate</span>
                      <span className="font-semibold">{deductionPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net to Gross Ratio</span>
                      <span className="font-semibold">{netPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="p-6 space-y-6">
              {/* Main Breakdown */}
              {breakdown && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Basic Salary</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">
                        {formatCurrency(breakdown.basicSalary)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Allowances</p>
                      <p className="text-xl font-bold text-green-900 mt-1">
                        {formatCurrency(breakdown.allowances)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Deductions</p>
                      <p className="text-xl font-bold text-red-900 mt-1">
                        {formatCurrency(breakdown.deductions)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Net Pay</p>
                      <p className="text-xl font-bold text-purple-900 mt-1">
                        {formatCurrency(breakdown.netPay)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Deduction Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Deductions</h3>
                <div className="space-y-4">
                  {/* This would come from actual deduction data */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">PAYE Tax</span>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(breakdown?.statutoryDeductions?.paye || totalDeductions * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Pension Contribution</span>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(breakdown?.statutoryDeductions?.pension || totalDeductions * 0.08)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">NHF Contribution</span>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(breakdown?.statutoryDeductions?.nhf || totalDeductions * 0.025)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Other Deductions</span>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(breakdown?.otherDeductions || totalDeductions * 0.1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.length > 0 ? (
                        employees.map((employee, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {employee.name || 'Unknown Employee'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {employee.employeeId || 'No ID'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee.department || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(employee.payrollData?.grossSalary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {formatCurrency(employee.payrollData?.totalDeductions)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              {formatCurrency(employee.payrollData?.netSalary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                status={employee.payrollData?.status || 'processed'} 
                                size="sm" 
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="mt-2 text-sm">No employee data available</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Documents</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Payroll Summary Report</p>
                      <p className="text-sm text-gray-600">Comprehensive payroll summary</p>
                    </div>
                    <button
                      onClick={handleExport}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Format:</span>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Available Reports</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Payroll Register</li>
                        <li>• Bank Payment File</li>
                        <li>• Tax Summary</li>
                        <li>• Department Breakdown</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Generated Documents</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex justify-between">
                          <span>Payslips</span>
                          <span className="text-green-600">Ready</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Tax Certificates</span>
                          <span className="text-green-600">Ready</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Bank File</span>
                          <span className="text-yellow-600">Pending</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Payroll ID: <span className="font-mono">{_key}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollHistoryDetailsModal;