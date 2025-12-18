import React, { useState, useEffect, useCallback } from 'react';
import { Link} from 'react-router-dom';
import { payrollService } from '../../../services/payrollService';
import { employeeService } from '../../../services/employeeService';
import { useSettings } from '../../../context/SettingsContext';
import PayrollDetailsModal from '../components/PayrollDetailsModal';
import PAYECalculatorModal from '../components/PAYECalculatorModal';
import PayrollRunModal from '../components/PayrollRunModal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const Payroll = () => {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [loading, setLoading] = useState({
    payroll: false,
    employees: false,
    processing: false,
    approving: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [payrollDetails, setPayrollDetails] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // Filters and search
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Use settings from context
  const { payrollSettings, payeSettings, loading: settingsLoading } = useSettings();
  
  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    await Promise.all([
      loadPayrollRuns(),
      loadEmployees(),
      generatePayrollPeriods()
    ]);
  };

  const generatePayrollPeriods = () => {
    const periods = [];
    const currentDate = new Date();
    
    // Generate last 12 months in YYYY-MM format
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const display = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      periods.push({ value: period, display });
    }
    
    setPayrollPeriods(periods);
    // Set default to current month
    if (periods.length > 0) {
      setSelectedPeriod(periods[0].value);
    }
  };

  const loadPayrollRuns = async () => {
    setLoading(prev => ({ ...prev, payroll: true }));
    try {
      const response = await payrollService.getAllPayrollRuns();
      if (response.success) {
        const mappedPayrollRuns = response.data.map(payroll => ({
          id: payroll._key,
          period: payroll.period,
          employees: payroll.totalEmployees || 0,
          totalAmount: payroll.totalNet || 0,
          status: payroll.status,
          processedAt: payroll.processedAt,
          approvedAt: payroll.approvedAt,
          _raw: payroll
        }));
        setPayrollRuns(mappedPayrollRuns);
      }
    } catch (error) {
      console.error('Failed to load payroll runs:', error);
      setError('Failed to load payroll runs');
    } finally {
      setLoading(prev => ({ ...prev, payroll: false }));
    }
  };

  const loadEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const handleRunPayroll = async (payrollData) => {
    setLoading(prev => ({ ...prev, processing: true }));
    setError(null);
    setSuccess(null);

    try {
      const enhancedPayrollData = {
        ...payrollData,
        settingsInfo: {
          taxYear: payeSettings?.taxYear,
          bracketsCount: payeSettings?.taxBrackets?.length,
          payrollCycle: payrollSettings?.payrollCycle
        }
      };

      const response = await payrollService.processPayroll(enhancedPayrollData);

      if (response.success) {
        setSuccess('Payroll processed successfully!');
        setShowRunModal(false);
        await loadPayrollRuns();
      } else {
        setError(response.message || 'Failed to process payroll');
      }
    } catch (error) {
      console.error('Failed to process payroll:', error);
      setError('Failed to process payroll. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    setLoading(prev => ({ ...prev, approving: true }));
    try {
      const response = await payrollService.approvePayroll(payrollId);
      
      if (response.success) {
        setSuccess('Payroll approved successfully!');
        setShowPayrollModal(false);
        await loadPayrollRuns();
      } else {
        setError(response.message || 'Failed to approve payroll');
      }
    } catch (error) {
      console.error('Failed to approve payroll:', error);
      setError('Failed to approve payroll. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, approving: false }));
    }
  };

  const handleViewPayroll = async (payrollId) => {
    try {
      const response = await payrollService.getPayrollRunById(payrollId);
      if (response.success) {
        setPayrollDetails(response.data);
        setShowPayrollModal(true);
      } else {
        setError('Failed to fetch payroll details');
      }
    } catch (error) {
      console.error('Failed to fetch payroll details:', error);
      setError('Failed to fetch payroll details. Please try again.');
    }
  };

  const handleExportPayroll = async (payrollId, format = 'csv') => {
    try {
      const response = await payrollService.exportPayroll(payrollId, format);
      if (response.success) {
        setSuccess(`Payroll exported successfully as ${format.toUpperCase()}`);
      } else {
        setError('Failed to export payroll');
      }
    } catch (error) {
      console.error('Failed to export payroll:', error);
      setError('Failed to export payroll. Please try again.');
    }
  };

  const filteredPayrollRuns = payrollRuns.filter(payroll => {
    const matchesStatus = !filters.status || payroll.status === filters.status;
    const matchesSearch = !filters.search || 
      payroll.period.includes(filters.search) ||
      payroll.id.includes(filters.search);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    monthlyPayroll: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0),
    pendingApprovals: payrollRuns.filter(p => p.status === 'processed').length
  };

  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearNotifications, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payroll Processing</h1>
          <p className="text-gray-600 mt-2">Manage and process employee payroll</p>
                    
          {/* Current Settings Info */}
          {payeSettings && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
              <div className="flex items-center text-sm text-green-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Using Tax Year {payeSettings.taxYear} settings • {payeSettings.taxBrackets?.length} tax brackets
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="mb-6 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
              <button onClick={clearNotifications} className="text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700">{success}</span>
              </div>
              <button onClick={clearNotifications} className="text-green-400 hover:text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h1m-1 0h-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{stats.monthlyPayroll.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Run Payroll Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Run New Payroll</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Process payroll for selected employees and period
            </p>
            <button 
              onClick={() => setShowRunModal(true)}
              disabled={loading.employees || employees.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading.employees || employees.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading.employees ? 'Loading...' : 'Run Payroll'}
            </button>
          </div>

          {/* PAYE Calculator Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">PAYE Calculator</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Calculate tax deductions for employees
            </p>
            <button 
              onClick={() => setShowCalculator(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Open Calculator
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <Link 
                to="/payroll/settings"
                className="block w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Payroll Settings
              </Link>
              <button className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Generate Reports
              </button>
              <button className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                View Payroll Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Payroll Runs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Payroll Runs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredPayrollRuns.length} of {payrollRuns.length} runs
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search payroll..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Status Filter */}
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading.payroll ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayrollRuns.map((payroll) => (
                    <PayrollRunRow
                      key={payroll.id}
                      payroll={payroll}
                      onView={handleViewPayroll}
                      onApprove={handleApprovePayroll}
                      onExport={handleExportPayroll}
                      loading={loading}
                    />
                  ))}
                </tbody>
              </table>
            )}

            {!loading.payroll && filteredPayrollRuns.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll runs</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by running your first payroll.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowRunModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Run Payroll
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <PayrollRunModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        onRunPayroll={handleRunPayroll}
        employees={employees}
        payrollPeriods={payrollPeriods}
        loading={loading.processing}
      />

      <PayrollDetailsModal
        payrollDetails={payrollDetails}
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        onApprove={handleApprovePayroll}
        loading={loading.approving}
      />

      <PAYECalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </div>
  );
};

// Payroll Run Row Component
const PayrollRunRow = ({ payroll, onView, onApprove, onExport, loading }) => {
  const canApprove = payroll.status === 'processed';
  const canExport = ['approved', 'paid'].includes(payroll.status);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{payroll.period}</div>
          <div className="text-sm text-gray-500">ID: {payroll.id}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {payroll.employees}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₦{payroll.totalAmount.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={payroll.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(payroll.processedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(payroll.id)}
            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            View
          </button>
          
          {canApprove && (
            <button
              onClick={() => onApprove(payroll.id)}
              disabled={loading.approving}
              className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          )}
          
          {canExport && (
            <button
              onClick={() => onExport(payroll.id)}
              className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Export
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default Payroll;