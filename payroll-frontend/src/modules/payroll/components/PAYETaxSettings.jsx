// src/components/payroll/PAYETaxSettings.jsx
import React from 'react';
import TaxBracketManager from './TaxBracketManager';

const PAYETaxSettings = ({
  taxSettings,
  onUpdateSetting,
  onUpdatePAYE,
  savingPAYE,
  onAddBracket,
  onRemoveBracket,
  onUpdateBracket,
  onResetPAYE,
  disabled = false
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">PAYE Tax Settings</h3>
          <p className="text-sm text-gray-600">Configure tax brackets and statutory rates for 2026</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onResetPAYE}
            disabled={disabled}
            className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            Reset Defaults
          </button>
          <button
            onClick={onUpdatePAYE}
            disabled={savingPAYE || disabled}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {savingPAYE ? 'Updating...' : 'Update PAYE'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tax Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Year
            </label>
            <input
              type="number"
              value={taxSettings?.taxYear || 2026}
              onChange={(e) => onUpdateSetting('taxYear', parseInt(e.target.value))}
              disabled={disabled}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              min="2024"
              max="2028"
            />
          </div>
          <div className="flex items-end">
            <div className="bg-blue-50 p-3 rounded-lg w-full">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">NTA 2026 Compliant</span> - Progressive tax rates from 0% to 25%
              </p>
            </div>
          </div>
        </div>

        {/* Tax Bracket Manager */}
        <TaxBracketManager
          brackets={taxSettings?.taxBrackets || []}
          onAddBracket={onAddBracket}
          onRemoveBracket={onRemoveBracket}
          onUpdateBracket={(index, field, value) => onUpdateBracket(index, field, value)}
          disabled={disabled}
        />

        {/* Statutory Rates */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Statutory Deduction Rates</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'employeePension', label: 'Employee Pension', suffix: '%', min: 0, max: 20, step: 0.1 },
              { key: 'employerPension', label: 'Employer Pension', suffix: '%', min: 0, max: 20, step: 0.1 },
              { key: 'nhf', label: 'NHF Rate', suffix: '%', min: 0, max: 10, step: 0.1 },
              { key: 'nhis', label: 'NHIS Rate', suffix: '%', min: 0, max: 10, step: 0.1 },
              { key: 'nsitf', label: 'NSITF Rate', suffix: '%', min: 0, max: 5, step: 0.01 },
              { key: 'itf', label: 'ITF Rate', suffix: '%', min: 0, max: 5, step: 0.01 }
            ].map(({ key, label, suffix, min, max, step }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={((taxSettings?.statutoryRates?.[key] || 0) * 100).toFixed(2)}
                    onChange={(e) => onUpdateSetting('statutoryRates', {
                      ...taxSettings?.statutoryRates,
                      [key]: parseFloat(e.target.value) / 100
                    })}
                    disabled={disabled}
                    min={min}
                    max={max}
                    step={step}
                    className="border rounded-lg px-3 py-2 w-full pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">{suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reliefs */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Tax Reliefs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Relief Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={((taxSettings?.reliefs?.rentRelief || 0) * 100).toFixed(2)}
                  onChange={(e) => onUpdateSetting('reliefs', {
                    ...taxSettings?.reliefs,
                    rentRelief: parseFloat(e.target.value) / 100
                  })}
                  disabled={disabled}
                  min="0"
                  max="100"
                  step="0.1"
                  className="border rounded-lg px-3 py-2 w-full pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Percentage of rent eligible for tax relief</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Relief Cap
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₦</span>
                <input
                  type="text"
                  value={new Intl.NumberFormat('en-NG').format(taxSettings?.reliefs?.rentReliefCap || 0)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    onUpdateSetting('reliefs', {
                      ...taxSettings?.reliefs,
                      rentReliefCap: parseInt(value) || 0
                    });
                  }}
                  disabled={disabled}
                  className="border rounded-lg px-3 py-2 w-full pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum amount eligible for rent relief</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PAYETaxSettings;