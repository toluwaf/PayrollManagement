// frontend/src/components/BankDisbursement/CreateBatchModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Common/Modal';
import { bankService } from '../../../../services/bankService';

const CreateBatchModal = ({ banks, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    payrollRunId: '',
    bankId: '',
    fileFormat: 'nibss'
  });
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [fileFormats, setFileFormats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // In a real app, you'd fetch payroll runs from your payroll service
      // For now, we'll use mock data that matches your database
      setPayrollRuns([
        { _key: 'pr_2023_11', period: '2023-11', status: 'completed', totalEmployees: 5 },
        { _key: 'pr_2023_12', period: '2023-12', status: 'pending_approval', totalEmployees: 5 }
      ]);

      const formats = await bankService.getSupportedFileFormats();
      setFileFormats(Object.entries(formats).map(([value, config]) => ({
        value,
        label: config.name,
        description: config.description
      })));
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.payrollRunId || !formData.bankId) {
      alert('Please select a payroll run and bank');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled by parent component
      console.error('Error creating payment batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      title="Create Payment Batch"
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payroll Run Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payroll Run *
          </label>
          <select
            value={formData.payrollRunId}
            onChange={(e) => handleChange('payrollRunId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a payroll run</option>
            {payrollRuns.map(run => (
              <option key={run._key} value={run._key}>
                {run.period} - {run.status} ({run.totalEmployees} employees)
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Select the payroll run to process payments for
          </p>
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank *
          </label>
          <select
            value={formData.bankId}
            onChange={(e) => handleChange('bankId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a bank</option>
            {banks.map(bank => (
              <option key={bank._key} value={bank._key}>
                {bank.name} ({bank.code})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Choose the bank for payment processing
          </p>
        </div>

        {/* File Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Format
          </label>
          <div className="grid grid-cols-1 gap-3">
            {fileFormats.map(format => (
              <label
                key={format.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.fileFormat === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="fileFormat"
                  value={format.value}
                  checked={formData.fileFormat === format.value}
                  onChange={(e) => handleChange('fileFormat', e.target.value)}
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {format.label}
                      </div>
                      <div className="text-gray-500">
                        {format.description}
                      </div>
                    </div>
                  </div>
                  {formData.fileFormat === format.value && (
                    <div className="shrink-0 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Payment Batch'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBatchModal;