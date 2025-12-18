import React, { useState, useEffect } from 'react';
import { payrollService } from '../../../services/payrollService';
import PayrollHistoryDetailsModal from '../components/PayrollHistoryDetailsModal';

const PayrollHistory = () => {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    period: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPayrollHistory();
  }, [filters]);

  const loadPayrollHistory = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getPayrollHistory(filters);
      if (response.success) {
        setPayrollRuns(response.data);
        setSummary(response.summary || {});
      } else {
        console.error('Failed to load payroll history:', response.message);
      }
    } catch (error) {
      console.error('Failed to load payroll history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (period = '') => {
    setExporting(true);
    try {
      const response = await payrollService.exportPayrollHistory(period);
      if (!response.success) {
        alert(`Export failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  
  const handleViewDetails = async (payrollId) => {
    try {
      const response = await payrollService.getPayrollRunById(payrollId);
      if (response.success) {
        setSelectedPayroll(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch payroll details:', error);
    }
  };

  const handleExportPayroll = async (payrollId, format) => {
    setExporting(true);
    try {
      const response = await payrollService.exportPayrollRun(payrollId, format);
      if (response.success) {
        // Handle successful export (download file, show notification, etc.)
        console.log('Export successful:', response.data);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

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

  // Generate recent periods for filter
  const recentPeriods = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const display = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    return { value: period, display };
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll History</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => handleExport()}
            disabled={exporting}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
              exporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {exporting ? 'Exporting...' : 'Export All'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Runs</h3>
          <p className="text-2xl font-bold">{summary.totalRuns || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Processed</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {summary.processedCount || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {summary.approvedCount || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Paid</h3>
          <p className="text-2xl font-bold text-blue-600">
            {summary.paidCount || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex space-x-4">
          <select 
            className="border rounded-lg px-3 py-2"
            value={filters.period}
            onChange={(e) => setFilters({...filters, period: e.target.value})}
          >
            <option value="">All Periods</option>
            {recentPeriods.map(period => (
              <option key={period.value} value={period.value}>
                {period.display}
              </option>
            ))}
          </select>
          <select 
            className="border rounded-lg px-3 py-2"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="processed">Processed</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Payroll History Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Payroll Runs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : payrollRuns.length > 0 ? (
                payrollRuns.map((payroll) => (
                  <tr key={payroll._key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payroll.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.totalEmployees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{(payroll.totalGross || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -₦{(payroll.totalDeductions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₦{(payroll.totalNet || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payroll.processedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(payroll._key)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleExport(payroll.period)}
                        disabled={exporting}
                        className={`text-green-600 hover:text-green-900 ${
                          exporting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No payroll runs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Details Modal */}
          <PayrollHistoryDetailsModal
            payrollDetails={selectedPayroll}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onExport={handleExportPayroll}
            loading={exporting}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollHistory;