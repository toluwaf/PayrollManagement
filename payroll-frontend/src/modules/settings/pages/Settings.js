import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState({
    company: {
      name: 'NNPC Limited',
      address: 'NNPC Towers, Herbert Macaulay Way, Central Business District, Abuja',
      phone: '+234-9-460-1000',
      email: 'info@nnpcgroup.com',
      taxId: 'TIN-001234567'
    },
    payroll: {
      paymentDate: '25',
      currency: 'NGN',
      autoProcess: true,
      approvalRequired: true
    },
    deductions: {
      payeEnabled: true,
      pensionEnabled: true,
      nhfEnabled: true,
      nsitfEnabled: true
    },
    notifications: {
      payrollReminder: true,
      complianceAlerts: true,
      systemUpdates: true,
      monthlyReports: true
    }
  });

  const handleSave = (section) => {
    // In a real app, this would save to backend
    alert(`${section} settings saved successfully!`);
  };

  const tabs = [
    { id: 'company', name: 'Company Info', icon: '🏢' },
    { id: 'payroll', name: 'Payroll Settings', icon: '💰' },
    { id: 'deductions', name: 'Deductions', icon: '📊' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' }
  ];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-white rounded-lg shadow-sm p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'company' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={settings.company.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      company: { ...settings.company, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={settings.company.taxId}
                    onChange={(e) => setSettings({
                      ...settings,
                      company: { ...settings.company, taxId: e.target.value }
                    })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    rows="3"
                    value={settings.company.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      company: { ...settings.company, address: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={settings.company.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      company: { ...settings.company, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-lg"
                    value={settings.company.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      company: { ...settings.company, email: e.target.value }
                    })}
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('Company')}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save Company Information
              </button>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Payroll Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={settings.payroll.paymentDate}
                      onChange={(e) => setSettings({
                        ...settings,
                        payroll: { ...settings.payroll, paymentDate: e.target.value }
                      })}
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={settings.payroll.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        payroll: { ...settings.payroll, currency: e.target.value }
                      })}
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={settings.payroll.autoProcess}
                      onChange={(e) => setSettings({
                        ...settings,
                        payroll: { ...settings.payroll, autoProcess: e.target.checked }
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-process payroll on payment date</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={settings.payroll.approvalRequired}
                      onChange={(e) => setSettings({
                        ...settings,
                        payroll: { ...settings.payroll, approvalRequired: e.target.checked }
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Require approval before payment</span>
                  </label>
                </div>
              </div>
              <button 
                onClick={() => handleSave('Payroll')}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save Payroll Settings
              </button>
            </div>
          )}

          {activeTab === 'deductions' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Statutory Deductions</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Nigerian Statutory Requirements</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span>
                        <span className="font-medium">PAYE Tax</span>
                        <div className="text-sm text-gray-600">Personal Income Tax</div>
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={settings.deductions.payeEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          deductions: { ...settings.deductions, payeEnabled: e.target.checked }
                        })}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span>
                        <span className="font-medium">Pension Contributions</span>
                        <div className="text-sm text-gray-600">8% Employee, 10% Employer</div>
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={settings.deductions.pensionEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          deductions: { ...settings.deductions, pensionEnabled: e.target.checked }
                        })}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span>
                        <span className="font-medium">National Housing Fund (NHF)</span>
                        <div className="text-sm text-gray-600">2.5% of Basic Salary</div>
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={settings.deductions.nhfEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          deductions: { ...settings.deductions, nhfEnabled: e.target.checked }
                        })}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span>
                        <span className="font-medium">NSITF</span>
                        <div className="text-sm text-gray-600">1% Employer Contribution</div>
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={settings.deductions.nsitfEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          deductions: { ...settings.deductions, nsitfEnabled: e.target.checked }
                        })}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSave('Deductions')}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save Deduction Settings
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Email Notifications</h3>
                  <div className="space-y-3">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={value}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, [key]: e.target.checked }
                          })}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSave('Notifications')}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save Notification Settings
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">User Management</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> User management functionality will be implemented in the backend phase.
                </p>
              </div>
              <p>This section will allow you to manage system users, roles, and permissions.</p>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">System Integrations</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Integration settings will be configured during backend development.
                </p>
              </div>
              <p>This section will include settings for bank APIs, FIRS integration, and other third-party services.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;