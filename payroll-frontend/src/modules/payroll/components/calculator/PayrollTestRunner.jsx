// src/components/payroll/PayrollTestRunner.jsx
import React, { useState, useEffect } from 'react';
import PAYECalculator from '../../../../services/payeCalculator';
import { generateTestCases, runTestSuite, generateTestReport } from '../../../../utils/payeTestGenerator'

const PayrollTestRunner = ({ settings, onTestComplete }) => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTests, setSelectedTests] = useState({
    monthlyBasic: true,
    edgeCases: true,
    deductionScenarios: true,
    cycleScenarios: true
  });

  const runSelectedTests = async () => {
    if (!settings) {
      alert('No settings available for testing');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    try {
      // Initialize calculator with current settings
      const calculator = new PAYECalculator(settings, true);
      
      // Get test cases and filter selected ones
      const allTestCases = generateTestCases();
      const filteredTests = {};
      
      Object.entries(allTestCases).forEach(([category, tests]) => {
        if (selectedTests[category]) {
          filteredTests[category] = tests;
        }
      });
      
      // Simulate progress
      const totalTests = Object.values(filteredTests).flat().length;
      let completed = 0;
      
      const interval = setInterval(() => {
        completed++;
        setProgress(Math.min((completed / totalTests) * 100, 90)); // Cap at 90% for calculation
      }, 50);
      
      // Run tests
      const results = runTestSuite(calculator);
      
      clearInterval(interval);
      setProgress(100);
      
      setTestResults(results);
      
      // Notify parent component
      if (onTestComplete) {
        onTestComplete(results);
      }
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIsRunning(false);
      }, 3000);
      
    } catch (error) {
      console.error('Test runner error:', error);
      setIsRunning(false);
    }
  };

  const downloadResults = () => {
    if (!testResults) return;
    
    const report = generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-test-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const toggleTestCategory = (category) => {
    setSelectedTests(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (isRunning) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Running Tests...</h3>
          <p className="text-gray-600 mb-4">Validating calculator against NTA 2026 standards</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">{progress.toFixed(0)}% complete</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calculator Validation</h3>
          <p className="text-gray-600">Test PAYE calculations with various scenarios</p>
        </div>
        
        {testResults && (
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              testResults.summary.successRate >= 95 
                ? 'bg-green-100 text-green-800' 
                : testResults.summary.successRate >= 80 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResults.summary.successRate.toFixed(1)}% Pass Rate
            </span>
            <button
              onClick={downloadResults}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Export
            </button>
          </div>
        )}
      </div>

      {/* Test Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Select Test Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(selectedTests).map(([category, isSelected]) => {
            const testCases = generateTestCases();
            const count = testCases[category]?.length || 0;
            
            return (
              <label 
                key={category}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTestCategory(category)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-xs text-gray-500">{count} tests</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={runSelectedTests}
          disabled={!settings}
          className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
            !settings
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Run Selected Tests
        </button>
        
        <button
          onClick={() => setTestResults(null)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results Summary */}
      {testResults && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{testResults.summary.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{testResults.summary.passed}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{testResults.summary.failed}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {testResults.summary.successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">Success Rate</div>
            </div>
          </div>

          {/* Failed Tests Details */}
          {testResults.summary.failed > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-red-700 mb-3">Failed Tests</h4>
              <div className="space-y-3">
                {Object.entries(testResults.details).map(([category, tests]) =>
                  tests
                    .filter(test => !test.passed)
                    .map(test => (
                      <div key={test.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-red-800">{test.id}</span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            {category.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{test.description}</p>
                        {test.discrepancies?.map((d, idx) => (
                          <div key={idx} className="text-xs text-red-600">
                            • {d.field}: expected {d.expected}, got {d.actual} (diff: {d.difference})
                          </div>
                        ))}
                        {test.error && (
                          <div className="text-xs text-red-600 mt-1">
                            Error: {test.error}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!testResults && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">
            Run tests to validate your PAYE calculator against NTA 2026 standards.
            Ensure all calculations are accurate before saving settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default PayrollTestRunner;