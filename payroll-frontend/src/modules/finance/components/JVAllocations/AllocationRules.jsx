// frontend/src/components/JVAllocations/AllocationRules.jsx
import React, { useState } from 'react';
import DataTable from '../../../../components/Common/DataTable';

const AllocationRules = ({ rules, agreements, partners, onRefresh }) => {
  const [filters, setFilters] = useState({
    agreementId: '',
    partnerId: '',
    status: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredRules = rules.filter(rule => {
    if (filters.agreementId && rule.agreementId !== filters.agreementId) return false;
    if (filters.partnerId && rule.partnerId !== filters.partnerId) return false;
    if (filters.status && rule.status !== filters.status) return false;
    return true;
  });

  const columns = [
    {
      key: 'rule',
      header: 'Allocation Rule',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.department} - {item.employeeType}
          </div>
          <div className="text-sm text-gray-500">{item.costCenter}</div>
        </div>
      )
    },
    {
      key: 'parties',
      header: 'Parties',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>
            <span className="font-medium">Agreement:</span>{' '}
            {item.agreement?.name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Partner:</span>{' '}
            {item.partner?.name || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'allocation',
      header: 'Allocation',
      render: (item) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {item.allocationPercentage}%
          </div>
          <div className="text-xs text-gray-500 mt-1">of department cost</div>
        </div>
      )
    },
    {
      key: 'effective',
      header: 'Effective',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.effectiveDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  // Calculate department totals for validation
  const departmentTotals = {};
  filteredRules.forEach(rule => {
    if (!departmentTotals[rule.department]) {
      departmentTotals[rule.department] = 0;
    }
    departmentTotals[rule.department] += rule.allocationPercentage;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Allocation Rules</h2>
          <p className="text-sm text-gray-600">
            Configure how payroll costs are allocated to JV partners
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agreement
            </label>
            <select
              value={filters.agreementId}
              onChange={(e) => handleFilterChange('agreementId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agreements</option>
              {agreements.map(agreement => (
                <option key={agreement._key} value={agreement._key}>
                  {agreement.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner
            </label>
            <select
              value={filters.partnerId}
              onChange={(e) => handleFilterChange('partnerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Partners</option>
              {partners.map(partner => (
                <option key={partner._key} value={partner._key}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ agreementId: '', partnerId: '', status: '' })}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(departmentTotals).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Department Allocation Validation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(departmentTotals).map(([department, total]) => (
              <div key={department} className={`p-3 rounded-lg border ${
                total === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{department}</span>
                  <span className={`text-sm font-bold ${
                    total === 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {total}%
                  </span>
                </div>
                <div className={`text-xs mt-1 ${
                  total === 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {total === 100 ? '✓ Valid' : '✗ Should total 100%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Rules</div>
          <div className="text-2xl font-bold text-gray-900">{filteredRules.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Active Rules</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredRules.filter(r => r.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Departments</div>
          <div className="text-2xl font-bold text-blue-600">
            {new Set(filteredRules.map(r => r.department)).size}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Avg. Allocation</div>
          <div className="text-2xl font-bold text-purple-600">
            {filteredRules.length > 0 
              ? Math.round(filteredRules.reduce((sum, r) => sum + r.allocationPercentage, 0) / filteredRules.length) 
              : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={filteredRules}
          emptyMessage="No allocation rules found"
          searchable={true}
          searchFields={['department', 'costCenter', 'agreement.name', 'partner.name']}
        />
      </div>
    </div>
  );
};

export default AllocationRules;