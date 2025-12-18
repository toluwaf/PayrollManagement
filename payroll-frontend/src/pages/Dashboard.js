import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { reportsService } from '../services/reportsService';
import { payrollService } from '../services/payrollService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
    metrics: {},
    payrollTrends: [],
    departmentBreakdown: [],
    loading: true
  });

  const [recentPayroll, setRecentPayroll] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadRecentPayroll();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      const [metricsResponse, payrollSummaryResponse] = await Promise.all([
        reportsService.getDashboardMetrics(),
        reportsService.getPayrollSummary({ 
          startDate: '2023-07', 
          endDate: '2023-11' 
        })
      ]);

      if (metricsResponse.success) {
        setDashboardData(prev => ({
          ...prev,
          metrics: metricsResponse.data,
          payrollTrends: payrollSummaryResponse.success ? payrollSummaryResponse.data : [],
          loading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadRecentPayroll = async () => {
    try {
      const response = await payrollService.getAllPayrollRuns({}, { page: 1, limit: 5 });
      if (response.success) {
        setRecentPayroll(response.data);
      }
    } catch (error) {
      console.error('Failed to load recent payroll:', error);
    }
  };

  // Payroll Distribution Chart Data
  const payrollData = {
    labels: ['Basic Salary', 'Housing', 'Transport', 'Entertainment', 'Meal Subsidy', 'Medical'],
    datasets: [{
      data: [65, 10, 8, 5, 7, 5],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'],
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  // Departmental Expenses Chart Data
  const departmentData = {
    labels: dashboardData.departmentBreakdown.map(dept => dept.department) || ['Engineering', 'Finance', 'HR', 'Operations', 'Sales', 'IT'],
    datasets: [{
      label: 'Monthly Expense (₦)',
      data: dashboardData.departmentBreakdown.map(dept => dept.totalGross) || [12500000, 8500000, 6500000, 10500000, 9500000, 7500000],
      backgroundColor: '#3B82F6',
    }]
  };

  const departmentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₦ ' + (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { class: 'bg-green-100 text-green-800', text: 'Completed' },
      'processed': { class: 'bg-green-100 text-green-800', text: 'Completed' },
      'pending_approval': { class: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' },
      'pending': { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'approved': { class: 'bg-blue-100 text-blue-800', text: 'Approved' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`px-2 py-1 ${config.class} text-xs rounded-full`}>{config.text}</span>;
  };

  if (dashboardData.loading) {
    return (
      <div className="p-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-5">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <h3 className="text-2xl font-bold">{dashboardData.metrics.totalEmployees?.toLocaleString() || '0'}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-xs mt-2"><span className="font-bold">+5.2%</span> from last month</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Monthly Payroll</p>
              <h3 className="text-2xl font-bold">₦ {(dashboardData.metrics.monthlyPayroll / 1000000)?.toFixed(1) || '0'}M</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-xs mt-2"><span className="font-bold">+12.4%</span> from last month</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Pending Approvals</p>
              <h3 className="text-2xl font-bold">{dashboardData.metrics.pendingApprovals?.toLocaleString() || '0'}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-red-500 text-xs mt-2"><span className="font-bold">-3</span> from last week</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Active Payrolls</p>
              <h3 className="text-2xl font-bold">{dashboardData.metrics.activePayrolls?.toLocaleString() || '0'}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-500 text-xs mt-2"><span className="font-bold">98%</span> compliance rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-5">Payroll Distribution</h3>
          <div className="h-64">
            <Doughnut data={payrollData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-5">Departmental Expenses</h3>
          <div className="h-64">
            <Bar data={departmentData} options={departmentOptions} />
          </div>
        </div>
      </div>

      {/* Recent Payroll Runs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Recent Payroll Runs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayroll.map((payroll) => (
                <tr key={payroll._key}>
                  <td className="px-6 py-4 whitespace-nowrap">{payroll._key}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payroll.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payroll.totalEmployees?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payroll.totalNet ? formatCurrency(payroll.totalNet) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payroll.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    <button className="mr-3 hover:underline">View</button>
                    <button className="hover:underline">Export</button>
                  </td>
                </tr>
              ))}
              {recentPayroll.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No payroll runs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-5">Upcoming Tasks</h3>
          <ul>
            <li className="mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <p className="font-medium">December Payroll Processing</p>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Due tomorrow</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Process payroll for all employees</p>
            </li>
            <li className="mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <p className="font-medium">PAYE Remittance</p>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Due in 5 days</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Remit PAYE to FIRS for November</p>
            </li>
            <li>
              <div className="flex justify-between">
                <p className="font-medium">Pension Contributions</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Due in 7 days</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Remit pension contributions for November</p>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-5">System Notifications</h3>
          <ul>
            <li className="mb-4 pb-4 border-b">
              <div className="flex">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">System Update</p>
                  <p className="text-sm text-gray-500">Backend API integrated successfully</p>
                  <p className="text-xs text-gray-400 mt-1">Just now</p>
                </div>
              </div>
            </li>
            <li className="mb-4 pb-4 border-b">
              <div className="flex">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Database Connected</p>
                  <p className="text-sm text-gray-500">ArangoDB connection established</p>
                  <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </div>
              </div>
            </li>
            <li>
              <div className="flex">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Sample Data Loaded</p>
                  <p className="text-sm text-gray-500">Mock employees and payroll data imported</p>
                  <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
