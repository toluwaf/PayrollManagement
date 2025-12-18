// src/components/payroll/ApprovalWorkflowSettings.jsx
import React from 'react';

const ApprovalWorkflowSettings = ({ workflow, onToggle, onApprovalChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600">Enable approval workflow for payroll processing</p>
          <p className="text-sm text-gray-500">Requires manager approval before payroll is finalized</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={workflow?.enabled || false}
            onChange={(e) => onToggle('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      {workflow?.enabled && (
        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Approvals
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={workflow.requiredApprovals || 1}
                onChange={(e) => onApprovalChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-semibold w-8 text-center">
                {workflow.requiredApprovals || 1}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Number of approvals required before payroll can be processed
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Approvers
            </label>
            {workflow.approvers && workflow.approvers.length > 0 ? (
              <ul className="space-y-2">
                {workflow.approvers.map((approver, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium">{approver.name}</p>
                      <p className="text-sm text-gray-500">{approver.role}</p>
                    </div>
                    <button className="text-red-600 hover:text-red-800 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded">
                <p>No approvers configured</p>
                <p className="text-sm mt-1">Add approvers to enable workflow</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowSettings;