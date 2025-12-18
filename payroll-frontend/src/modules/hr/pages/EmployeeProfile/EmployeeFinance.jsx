import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeFinance = () => {
  const { employee } = useOutletContext();
  const [financeData, setFinanceData] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadFinanceData();
  }, [employee._key]);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Load payroll summary and history in parallel
      const [payrollResponse, historyResponse] = await Promise.all([
        employeeService.getEmployeePayrollSummary(employee._key),
        employeeService.getEmployeePayrollHistory(employee._key, { limit: 12 })
      ]);

      if (payrollResponse.success) {
        setFinanceData(payrollResponse.data);
      }
      
      if (historyResponse.success) {
        setPayrollHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
      // Fallback to employee's basic salary data
      setFinanceData({
        employee: employee,
        summary: {
          ytdEarnings: employee.salary * 12, // Estimate
          ytdDeductions: 0,
          ytdNet: employee.salary * 12,
          averageMonthly: employee.salary,
          lastPayPeriod: new Date().toISOString().slice(0, 7),
          lastNetSalary: employee.salary
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const calculateTotalSalary = () => {
    if (!employee) return 0;
    return (
      (employee.basicSalary || 0) +
      (employee.housingAllowance || 0) +
      (employee.transportAllowance || 0) +
      (employee.mealAllowance || 0) +
      (employee.utilityAllowance || 0) +
      (employee.entertainmentAllowance || 0) +
      (employee.otherAllowances || 0)
    );
  };

  const getSalaryBreakdown = () => {
    return {
      basicSalary: employee.basicSalary || 0,
      housingAllowance: employee.housingAllowance || 0,
      transportAllowance: employee.transportAllowance || 0,
      mealAllowance: employee.mealAllowance || 0,
      utilityAllowance: employee.utilityAllowance || 0,
      entertainmentAllowance: employee.entertainmentAllowance || 0,
      otherAllowances: employee.otherAllowances || 0,
      total: calculateTotalSalary()
    };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const salaryBreakdown = getSalaryBreakdown();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Information</h1>
          <p className="text-gray-600">Salary structure, banking details, and payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Salary Structure</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(salaryBreakdown).map(([key, value]) => {
                if (key === 'total') return null; // Handle total separately
                
                const percentage = salaryBreakdown.total ? ((value / salaryBreakdown.total) * 100).toFixed(1) : 0;
                
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900">{formatCurrency(value)}</span>
                      <span className="text-xs text-gray-500 w-12 text-right">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Monthly Salary:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(salaryBreakdown.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Bank Account Details</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <p className={`p-2 rounded-lg ${
                  employee.bankName 
                    ? 'bg-gray-50 text-gray-900' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {employee.bankName || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <p className={`p-2 rounded-lg font-mono ${
                  employee.bankAccount 
                    ? 'bg-gray-50 text-gray-900' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {employee.bankAccount || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <p className="p-2 bg-gray-50 text-gray-900 rounded-lg capitalize">
                  {employee.accountType || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
                <p className="p-2 bg-gray-50 text-gray-900 rounded-lg">
                  {employee.bankCode || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* YTD Summary */}
        {financeData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Year-to-Date Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financeData.summary?.ytdEarnings || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(financeData.summary?.ytdNet || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Net Income</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(financeData.summary?.ytdDeductions || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Deductions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(financeData.summary?.averageMonthly || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Monthly</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payment History</h2>
          </div>
          <div className="p-6">
            {payrollHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.grossSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.totalDeductions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(payment.netSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.processedAt ? new Date(payment.processedAt).toLocaleDateString() : 'Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                <p className="text-gray-500">Payment records will appear here after payroll processing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFinance;