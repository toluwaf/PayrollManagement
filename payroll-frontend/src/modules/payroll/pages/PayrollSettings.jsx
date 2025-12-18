// src/components/payroll/PayrollSettings.jsx
import React, { useEffect } from 'react';
import ErrorBoundary from '../../../components/Common/ErrorBoundary';
import MessageDisplay from '../../../components/Common/MessageDisplay';
import PayrollCycleSettings from '../components/PayrollCycleSettings';
import ApprovalWorkflowSettings from '../components/ApprovalWorkflowSettings';
import PAYETaxSettings from '../components/PAYETaxSettings';
import QuickActionsPanel from '../components/QuickActionsPanel';
import SystemInfoPanel from '../components/SystemInfoPanel';
import { usePayrollSettings } from '../../../hooks/usePayrollSettings';
import { useTaxBracketManager } from '../../../hooks/useTaxBracketManager';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const PayrollSettings = () => {
  const {
    settings,
    loading,
    saving,
    savingPAYE,
    message,
    hasChanges,
    loadSettings,
    saveSettings,
    updatePAYESettings,
    updateNestedSetting,
    resetPayrollCycleToDefault,
    resetPAYESettingsToDefault,
    resetToDefaults,
    clearMessage,
    setSettings,
    setHasChanges
  } = usePayrollSettings();

  const taxBracketManager = useTaxBracketManager(
    settings,
    setSettings,
    setHasChanges
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update settings handlers
  const handlePayrollCycleChange = (value) => {
    setSettings(prev => ({
      ...prev,
      payrollCycle: value
    }));
    setHasChanges(true);
  };

  const handleUpdateTaxSetting = (field, value) => {
    updateNestedSetting('taxSettings', field, value);
  };

  const handleUpdateBracket = (index, field, value) => {
    taxBracketManager.updateTaxBracket(index, field, value, clearMessage);
  };

  const handleRemoveBracket = (index) => {
    if (window.confirm('Are you sure you want to remove this tax bracket?')) {
      taxBracketManager.removeTaxBracket(index);
    }
  };

  // Confirmations for destructive actions
  const confirmResetPayrollCycle = () => {
    if (window.confirm('Reset payroll cycle settings to default?')) {
      resetPayrollCycleToDefault();
    }
  };

  const confirmResetPAYE = () => {
    if (window.confirm('Reset PAYE tax settings to NTA 2026 defaults?')) {
      resetPAYESettingsToDefault();
    }
  };

  const confirmResetAll = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading payroll settings..." />;
  }

  // Error state
  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800">Failed to load settings</h3>
              <p className="text-red-700 text-sm mt-1">
                Unable to load payroll settings. Please try again.
              </p>
              <div className="mt-3">
                <button 
                  onClick={() => loadSettings()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Settings</h1>
          <p className="text-gray-600">Configure payroll processing and tax calculations</p>
        </div>
        {hasChanges && (
          <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Message Display */}
      <MessageDisplay message={message} onClear={clearMessage} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <PayrollCycleSettings
            payrollCycle={settings.payrollCycle}
            onCycleChange={handlePayrollCycleChange}
            onReset={confirmResetPayrollCycle}
          />

          <ApprovalWorkflowSettings
            workflow={settings.approvalWorkflow}
            onToggle={(field, value) => updateNestedSetting('approvalWorkflow', field, value)}
            onApprovalChange={(value) => updateNestedSetting('approvalWorkflow', 'requiredApprovals', value)}
          />

          <PAYETaxSettings
            taxSettings={settings.taxSettings}
            onUpdateSetting={handleUpdateTaxSetting}
            onUpdatePAYE={updatePAYESettings}
            savingPAYE={savingPAYE}
            onAddBracket={taxBracketManager.addTaxBracket}
            onRemoveBracket={handleRemoveBracket}
            onUpdateBracket={handleUpdateBracket}
            onResetPAYE={confirmResetPAYE}
          />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <QuickActionsPanel
            onResetPayrollCycle={confirmResetPayrollCycle}
            onResetPAYE={confirmResetPAYE}
            onResetAll={confirmResetAll}
            onBackup={() => console.log('Backup functionality to be implemented')}
          />

          <SystemInfoPanel
            version="v2.1.0"
            lastBackup="2 days ago"
            lastUpdated={settings.updatedAt}
          />

          {/* Tax Year Info Card */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Tax Year {settings.taxSettings?.taxYear || 2026}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• First ₦800,000 tax-free</li>
              <li>• Progressive rates up to 25%</li>
              <li>• Rent relief up to ₦500,000</li>
              <li>• NTA 2026 Compliant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Actions Footer */}
      <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
        <button 
          onClick={() => loadSettings()}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          disabled={saving || !hasChanges}
          className={`px-6 py-2 rounded-lg transition-colors ${
            saving || !hasChanges
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

// Wrap with ErrorBoundary
const PayrollSettingsWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <PayrollSettings {...props} />
  </ErrorBoundary>
);

export default PayrollSettingsWithErrorBoundary;