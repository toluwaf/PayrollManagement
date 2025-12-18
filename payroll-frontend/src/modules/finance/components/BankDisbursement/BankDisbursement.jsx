// frontend/src/components/BankDisbursement/BankDisbursement.jsx
import React, { useState, useEffect } from 'react';
import { bankService } from '../../../../services/bankService';
import PaymentBatchList from './PaymentBatchList';
import PaymentBatchDetail from './PaymentBatchDetail';
import BankConfiguration from './BankConfiguration';
import PaymentStatistics from './PaymentStatistics';

const BankDisbursement = () => {
  const [activeTab, setActiveTab] = useState('batches');
  const [banks, setBanks] = useState([]);
  const [paymentBatches, setPaymentBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [banksResponse, batchesResponse, statsResponse] = await Promise.all([
        bankService.getAllBanks(),
        bankService.getPaymentBatches(),
        bankService.getPaymentStatistics('2023-11')
      ]);
      
      setBanks(banksResponse.data || []);
      setPaymentBatches(batchesResponse.data || []);
      setStatistics(statsResponse.data || {});
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load bank disbursement data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentBatch = async (batchData) => {
    try {
      setError(null);
      const response = await bankService.createPaymentBatch(batchData);
      
      if (response.success) {
        await loadInitialData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to create payment batch');
      }
    } catch (err) {
      console.error('Error creating payment batch:', err);
      setError(err.response?.data?.message || 'Failed to create payment batch');
      throw err;
    }
  };

  const handleGenerateFile = async (batchId, format) => {
    try {
      setError(null);
      const response = await bankService.generatePaymentFile(batchId, format);
      
      if (response.success) {
        // Download the file
        const fileData = response.data.fileData;
        const blob = new Blob([fileData.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        await loadInitialData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to generate payment file');
      }
    } catch (err) {
      console.error('Error generating payment file:', err);
      setError(err.response?.data?.message || 'Failed to generate payment file');
      throw err;
    }
  };

  const handleUploadToBank = async (batchId) => {
    try {
      setError(null);
      const response = await bankService.simulateBankUpload(batchId);
      
      if (response.success) {
        await loadInitialData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to upload to bank');
      }
    } catch (err) {
      console.error('Error uploading to bank:', err);
      setError(err.response?.data?.message || 'Failed to upload to bank');
      throw err;
    }
  };

  const handleViewBatchDetail = async (batchId) => {
    try {
      setError(null);
      const response = await bankService.getPaymentBatchById(batchId);
      
      if (response.success) {
        setSelectedBatch(response.data.paymentBatch);
        setActiveTab('batch-detail');
      } else {
        throw new Error(response.message || 'Failed to fetch batch details');
      }
    } catch (err) {
      console.error('Error fetching batch detail:', err);
      setError(err.response?.data?.message || 'Failed to fetch batch details');
    }
  };

  const tabs = [
    { id: 'batches', name: 'Payment Batches', icon: '📦' },
    { id: 'statistics', name: 'Statistics', icon: '📊' },
    { id: 'configuration', name: 'Bank Configuration', icon: '🏦' },
  ];

  if (loading && paymentBatches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Disbursement</h1>
          <p className="text-gray-600">Manage payroll payments and bank integrations</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedBatch(null);
                setError(null);
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
          {selectedBatch && (
            <button
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600`}
            >
              📋 Batch Details
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'batches' && (
          <PaymentBatchList
            paymentBatches={paymentBatches}
            banks={banks}
            onCreatePaymentBatch={handleCreatePaymentBatch}
            onGenerateFile={handleGenerateFile}
            onUploadToBank={handleUploadToBank}
            onViewDetail={handleViewBatchDetail}
            loading={loading}
            error={error}
          />
        )}

        {activeTab === 'statistics' && (
          <PaymentStatistics
            statistics={statistics}
            paymentBatches={paymentBatches}
          />
        )}

        {activeTab === 'configuration' && (
          <BankConfiguration
            banks={banks}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'batch-detail' && selectedBatch && (
          <PaymentBatchDetail
            batch={selectedBatch}
            onGenerateFile={handleGenerateFile}
            onUploadToBank={handleUploadToBank}
            onBack={() => {
              setActiveTab('batches');
              setSelectedBatch(null);
              setError(null);
            }}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default BankDisbursement;