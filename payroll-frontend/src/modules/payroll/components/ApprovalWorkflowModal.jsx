import React, { useState } from 'react';
import { payrollService } from '../../../services/payrollService';

const ApprovalWorkflowModal = ({ 
  payrollRun, 
  isOpen, 
  onClose, 
  onWorkflowUpdated 
}) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && payrollRun) {
      loadWorkflow();
    }
  }, [isOpen, payrollRun]);

  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getWorkflowByPayrollRun(payrollRun._key);
      if (response.success) {
        setWorkflow(response.data);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await payrollService.approveWorkflowStep(workflow._key, { comments });
      if (response.success) {
        onWorkflowUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await payrollService.rejectWorkflowStep(workflow._key, { comments });
      if (response.success) {
        onWorkflowUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStep = workflow?.steps?.find(step => step.step === workflow.currentStep);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Approval Workflow</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : workflow ? (
            <div className="space-y-6">
              {/* Workflow Progress */}
              <div>
                <h3 className="font-semibold mb-3">Approval Steps</h3>
                <div className="space-y-3">
                  {workflow.steps.map((step, index) => (
                    <div key={step.step} className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      step.step === workflow.currentStep ? 'bg-blue-50 border-blue-200' :
                      step.status === 'approved' ? 'bg-green-50 border-green-200' :
                      step.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.step === workflow.currentStep ? 'bg-blue-600 text-white' :
                        step.status === 'approved' ? 'bg-green-600 text-white' :
                        step.status === 'rejected' ? 'bg-red-600 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.approverName}</p>
                        <p className="text-sm text-gray-600">{step.role}</p>
                      </div>
                      <div className="text-sm">
                        {step.status === 'approved' && (
                          <span className="text-green-600">Approved</span>
                        )}
                        {step.status === 'rejected' && (
                          <span className="text-red-600">Rejected</span>
                        )}
                        {step.status === 'pending' && step.step === workflow.currentStep && (
                          <span className="text-blue-600">Pending Your Approval</span>
                        )}
                        {step.status === 'pending' && step.step > workflow.currentStep && (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Step Actions */}
              {currentStep && currentStep.status === 'pending' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Your Action Required</h3>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add comments (optional)"
                    className="w-full border rounded-lg p-3 mb-4"
                    rows="3"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No approval workflow found for this payroll run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflowModal;