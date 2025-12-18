// frontend/src/components/BankDisbursement/PaymentBatchDetail.jsx
import React, { useState, useEffect } from 'react';
import DataTable from '../../../../components/Common/DataTable';

const PaymentBatchDetail = ({ batch, onGenerateFile, onUploadToBank, onBack }) => {
  const [selectedFormat, setSelectedFormat] = useState('nibss');
  const [actionLoading, setActionLoading] = useState(false);

  if (!batch) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No batch selected</p>
      </div>
    );
  }

  const handleGenerateFile = async () => {
    setActionLoading(true);
    try {
      await onGenerateFile(batch._key, selectedFormat);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadToBank = async () => {
    setActionLoading(true);
    try {
      await onUploadToBank(batch._key);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      generated: { 
        label: 'Generated', 
        color: 'blue', 
        description: 'Payment batch has been created',
        nextActions: ['generate-file']
      },
      file_generated: { 
        label: 'File Ready', 
        color: 'orange', 
        description: 'Payment file is ready for bank upload',
        nextActions: ['upload']
      },
      uploaded: { 
        label: 'Uploaded', 
        color: 'purple', 
        description: 'File has been uploaded to bank for processing',
        nextActions: []
      },
      processing: { 
        label: 'Processing', 
        color: 'yellow', 
        description: 'Bank is processing the payments',
        nextActions: []
      },
      completed: { 
        label: 'Completed', 
        color: 'green', 
        description: 'All payments have been processed successfully',
        nextActions: []
      },
      failed: { 
        label: 'Failed', 
        color: 'red', 
        description: 'Some payments failed during processing',
        nextActions: ['retry']
      }
    };
    
    return statusMap[status] || { label: status, color: 'gray', description: 'Unknown status', nextActions: [] };
  };

  const statusInfo = getStatusInfo(batch.status);

  const transactionColumns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.employeeName}</div>
          <div className="text-sm text-gray-500">{item.employeeId}</div>
        </div>
      )
    },
    {
      key: 'bankAccount',
      header: 'Bank Account',
      render: (item) => (
        <div className="font-mono text-sm">{item.bankAccount}</div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <div className="font-medium text-gray-900">
          ₦{item.amount?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => (
        <div className="text-sm text-gray-500 font-mono">
          {item.reference || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'processed' ? 'bg-green-100 text-green-800' :
          item.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Batches
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{batch.batchNumber}</h2>
            <p className="text-gray-600">Payment Batch Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Batch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold text-gray-900">
            ₦{batch.totalAmount?.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Employees</div>
          <div className="text-2xl font-bold text-gray-900">
            {batch.employeeCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Bank</div>
          <div className="text-xl font-bold text-gray-900">
            {batch.bank?.name}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Period</div>
          <div className="text-xl font-bold text-gray-900">
            {batch.period}
          </div>
        </div>
      </div>

      {/* Action Panel */}
      {(statusInfo.nextActions.length > 0) && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Next Actions</h3>
          <div className="flex flex-wrap gap-3">
            {statusInfo.nextActions.includes('generate-file') && (
              <div className="flex items-center space-x-3">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nibss">NIBSS Format</option>
                  <option value="aba">ABA Format</option>
                  <option value="csv">CSV Format</option>
                  <option value="xml">XML Format</option>
                </select>
                <button
                  onClick={handleGenerateFile}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Generating...' : 'Generate Payment File'}
                </button>
              </div>
            )}
            
            {statusInfo.nextActions.includes('upload') && (
              <button
                onClick={handleUploadToBank}
                disabled={actionLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading ? 'Uploading...' : 'Upload to Bank'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Batch Created</p>
              <p className="text-sm text-gray-500">{new Date(batch.generatedAt).toLocaleString()}</p>
            </div>
          </div>
          
          {batch.fileGeneratedAt && (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Payment File Generated</p>
                <p className="text-sm text-gray-500">{new Date(batch.fileGeneratedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {batch.uploadedAt && (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Uploaded to Bank</p>
                <p className="text-sm text-gray-500">{new Date(batch.uploadedAt).toLocaleString()}</p>
                {batch.uploadReference && (
                  <p className="text-sm text-gray-500">Reference: {batch.uploadReference}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Transactions</h3>
          <p className="text-sm text-gray-600">
            Individual payment records for this batch
          </p>
        </div>
        <DataTable
          columns={transactionColumns}
          data={batch.transactions || []}
          emptyMessage="No transactions found"
        />
      </div>
    </div>
  );
};

export default PaymentBatchDetail;