import React, { useState, useEffect } from 'react';
import { payrollService } from '../../../services/payrollService';
import { employeeService } from '../../../services/employeeService';

const AdjustmentsManagement = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: '',
    type: '',
    status: '',
    period: ''
  });
  const [newAdjustment, setNewAdjustment] = useState({
    employeeId: '',
    type: 'bonus',
    amount: '',
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    taxTreatment: 'taxable',
    status: 'pending'
  });

  useEffect(() => {
    loadAdjustments();
    loadEmployees();
  }, [filters]);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getAdjustments(filters);
      if (response.success) {
        setAdjustments(response.data);
      }
    } catch (error) {
      console.error('Failed to load adjustments:', error);
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

  const handleCreateAdjustment = async () => {
    try {
      const response = await payrollService.createAdjustment(newAdjustment);
      if (response.success) {
        setShowAddModal(false);
        setNewAdjustment({
          employeeId: '',
          type: 'bonus',
          amount: '',
          description: '',
          effectiveDate: new Date().toISOString().split('T')[0],
          taxTreatment: 'taxable',
          status: 'pending'
        });
        loadAdjustments();
      }
    } catch (error) {
      console.error('Failed to create adjustment:', error);
    }
  };

  const handleStatusUpdate = async (adjustmentId, newStatus) => {
    try {
      const response = await payrollService.updateAdjustment(adjustmentId, { status: newStatus });
      if (response.success) {
        loadAdjustments();
      }
    } catch (error) {
      console.error('Failed to update adjustment:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      bonus: 'bg-green-100 text-green-800',
      overtime: 'bg-blue-100 text-blue-800',
      loan: 'bg-yellow-100 text-yellow-800',
      advance: 'bg-purple-100 text-purple-800',
      penalty: 'bg-red-100 text-red-800',
      allowance: 'bg-indigo-100 text-indigo-800',
      deduction: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Adjustments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Adjustment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.employeeId}
            onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp._key} value={emp._key}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="bonus">Bonus</option>
            <option value="overtime">Overtime</option>
            <option value="loan">Loan</option>
            <option value="advance">Advance</option>
            <option value="penalty">Penalty</option>
            <option value="allowance">Allowance</option>
            <option value="deduction">Deduction</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="month"
            value={filters.period}
            onChange={(e) => setFilters({...filters, period: e.target.value})}
            className="border rounded-lg px-3 py-2"
            placeholder="Period"
          />
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Adjustments ({adjustments.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : adjustments.length > 0 ? (
                adjustments.map((adjustment) => (
                  <tr key={adjustment._key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{adjustment.employeeName}</p>
                        <p className="text-sm text-gray-500">{adjustment.employeeDepartment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(adjustment.type)}`}>
                        {adjustment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={adjustment.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₦{Math.abs(adjustment.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {adjustment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(adjustment.effectiveDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(adjustment.status)}`}>
                        {adjustment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {adjustment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(adjustment._key, 'approved')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(adjustment._key, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-900 ml-2">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No adjustments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Adjustment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Adjustment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    value={newAdjustment.employeeId}
                    onChange={(e) => setNewAdjustment({...newAdjustment, employeeId: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._key} value={emp._key}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAdjustment.type}
                    onChange={(e) => setNewAdjustment({...newAdjustment, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="bonus">Bonus</option>
                    <option value="overtime">Overtime</option>
                    <option value="loan">Loan Deduction</option>
                    <option value="advance">Salary Advance</option>
                    <option value="penalty">Penalty</option>
                    <option value="allowance">Special Allowance</option>
                    <option value="deduction">Other Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newAdjustment.amount}
                    onChange={(e) => setNewAdjustment({...newAdjustment, amount: parseFloat(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newAdjustment.description}
                    onChange={(e) => setNewAdjustment({...newAdjustment, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={newAdjustment.effectiveDate}
                    onChange={(e) => setNewAdjustment({...newAdjustment, effectiveDate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Treatment</label>
                  <select
                    value={newAdjustment.taxTreatment}
                    onChange={(e) => setNewAdjustment({...newAdjustment, taxTreatment: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="taxable">Taxable</option>
                    <option value="non-taxable">Non-taxable</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdjustment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsManagement;