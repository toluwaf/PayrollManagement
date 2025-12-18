// frontend/src/components/BankDisbursement/BankConfiguration.jsx
import React from 'react';
import DataTable from '../../../../components/Common/DataTable';

const BankConfiguration = ({ banks, onRefresh }) => {
  const columns = [
    {
      key: 'bank',
      header: 'Bank',
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
          <div>SWIFT: {item.swiftCode}</div>
          <div>Transfer Limit: ₦{item.transferLimit?.toLocaleString()}</div>
          <div>Fee: ₦{item.processingFee}</div>
        </div>
      )
    },
    {
      key: 'formats',
      header: 'Supported Formats',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.fileFormats?.map(format => (
            <span
              key={format}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {format.toUpperCase()}
            </span>
          ))}
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
    },
    {
      key: 'integration',
      header: 'Integration',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {item.apiEndpoint ? (
            <span className="text-green-600">API Integrated</span>
          ) : (
            <span className="text-yellow-600">File-based</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bank Configuration</h2>
          <p className="text-sm text-gray-600">
            Manage bank integrations and supported file formats
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={banks}
          emptyMessage="No banks configured"
        />
      </div>

      {/* Integration Help */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Bank Integration</h3>
        <p className="text-blue-800 mb-3">
          To enable API integration with banks, you'll need to:
        </p>
        <ul className="text-blue-700 list-disc list-inside space-y-1">
          <li>Obtain API credentials from each bank</li>
          <li>Configure API endpoints and authentication</li>
          <li>Set up webhooks for payment status updates</li>
          <li>Test integration in sandbox environment first</li>
        </ul>
      </div>
    </div>
  );
};

export default BankConfiguration;