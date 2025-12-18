import React, { useState, useEffect } from 'react';

const PayrollRunModal = ({ 
  isOpen, 
  onClose, 
  onRunPayroll, 
  employees = [], 
  payrollPeriods = [], 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    period: '',
    employeeIds: [],
    cycleType: 'monthly',
    includeStatutory: true,
    approvalRequired: true,
    adjustments: []
  });

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && payrollPeriods.length > 0) {
      setFormData(prev => ({
        ...prev,
        period: payrollPeriods[0].value
      }));
    }
  }, [isOpen, payrollPeriods]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payrollData = {
      ...formData,
      employeeIds: selectedEmployees.length > 0 ? selectedEmployees : employees.map(emp => emp._key)
    };

    onRunPayroll(payrollData);
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp._key));
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlySalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const selectedCount = selectedEmployees.length;
  const allSelected = selectedCount === employees.length && employees.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Run New Payroll</h2>
            <p className="text-sm text-gray-600 mt-1">
              Process payroll for selected employees and period
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payroll Period *
              </label>
              <select
                required
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a period</option>
                {payrollPeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payroll Cycle
              </label>
              <select
                value={formData.cycleType}
                onChange={(e) => setFormData(prev => ({ ...prev, cycleType: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="ad-hoc">Ad-hoc</option>
              </select>
            </div>

            {/* Employee Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Employees ({selectedCount} of {employees.length} selected)
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllEmployees}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search employees by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Employee List */}
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No employees found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredEmployees.map(employee => (
                      <div
                        key={employee._key}
                        className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee._key)}
                          onChange={() => toggleEmployeeSelection(employee._key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {employee.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {employee.employeeId} • {employee.department} • {employee.position}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ₦{(employee.salary || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Monthly</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeStatutory}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeStatutory: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Include Statutory Deductions (PAYE, Pension, NHF)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.approvalRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Require Approval Before Payment
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Payroll Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Employees</p>
                  <p className="font-semibold">
                    {selectedCount > 0 ? selectedCount : employees.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Gross</p>
                  <p className="font-semibold">
                    ₦{totalMonthlySalary.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Cycle Type</p>
                  <p className="font-semibold capitalize">{formData.cycleType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-semibold">
                    {payrollPeriods.find(p => p.value === formData.period)?.display || 'Not selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || employees.length === 0}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                loading || employees.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Process Payroll'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollRunModal;