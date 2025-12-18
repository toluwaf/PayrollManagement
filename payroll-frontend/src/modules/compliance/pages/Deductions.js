import React, { useState, useEffect } from 'react';
import { deductionsService } from '../../../services/deductionsService';
import { employeeService } from '../../../services/employeeService';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import RemittanceModal from '../components/Deductions/RemittanceModal';
import ExportModal from '../components/Deductions/ExportModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Deductions = () => {
  const [deductions, setDeductions] = useState([]);
  const [deductionSummary, setDeductionSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal states
  const [showRemittanceModal, setShowRemittanceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDeductionType, setSelectedDeductionType] = useState(null);

  useEffect(() => {
    generatePeriods();
    loadEmployees();
  }, []);
  
  // Load data when selectedPeriod changes
  useEffect(() => {
    if (selectedPeriod) {
      loadDeductionData();
    }
  }, [selectedPeriod]);

  const generatePeriods = () => {
    const periods = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const display = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      periods.push({ value: period, display });
    }
    
    setPeriods(periods);
    if (periods.length > 0) {
      setSelectedPeriod(periods[0].value);
    }
  };

  const loadDeductionData = async () => {
    if (!selectedPeriod) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load both summary and deductions in parallel
      const [summaryResponse, deductionsResponse] = await Promise.all([
        deductionsService.getDeductionSummary(selectedPeriod),
        deductionsService.getAllDeductions({ 
          period: selectedPeriod,
          type: 'employee'
        })
      ]);

      if (summaryResponse.success) {
        setDeductionSummary(summaryResponse.data);
      } else {
        console.warn('No deduction summary found for period:', selectedPeriod);
        setDeductionSummary(null);
      }

      if (deductionsResponse.success) {
        setDeductions(deductionsResponse.data || []);
      } else {
        console.warn('No deductions found for period:', selectedPeriod);
        setDeductions([]);
      }

      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to load deduction data:', error);
      setError('Failed to load deduction data. Please try again.');
      setDeductionSummary(null);
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  // const loadDeductionSummary = async () => {
  //   try {
  //     const response = await deductionsService.getDeductionSummary(selectedPeriod);
  //     if (response.success) {
  //       setDeductionSummary(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load deduction summary:', error);
  //   }
  // };

  // const loadDeductions = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await deductionsService.getAllDeductions({ 
  //       period: selectedPeriod,
  //       type: 'employee'
  //     });
  //     if (response.success) {
  //       setDeductions(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load deductions:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCalculateDeductions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await deductionsService.calculateDeductions({
        period: selectedPeriod,
        employeeIds: employees.map(emp => emp._key)
      });

      if (response.success) {
        alert('Deductions calculated successfully!');
        await loadDeductionData();
      } else {
        setError(response.message || 'Failed to calculate deductions');
      }
    } catch (error) {
      console.error('Failed to calculate deductions:', error);
      setError('Failed to calculate deductions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemit = (type) => {
    setSelectedDeductionType(type);
    setShowRemittanceModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  // Chart data
  const employerContributionsData = {
    labels: deductionSummary ? ['Pension', 'NSITF', 'ITF'] : [],
    datasets: [
      {
        label: 'Employer Contributions',
        data: deductionSummary ? [
          deductionSummary.totalEmployerPension,
          deductionSummary.totalNSITF,
          deductionSummary.totalITF
        ] : [],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
        ]
      }
    ]
  };

  const deductionTrendsData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    datasets: [
      {
        label: 'PAYE',
        data: [1150000, 1180000, 1200000, 1220000, 1250000],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      {
        label: 'Pension',
        data: [580000, 590000, 600000, 610000, 637500],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'NHF',
        data: [190000, 195000, 200000, 205000, 212500],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      }
    ]
  };


  // Show loading state
  if (loading && !dataLoaded) {
    return (
      <div className="p-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deduction data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data after loading
  if (dataLoaded && !deductionSummary && deductions.length === 0) {
    return (
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Statutory Deductions & Remittances</h1>
          <div className="flex space-x-3">
            <select 
              className="border rounded-lg p-2"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.display}
                </option>
              ))}
            </select>
            <button
              onClick={handleCalculateDeductions}
              disabled={loading}
              className={`px-4 py-2 rounded-lg ${
                loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {loading ? 'Calculating...' : 'Calculate Deductions'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deduction data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by calculating deductions for the selected period.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCalculateDeductions}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Calculate Deductions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statutory Deductions & Remittances</h1>
        <div className="flex space-x-3">
          <select 
            className="border rounded-lg p-2"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={loading}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.display}
              </option>
            ))}
          </select>
          <button
            onClick={handleCalculateDeductions}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {loading ? 'Calculating...' : 'Calculate Deductions'}
          </button>
          <button
            onClick={handleExport}
            disabled={!deductionSummary}
            className={`px-4 py-2 rounded-lg ${
              !deductionSummary ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">Processing... Please wait.</p>
        </div>
      )}

      
      {deductionSummary && (
        <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Employee Deductions */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Total PAYE</p>
                  <h3 className="text-2xl font-bold">₦{(deductionSummary.totalPAYE / 1000).toFixed(0)}K</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-blue-500 font-bold">PAYE</span>
                </div>
              </div>
              <button 
                onClick={() => handleRemit('PAYE')}
                className="w-full mt-3 bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600"
              >
                Remit to FIRS
              </button>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Employee Pension</p>
                  <h3 className="text-2xl font-bold">₦{(deductionSummary.totalEmployeePension / 1000).toFixed(0)}K</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="text-green-500 font-bold">PEN</span>
                </div>
              </div>
              <button 
                onClick={() => handleRemit('PENSION')}
                className="w-full mt-3 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600"
              >
                Remit to PenCom
              </button>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Total NHF</p>
                  <h3 className="text-2xl font-bold">₦{(deductionSummary.totalNHF / 1000).toFixed(0)}K</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <span className="text-yellow-500 font-bold">NHF</span>
                </div>
              </div>
              <button 
                onClick={() => handleRemit('NHF')}
                className="w-full mt-3 bg-yellow-500 text-white py-1 rounded text-sm hover:bg-yellow-600"
              >
                Remit to NHF
              </button>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-purple-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Compliance Status</p>
                  <h3 className="text-2xl font-bold">98%</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="text-green-500 font-bold">✓</span>
                </div>
              </div>
              <p className="text-green-500 text-xs mt-2">All remittances up to date</p>
            </div>
          </div>

        {/* Employer Contributions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-700">Employer Pension (7.5%)</h3>
            <p className="text-2xl font-bold text-blue-600">
              ₦{(deductionSummary.totalEmployerPension || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">PENCOM Employer Contribution</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-700">NSITF (1%)</h3>
            <p className="text-2xl font-bold text-green-600">
              ₦{(deductionSummary.totalNSITF || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Employer Social Insurance</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-700">ITF (1%)</h3>
            <p className="text-2xl font-bold text-orange-600">
              ₦{(deductionSummary.totalITF || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {deductionSummary.itfApplies ? 'Applied (≥5 employees)' : 'Not Applied'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Deduction Trends</h3>
            <div className="h-64">
              <Line 
                data={deductionTrendsData}
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

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Employer Contributions</h3>
            <div className="h-64">
              <Bar 
                data={employerContributionsData}
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
        </div>

        {/* Detailed Deductions Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Employee Deductions - {periods.find(p => p.value === selectedPeriod)?.display}</h3>
            <div className="text-sm text-gray-500">
              Total Employees: {deductions.length} | 
              Total Deductions: ₦{(deductionSummary.totalEmployeeDeductions || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Emolument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAYE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pension (7.5%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NHF (2.5%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deductions.length > 0 ? (
                  deductions.map((deduction) => (
                    <tr key={deduction.employeeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deduction.employeeName}</div>
                          <div className="text-sm text-gray-500">{deduction.department}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{(deduction.grossEmolument || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        -₦{(deduction.paye || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -₦{(deduction.pension || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -₦{(deduction.nhf || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-700">
                        -₦{(deduction.totalEmployeeDeductions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                        ₦{(deduction.netSalary || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No deduction records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}

      {/* Modals */}
      <RemittanceModal
        isOpen={showRemittanceModal}
        onClose={() => setShowRemittanceModal(false)}
        deductionType={selectedDeductionType}
        period={selectedPeriod}
        amount={deductionSummary ? getDeductionAmount(selectedDeductionType, deductionSummary) : 0}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        period={selectedPeriod}
      />
    </div>

  );
};

// Helper function to get deduction amount by type
const getDeductionAmount = (type, summary) => {
  switch (type) {
    case 'PAYE':
      return summary.totalPAYE;
    case 'PENSION':
      return summary.totalEmployeePension;
    case 'NHF':
      return summary.totalNHF;
    default:
      return 0;
  }
};

export default Deductions;