// src/components/payroll/SystemInfoPanel.jsx
import React from 'react';

const SystemInfoPanel = ({ version, lastBackup, lastUpdated }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const infoItems = [
    { label: 'Payroll Version', value: version },
    { label: 'Last Backup', value: lastBackup },
    { label: 'Settings Updated', value: formatDate(lastUpdated) }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">System Information</h3>
      <div className="space-y-3">
        {infoItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-600 text-sm">{item.label}:</span>
            <span className="font-medium text-sm">{item.value}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>System is operational</span>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoPanel;