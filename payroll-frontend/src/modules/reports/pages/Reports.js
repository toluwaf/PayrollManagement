import React, { useState } from 'react';
import { reportsData, mockPayrollRuns, employeeDeductions } from '../../../data/mockData';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('payroll-summary');
  const [dateRange, setDateRange] = useState('last-6-months');

  // Payroll Summary Chart
  const payrollSummaryData = {
    labels: reportsData.payrollSummary.labels,
    datasets: [
      {
        label: 'Monthly Payroll (₦)',
        data: reportsData.payrollSummary.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      }
    ]
  };

  // Department Breakdown Chart
  const departmentBreakdownData = {
    labels: Object.keys(reportsData.departmentBreakdown),
    datasets: [
      {
        label: 'Department Expenses',
        data: Object.values(reportsData.departmentBreakdown),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'
        ],
      }
    ]
  };

  // Deduction Analysis Chart
  const deductionAnalysisData = {
    labels: ['PAYE', 'Pension', 'NHF', 'NSITF'],
    datasets: [
      {
        label: 'Deductions Breakdown',
        data: [1250000, 637500, 212500, 85000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      }
    ]
  };

  const exportReport = (format) => {
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}`);
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <select 
            className="border rounded-lg p-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
            <option value="ytd">Year to Date</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          className={`p-4 rounded-lg border-2 ${
            selectedReport === 'payroll-summary' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200'
          }`}
          onClick={() => setSelectedReport('payroll-summary')}
        >
          <div className="text-center">
            <div className="text-blue-500 font-semibold">Payroll Summary</div>
            <div className="text-sm text-gray-500">Monthly overview</div>
          </div>
        </button>

        <button
          className={`p-4 rounded-lg border-2 ${
            selectedReport === 'department-breakdown' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200'
          }`}
          onClick={() => setSelectedReport('department-breakdown')}
        >
          <div className="text-center">
            <div className="text-green-500 font-semibold">Department Analysis</div>
            <div className="text-sm text-gray-500">Cost by department</div>
          </div>
        </button>

        <button
          className={`p-4 rounded-lg border-2 ${
            selectedReport === 'deduction-analysis' 
              ? 'border-yellow-500 bg-yellow-50' 
              : 'border-gray-200'
          }`}
          onClick={() => setSelectedReport('deduction-analysis')}
        >
          <div className="text-center">
            <div className="text-yellow-500 font-semibold">Deduction Analysis</div>
            <div className="text-sm text-gray-500">Tax & contributions</div>
          </div>
        </button>

        <button
          className={`p-4 rounded-lg border-2 ${
            selectedReport === 'compliance' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200'
          }`}
          onClick={() => setSelectedReport('compliance')}
        >
          <div className="text-center">
            <div className="text-purple-500 font-semibold">Compliance Reports</div>
            <div className="text-sm text-gray-500">Regulatory compliance</div>
          </div>
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {selectedReport === 'payroll-summary' && 'Payroll Summary Report'}
            {selectedReport === 'department-breakdown' && 'Department Breakdown Report'}
            {selectedReport === 'deduction-analysis' && 'Deduction Analysis Report'}
            {selectedReport === 'compliance' && 'Compliance Reports'}
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => exportReport('pdf')}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Export PDF
            </button>
            <button 
              onClick={() => exportReport('excel')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Export Excel
            </button>
            <button 
              onClick={() => exportReport('csv')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        {selectedReport === 'payroll-summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Payroll Trends</h4>
              <div className="h-64">
                <Line 
                  data={payrollSummaryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        ticks: {
                          callback: function(value) {
                            return '₦ ' + (value / 1000000).toFixed(1) + 'M';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recent Payroll Runs</h4>
              <div className="space-y-3">
                {mockPayrollRuns.slice(0, 4).map((payroll) => (
                  <div key={payroll.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payroll.period}</div>
                      <div className="text-sm text-gray-500">{payroll.employees} employees</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₦ {(payroll.totalAmount / 1000000).toFixed(1)}M</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payroll.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payroll.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'department-breakdown' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Department Expense Distribution</h4>
              <div className="h-64">
                <Pie 
                  data={departmentBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Department Details</h4>
              <div className="space-y-3">
                {Object.entries(reportsData.departmentBreakdown).map(([dept, amount]) => (
                  <div key={dept} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium">{dept}</span>
                    <span className="font-semibold">₦ {(amount / 1000000).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'deduction-analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Deduction Breakdown</h4>
              <div className="h-64">
                <Bar 
                  data={deductionAnalysisData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₦ ' + (value / 1000).toFixed(0) + 'K';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Monthly Deduction Summary</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₦ 1.25M</div>
                    <div className="text-sm text-blue-800">PAYE Tax</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₦ 637K</div>
                    <div className="text-sm text-green-800">Pension</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">₦ 212K</div>
                    <div className="text-sm text-yellow-800">NHF</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₦ 85K</div>
                    <div className="text-sm text-purple-800">NSITF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">PAYE Compliance</h4>
                <div className="text-green-600 font-bold text-2xl">100%</div>
                <p className="text-sm text-gray-600">Last remittance: 10 Dec 2023</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Pension Compliance</h4>
                <div className="text-green-600 font-bold text-2xl">100%</div>
                <p className="text-sm text-gray-600">Last remittance: 7 Dec 2023</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">NHF Compliance</h4>
                <div className="text-green-600 font-bold text-2xl">100%</div>
                <p className="text-sm text-gray-600">Last remittance: 5 Dec 2023</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Compliance Timeline</h4>
              <div className="space-y-3">
                {['2023-11-10', '2023-10-10', '2023-09-10', '2023-08-10'].map((date, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <span className="text-green-600">✓</span>
                    </div>
                    <div>
                      <div className="font-medium">All statutory deductions remitted</div>
                      <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;