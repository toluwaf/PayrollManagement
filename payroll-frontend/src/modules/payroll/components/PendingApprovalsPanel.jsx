import React, { useState, useEffect } from 'react';
import { payrollService } from '../../../services/payrollService';

const PendingApprovalsPanel = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getPendingApprovals();
      if (response.success) {
        setPendingApprovals(response.data);
      }
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Pending Approvals</h3>
      </div>
      <div className="p-4">
        {pendingApprovals.length > 0 ? (
          <div className="space-y-3">
            {pendingApprovals.map((approval, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Payroll: {approval.payrollRun?.period}</p>
                    <p className="text-sm text-gray-600">
                      Step {approval.currentStep.step} - {approval.currentStep.role}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Total: ₦{(approval.payrollRun?.totalNet || 0).toLocaleString()}
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                  Review & Approve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">No pending approvals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsPanel;