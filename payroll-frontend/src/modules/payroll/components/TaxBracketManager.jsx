// src/components/payroll/TaxBracketManager.jsx
import React from 'react';

const TaxBracketManager = ({
  brackets,
  onAddBracket,
  onRemoveBracket,
  onUpdateBracket,
  disabled = false
}) => {
  const formatCurrency = (value) => {
    if (value === Infinity) return 'Infinity';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-700">
          Tax Brackets ({brackets?.length || 0} brackets)
        </h4>
        <button
          onClick={onAddBracket}
          disabled={disabled}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Bracket
        </button>
      </div>
      
      <div className="space-y-3">
        {brackets?.map((bracket, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="col-span-1">
              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            </div>
            
            <div className="col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Min Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">₦</span>
                <input
                  type="text"
                  value={bracket.min}
                  onChange={(e) => onUpdateBracket(index, 'min', e.target.value)}
                  disabled={index === 0 || disabled}
                  className="border rounded-lg px-3 py-2 w-full pl-8 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Max Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">₦</span>
                <input
                  type="text"
                  value={bracket.max === Infinity ? 'Infinity' : bracket.max}
                  onChange={(e) => {
                    const value = e.target.value === 'Infinity' ? Infinity : e.target.value;
                    onUpdateBracket(index, 'max', value);
                  }}
                  disabled={index === brackets.length - 1 || disabled}
                  className="border rounded-lg px-3 py-2 w-full pl-8 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Infinity"
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Rate</label>
              <div className="relative">
                <input
                  type="text"
                  value={(bracket.rate * 100).toFixed(2)}
                  onChange={(e) => onUpdateBracket(index, 'rate', e.target.value)}
                  disabled={disabled}
                  className="border rounded-lg px-3 py-2 w-full pr-10 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Description</label>
              <input
                type="text"
                value={bracket.description || ''}
                onChange={(e) => onUpdateBracket(index, 'description', e.target.value)}
                disabled={disabled}
                className="border rounded-lg px-3 py-2 w-full text-sm disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Bracket description"
              />
            </div>
            
            <div className="col-span-1 flex justify-center">
              {brackets.length > 2 && index !== brackets.length - 1 && !disabled && (
                <button
                  onClick={() => onRemoveBracket(index)}
                  className="text-red-600 hover:text-red-800 p-1 transition-colors"
                  title="Remove bracket"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>• First bracket must start from 0</p>
        <p>• Last bracket must extend to Infinity</p>
        <p>• Brackets must be contiguous (no gaps)</p>
      </div>
    </div>
  );
};

export default TaxBracketManager;