// src/components/Payroll/PayrollDetailsModal.jsx
import React from 'react';

const PayrollDetailsModal = ({ 
  payrollDetails, 
  isOpen, 
  onClose, 
  onApprove,
  processing = false 
}) => {
  if (!isOpen || !payrollDetails) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'processed': { color: 'bg-yellow-100 text-yellow-800', label: 'Processed' },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'paid': { color: 'bg-blue-100 text-blue-800', label: 'Paid' },
      'failed': { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.processed;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Payroll Run Details</h2>
              <p className="text-gray-600">Period: {payrollDetails.period}</p>
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

          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">
                {getStatusBadge(payrollDetails.status)}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Processed By</p>
              <p className="font-semibold">{payrollDetails.processedBy || 'System'}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Processed Date</p>
              <p className="font-semibold">
                {new Date(payrollDetails.processedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Total Employees</h3>
              <p className="text-2xl font-bold text-blue-900">{payrollDetails.totalEmployees || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Total Gross</h3>
              <p className="text-2xl font-bold text-green-900">
                ₦{(payrollDetails.totalGross || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm font-medium text-red-800">Total Deductions</h3>
              <p className="text-2xl font-bold text-red-900">
                ₦{(payrollDetails.totalDeductions || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Total Net</h3>
              <p className="text-2xl font-bold text-purple-900">
                ₦{(payrollDetails.totalNet || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Breakdown Section */}
          {payrollDetails.breakdown && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Payroll Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-3 bg-white">
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <p className="font-semibold">
                    ₦{(payrollDetails.breakdown.basicSalary || 0).toLocaleString()}
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-white">
                  <p className="text-sm text-gray-600">Allowances</p>
                  <p className="font-semibold">
                    ₦{(payrollDetails.breakdown.allowances || 0).toLocaleString()}
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-white">
                  <p className="text-sm text-gray-600">Deductions</p>
                  <p className="font-semibold">
                    ₦{(payrollDetails.breakdown.deductions || 0).toLocaleString()}
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-white">
                  <p className="text-sm text-gray-600">Net Pay</p>
                  <p className="font-semibold">
                    ₦{(payrollDetails.breakdown.netPay || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Employee Breakdown</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollDetails.employees && payrollDetails.employees.length > 0 ? (
                    payrollDetails.employees.map((employee, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-sm">{employee.name}</p>
                            <p className="text-gray-500 text-xs">{employee.employeeId}</p>
                            <p className="text-gray-400 text-xs">{employee.department} • {employee.position}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          ₦{(employee.payrollData?.grossSalary || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                          -₦{(employee.payrollData?.totalDeductions || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                          ₦{(employee.payrollData?.netSalary || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2">No employee details available</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {payrollDetails.status === 'processed' && (
              <button
                onClick={() => onApprove(payrollDetails._key)}
                disabled={processing}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processing ? 'Approving...' : 'Approve Payroll'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;