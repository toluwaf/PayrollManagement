// src/components/Deductions/RemittanceModal.jsx
import React, { useState } from 'react';
import { deductionsService } from '../../../../services/deductionsService'

const RemittanceModal = ({ 
  isOpen, 
  onClose, 
  deductionType, 
  period, 
  amount = 0 
}) => {
  const [processing, setProcessing] = useState(false);
  const [remittanceData, setRemittanceData] = useState({
    reference: '',
    date: new Date().toISOString().split('T')[0],
    bank: '',
    accountNumber: '',
    remarks: ''
  });

  if (!isOpen) return null;

  const getDeductionDetails = () => {
    const details = {
      'PAYE': {
        name: 'PAYE Tax',
        agency: 'Federal Inland Revenue Service (FIRS)',
        deadline: '10th of following month',
        color: 'blue',
        accountInfo: 'FIRS Consolidated Revenue Account'
      },
      'PENSION': {
        name: 'Pension Contribution',
        agency: 'National Pension Commission (PenCom)',
        deadline: '7 working days after payday',
        color: 'green',
        accountInfo: 'Pension Fund Administrators'
      },
      'NHF': {
        name: 'National Housing Fund',
        agency: 'Federal Mortgage Bank of Nigeria',
        deadline: 'Within 30 days of deduction',
        color: 'yellow',
        accountInfo: 'NHF Deduction Account'
      }
    };
    
    return details[deductionType] || {
      name: 'Statutory Deduction',
      agency: 'Government Agency',
      deadline: 'As specified',
      color: 'gray',
      accountInfo: 'Designated Government Account'
    };
  };

  const handleRemit = async () => {
    try {
      setProcessing(true);
      
      // Generate a remittance reference if not provided
      const reference = remittanceData.reference || 
        `REM-${deductionType}-${period}-${Date.now().toString().slice(-6)}`;

      const response = await deductionsService.remitDeductions('batch', {
        type: deductionType,
        period,
        amount,
        reference,
        date: remittanceData.date,
        bank: remittanceData.bank,
        accountNumber: remittanceData.accountNumber,
        remarks: remittanceData.remarks
      });

      if (response.success) {
        alert(`${getDeductionDetails().name} remittance initiated successfully!`);
        onClose();
        // Reset form
        setRemittanceData({
          reference: '',
          date: new Date().toISOString().split('T')[0],
          bank: '',
          accountNumber: '',
          remarks: ''
        });
      } else {
        alert(`Failed to remit ${getDeductionDetails().name}: ${response.message}`);
      }
    } catch (error) {
      console.error('Remittance error:', error);
      alert('Failed to process remittance. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const deductionDetails = getDeductionDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Remit {deductionDetails.name}</h2>
              <p className="text-gray-600">Period: {period}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Remittance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Remittance Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Agency:</span>
                    <span className="font-medium">{deductionDetails.agency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">
                      ₦{amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">{deductionDetails.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium text-xs text-right">
                      {deductionDetails.accountInfo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remittance Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remittance Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={remittanceData.reference}
                    onChange={(e) => setRemittanceData(prev => ({
                      ...prev,
                      reference: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remittance Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={remittanceData.date}
                    onChange={(e) => setRemittanceData(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Bank Details */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Bank Transfer Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={remittanceData.bank}
                      onChange={(e) => setRemittanceData(prev => ({
                        ...prev,
                        bank: e.target.value
                      }))}
                    >
                      <option value="">Select Bank</option>
                      <option value="First Bank">First Bank of Nigeria</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="GTBank">Guaranty Trust Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="UBA">United Bank for Africa</option>
                      <option value="Union Bank">Union Bank</option>
                      <option value="Fidelity Bank">Fidelity Bank</option>
                      <option value="Stanbic IBTC">Stanbic IBTC Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter account number"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={remittanceData.accountNumber}
                      onChange={(e) => setRemittanceData(prev => ({
                        ...prev,
                        accountNumber: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      placeholder="Additional notes or reference"
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={remittanceData.remarks}
                      onChange={(e) => setRemittanceData(prev => ({
                        ...prev,
                        remarks: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Remittance Information</h4>
                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Ensure all employee data is accurate before remittance</li>
                  <li>Keep proof of payment for audit purposes</li>
                  <li>Late remittances may attract penalties and interest</li>
                  <li>Verify bank account details before transferring funds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemit}
              disabled={processing || !remittanceData.bank || !remittanceData.accountNumber}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                processing || !remittanceData.bank || !remittanceData.accountNumber
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {processing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Remit ${deductionDetails.name}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemittanceModal;