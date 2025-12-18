// frontend/src/components/BankDisbursement/PaymentBatchList.jsx
import React, { useState } from 'react';
import DataTable from '../../../../components/Common/DataTable';
import CreateBatchModal from './CreateBatchModal';

const PaymentBatchList = ({ 
  paymentBatches, 
  banks, 
  onCreatePaymentBatch, 
  onGenerateFile, 
  onUploadToBank, 
  onViewDetail,
  loading 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (action, batchId, format = 'nibss') => {
    setActionLoading(prev => ({ ...prev, [batchId]: true }));
    
    try {
      switch (action) {
        case 'generate-file':
          await onGenerateFile(batchId, format);
          break;
        case 'upload':
          await onUploadToBank(batchId);
          break;
        case 'view-detail':
          onViewDetail(batchId);
          break;
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      generated: { color: 'bg-blue-100 text-blue-800', label: 'Generated' },
      file_generated: { color: 'bg-orange-100 text-orange-800', label: 'File Ready' },
      uploaded: { color: 'bg-purple-100 text-purple-800', label: 'Uploaded' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'batchNumber',
      header: 'Batch ID',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.batchNumber}</div>
          <div className="text-sm text-gray-500">{item.period}</div>
        </div>
      )
    },
    {
      key: 'bank',
      header: 'Bank',
      render: (item) => (
        <div>
          <div className="font-medium">{item.bank?.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{item.employeeCount} employees</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <div className="font-medium text-gray-900">
          ₦{item.totalAmount?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => getStatusBadge(item.status)
    },
    {
      key: 'dates',
      header: 'Timeline',
      render: (item) => (
        <div className="text-sm text-gray-500">
          <div>Created: {new Date(item.generatedAt).toLocaleDateString()}</div>
          {item.fileGeneratedAt && (
            <div>File: {new Date(item.fileGeneratedAt).toLocaleDateString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAction('view-detail', item._key)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          
          {item.status === 'generated' && (
            <button
              onClick={() => handleAction('generate-file', item._key)}
              disabled={actionLoading[item._key]}
              className="text-green-600 hover:text-green-900 text-sm font-medium disabled:opacity-50"
            >
              {actionLoading[item._key] ? 'Generating...' : 'Generate File'}
            </button>
          )}
          
          {item.status === 'file_generated' && (
            <button
              onClick={() => handleAction('upload', item._key)}
              disabled={actionLoading[item._key]}
              className="text-purple-600 hover:text-purple-900 text-sm font-medium disabled:opacity-50"
            >
              {actionLoading[item._key] ? 'Uploading...' : 'Upload to Bank'}
            </button>
          )}
          
          {item.status === 'uploaded' && (
            <button
              onClick={() => handleAction('view-detail', item._key)}
              className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
            >
              Check Status
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payment Batches</h2>
          <p className="text-sm text-gray-600">
            Manage payroll payment batches and bank disbursements
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Batch
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Batches</div>
          <div className="text-2xl font-bold text-gray-900">{paymentBatches.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold text-gray-900">
            ₦{paymentBatches.reduce((sum, batch) => sum + (batch.totalAmount || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {paymentBatches.filter(b => b.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {paymentBatches.filter(b => !['completed', 'failed'].includes(b.status)).length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={paymentBatches}
          loading={loading}
          emptyMessage="No payment batches found. Create your first batch to get started."
        />
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <CreateBatchModal
          banks={banks}
          onSubmit={onCreatePaymentBatch}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentBatchList;