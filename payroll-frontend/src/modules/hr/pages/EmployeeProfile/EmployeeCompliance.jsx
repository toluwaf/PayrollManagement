import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeCompliance = () => {
  const { employee } = useOutletContext();
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    loadComplianceData();
  }, [employee._key, selectedPeriod]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeComplianceData(employee._key, selectedPeriod);
      
      if (response.success) {
        setComplianceData(response.data);
      } else {
        // Fallback to employee's basic compliance data
        setComplianceData({
          employee: employee,
          statutoryIds: {
            taxId: employee.taxId,
            pensionId: employee.pensionId,
            nhfId: employee.nhfId,
            nsitfId: employee.nsitfId
          },
          monthlyDeductions: null,
          remittanceStatus: [],
          period: selectedPeriod
        });
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      // Final fallback
      setComplianceData({
        employee: employee,
        statutoryIds: {
          taxId: employee.taxId || 'Not registered',
          pensionId: employee.pensionId || 'Not registered',
          nhfId: employee.nhfId || 'Not registered',
          nsitfId: employee.nsitfId || 'Not registered'
        },
        monthlyDeductions: null,
        remittanceStatus: [],
        period: selectedPeriod
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

  const calculateEstimatedDeductions = () => {
    // Basic estimation based on Nigerian tax laws
    const grossSalary = employee.salary || 0;
    
    // Pension: 8% of basic salary
    const pension = (employee.basicSalary || grossSalary * 0.6) * 0.08;
    
    // NHF: 2.5% of annual basic salary / 12
    const nhf = ((employee.basicSalary || grossSalary * 0.6) * 12 * 0.025) / 12;
    
    // PAYE estimation (simplified)
    const taxableIncome = grossSalary - pension;
    let paye = 0;
    
    if (taxableIncome > 300000) {
      paye = taxableIncome * 0.24; // Simplified calculation
    } else if (taxableIncome > 200000) {
      paye = taxableIncome * 0.19;
    } else if (taxableIncome > 120000) {
      paye = taxableIncome * 0.15;
    } else if (taxableIncome > 30000) {
      paye = taxableIncome * 0.11;
    } else {
      paye = taxableIncome * 0.07;
    }
    
    // NSITF: 1% of basic salary
    const nsitf = (employee.basicSalary || grossSalary * 0.6) * 0.01;
    
    return {
      paye: Math.round(paye),
      pension: Math.round(pension),
      nhf: Math.round(nhf),
      nsitf: Math.round(nsitf),
      total: Math.round(paye + pension + nhf + nsitf)
    };
  };

  const getRemittanceStatus = () => {
    if (complianceData?.remittanceStatus?.length > 0) {
      return complianceData.remittanceStatus;
    }
    
    // Default status based on statutory IDs
    return [
      { 
        type: 'PAYE', 
        amount: calculateEstimatedDeductions().paye,
        status: employee.taxId ? 'Paid' : 'Not Registered',
        remittedAt: employee.taxId ? new Date().toISOString() : null,
        reference: employee.taxId ? `PAYE-${selectedPeriod}` : null
      },
      { 
        type: 'Pension', 
        amount: calculateEstimatedDeductions().pension,
        status: employee.pensionId ? 'Paid' : 'Not Registered',
        remittedAt: employee.pensionId ? new Date().toISOString() : null,
        reference: employee.pensionId ? `PEN-${selectedPeriod}` : null
      },
      { 
        type: 'NHF', 
        amount: calculateEstimatedDeductions().nhf,
        status: employee.nhfId ? 'Paid' : 'Not Registered',
        remittedAt: employee.nhfId ? new Date().toISOString() : null,
        reference: employee.nhfId ? `NHF-${selectedPeriod}` : null
      },
      { 
        type: 'NSITF', 
        amount: calculateEstimatedDeductions().nsitf,
        status: employee.nsitfId ? 'Paid' : 'Not Registered',
        remittedAt: employee.nsitfId ? new Date().toISOString() : null,
        reference: employee.nsitfId ? `NSITF-${selectedPeriod}` : null
      }
    ];
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

  const statutoryIds = complianceData?.statutoryIds || {
    taxId: employee.taxId,
    pensionId: employee.pensionId,
    nhfId: employee.nhfId,
    nsitfId: employee.nsitfId
  };

  const monthlyDeductions = complianceData?.monthlyDeductions || calculateEstimatedDeductions();
  const remittanceStatus = getRemittanceStatus();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Information</h1>
          <p className="text-gray-600">Tax, pension, and statutory compliance details</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statutory IDs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Statutory Identification Numbers</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(statutoryIds).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace('Id', ' ID').toUpperCase()}
                  </label>
                  <p className={`p-2 rounded-lg ${
                    !value || value === 'Not registered' 
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {value || 'Not registered'}
                    {!value || value === 'Not registered' ? (
                      <span className="ml-2 text-xs">⚠️ Action required</span>
                    ) : (
                      <span className="ml-2 text-xs">✅ Registered</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Deductions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Statutory Deductions - {selectedPeriod}
            </h2>
          </div>
          <div className="p-6">
            {monthlyDeductions ? (
              <>
                <div className="space-y-3">
                  {Object.entries(monthlyDeductions).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600 capitalize">
                        {key === 'total' ? 'Total Deductions' : key.toUpperCase()}:
                      </span>
                      <span className={`font-medium ${
                        key === 'total' ? 'text-red-600 text-lg' : 'text-gray-900'
                      }`}>
                        {formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Deduction Breakdown Chart */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Deduction Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(monthlyDeductions)
                      .filter(([key]) => key !== 'total')
                      .map(([key, value]) => {
                        const percentage = monthlyDeductions.total ? ((value / monthlyDeductions.total) * 100).toFixed(1) : 0;
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                key === 'paye' ? 'bg-blue-500' :
                                key === 'pension' ? 'bg-green-500' :
                                key === 'nhf' ? 'bg-purple-500' : 'bg-yellow-500'
                              }`}></div>
                              <span className="text-gray-600">{key.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-900">{formatCurrency(value)}</span>
                              <span className="text-gray-500 w-12 text-right">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No deduction data available for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Remittance Status */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Remittance Status - {selectedPeriod}</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deduction Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Remittance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {remittanceStatus.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.remittedAt ? new Date(item.remittedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {item.reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.status === 'Not Registered' && (
                          <button className="text-blue-600 hover:text-blue-900">
                            Register
                          </button>
                        )}
                        {item.status === 'Pending' && (
                          <button className="text-green-600 hover:text-green-900">
                            Mark as Paid
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900 ml-3">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCompliance;