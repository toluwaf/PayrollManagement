import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeJVAllocations = () => {
  const { employee, onEmployeeUpdate } = useOutletContext();
  const [jvData, setJvData] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAllocation, setNewAllocation] = useState({
    partnerId: '',
    agreementId: '',
    allocationPercentage: 0,
    costCenter: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadJVData();
  }, [employee._key]);

  const loadJVData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeJVAllocationsWithRules(employee._key);
      if (response.success) {
        setJvData(response.data);
      }
    } catch (error) {
      console.error('Failed to load JV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignJV = async () => {
    try {
      const response = await employeeService.assignEmployeeToJV(employee._key, newAllocation);
      if (response.success) {
        await loadJVData(); // Reload data
        setIsAssigning(false);
        setNewAllocation({
          partnerId: '',
          agreementId: '',
          allocationPercentage: 0,
          costCenter: '',
          effectiveDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to assign JV:', error);
      alert('Failed to assign JV partner. Please try again.');
    }
  };

  const handleRemoveAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to remove this JV allocation?')) {
      try {
        const response = await employeeService.removeEmployeeJVAllocation(employee._key, allocationId);
        if (response.success) {
          await loadJVData(); // Reload data
        }
      } catch (error) {
        console.error('Failed to remove allocation:', error);
        alert('Failed to remove JV allocation. Please try again.');
      }
    }
  };

  const calculateAvailablePercentage = () => {
    if (!jvData) return 100;
    const usedPercentage = jvData.currentAllocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0);
    return 100 - usedPercentage;
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Joint Venture Allocations</h1>
          <p className="text-gray-600">Manage JV partner allocations and cost centers</p>
        </div>
        <button
          onClick={() => setIsAssigning(true)}
          disabled={calculateAvailablePercentage() <= 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Assign JV Partner
        </button>
      </div>

      {/* Allocation Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Allocation Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {jvData?.currentAllocations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Allocations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {jvData?.currentAllocations?.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0) || 0}%
            </div>
            <div className="text-sm text-gray-600">Allocated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {calculateAvailablePercentage()}%
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>
      </div>

      {/* Applicable Rules */}
      {jvData?.applicableRules?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicable Allocation Rules</h2>
          <div className="space-y-3">
            {jvData.applicableRules.map((rule) => (
              <div key={rule._key} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{rule.costCenter}</h3>
                  <p className="text-sm text-gray-600">
                    {rule.partnerId} - {rule.allocationPercentage}% Allocation
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Allocations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Allocations</h2>
        </div>
        <div className="p-6">
          {jvData?.currentAllocations?.length > 0 ? (
            <div className="space-y-4">
              {jvData.currentAllocations.map((allocation) => (
                <div key={allocation._key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{allocation.partner?.name}</h3>
                        <span className="text-lg font-bold text-blue-600">
                          {allocation.allocationPercentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Cost Center:</span> {allocation.costCenter}
                        </div>
                        <div>
                          <span className="font-medium">Agreement:</span> {allocation.agreement?.name}
                        </div>
                        <div>
                          <span className="font-medium">Effective Date:</span> {new Date(allocation.effectiveDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Monthly Amount:</span> ₦{(employee.salary * allocation.allocationPercentage / 100).toLocaleString()}
                        </div>
                      </div>
                      {allocation.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {allocation.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveAllocation(allocation._key)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No JV Allocations</h3>
              <p className="text-gray-500 mb-4">This employee is not currently allocated to any JV partners.</p>
              <button
                onClick={() => setIsAssigning(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Assign First JV Partner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeJVAllocations;