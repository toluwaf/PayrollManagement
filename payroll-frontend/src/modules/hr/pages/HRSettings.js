// HRSettings.js
import React, { useState, useEffect } from 'react';
import { settingsService } from '../../../services/settingsService';

const HRSettings = () => {
  const [salaryBands, setSalaryBands] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSalaryBands();
  }, []);

  const loadSalaryBands = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSalaryBands();
      if (response.success) {
        setSalaryBands(response.data);
      } else {
        // Set default salary bands
        setSalaryBands({
          entry: 500000,
          junior: 800000,
          mid: 1000000,
          senior: 1200000,
          lead: 1500000,
          principal: 2000000,
          executive: 3000000
        });
      }
    } catch (error) {
      console.error('Failed to load salary bands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalaryChange = (band, value) => {
    setSalaryBands(prev => ({
      ...prev,
      [band]: parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateSalaryBands(salaryBands);
      if (response.success) {
        alert('Salary bands updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save salary bands:', error);
      alert('Failed to save salary bands');
    } finally {
      setSaving(false);
    }
  };

  const salaryBandsConfig = [
    { key: 'entry', label: 'Entry Level', description: 'Trainee, Intern, Entry-level positions' },
    { key: 'junior', label: 'Junior Level', description: 'Junior, Associate positions (1-2 years experience)' },
    { key: 'mid', label: 'Mid Level', description: 'Mid-level positions (3-5 years experience)' },
    { key: 'senior', label: 'Senior Level', description: 'Senior positions (5+ years experience)' },
    { key: 'lead', label: 'Lead Level', description: 'Team Lead, Supervisor positions' },
    { key: 'principal', label: 'Principal Level', description: 'Principal, Architect positions' },
    { key: 'executive', label: 'Executive Level', description: 'Director, VP, C-level positions' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">HR Settings</h1>
      <p className="text-gray-600 mb-6">Configure HR policies and salary structures</p>
      
      <div className="max-w-4xl space-y-6">
        {/* Salary Bands Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Salary Bands Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Set base salary ranges for different job levels. These will be used to auto-calculate salaries when creating positions.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {salaryBandsConfig.map(band => (
              <div key={band.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{band.label}</h3>
                  <p className="text-sm text-gray-500">{band.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">₦</span>
                  <input
                    type="number"
                    value={salaryBands[band.key] || 0}
                    onChange={(e) => handleSalaryChange(band.key, e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded-lg text-right font-medium"
                  />
                  <span className="text-sm text-gray-500">per month</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Salary Bands'}
            </button>
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leave Policy */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Policy</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Leave Days</span>
                <span className="font-medium">21 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sick Leave</span>
                <span className="font-medium">10 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maternity Leave</span>
                <span className="font-medium">12 weeks</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
              Configure Leave Policy
            </button>
          </div>

          {/* Probation Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Probation Period</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">3 months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Notice Period</span>
                <span className="font-medium">1 month</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
              Configure Probation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRSettings;