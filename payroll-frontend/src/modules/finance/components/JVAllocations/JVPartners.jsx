// frontend/src/components/JVAllocations/JVPartners.jsx
import React from 'react';
import DataTable from '../../../../components/Common/DataTable';

const JVPartners = ({ partners, onRefresh }) => {
  const columns = [
    {
      key: 'partner',
      header: 'Partner',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">Code: {item.code}</div>
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>Type: <span className="capitalize">{item.type}</span></div>
          <div>Allocation: {item.allocationPercentage}%</div>
          <div>Terms: {item.paymentTerms?.replace('_', ' ')}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>{item.contact?.email}</div>
          <div>{item.contact?.phone}</div>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">JV Partners</h2>
          <p className="text-sm text-gray-600">
            Manage joint venture partners and their allocation percentages
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Partners</div>
          <div className="text-2xl font-bold text-gray-900">{partners.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Government</div>
          <div className="text-2xl font-bold text-blue-600">
            {partners.filter(p => p.type === 'government').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">International</div>
          <div className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.type === 'international').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.status === 'active').length}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={partners}
          emptyMessage="No JV partners found"
          searchable={true}
          searchFields={['name', 'code', 'type']}
        />
      </div>
    </div>
  );
};

export default JVPartners;