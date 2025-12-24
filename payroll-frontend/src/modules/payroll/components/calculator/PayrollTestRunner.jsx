// src/components/payroll/PayrollTestRunner.jsx
import React, { useState, useEffect } from 'react';
import PAYECalculator from '../../../../services/payeCalculator';
import { 
  generateTestCases, 
  runTestSuite, 
  generateTestReport,
  runCategoryTests,
  generateCycleConversionMatrix 
} from '../../../../utils/payeTestGenerator';

const PayrollTestRunner = ({ settings, onTestComplete }) => {
  const [testResults, setTestResults] = useState(null);
  const [conversionMatrix, setConversionMatrix] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTests, setSelectedTests] = useState({
    cycleBased: true,
    ytdProjections: true,
    edgeCases: true,
    deductionScenarios: true,
    conversionTests: true
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
      
      // Run conversion matrix test
      const matrix = generateCycleConversionMatrix(calculator);
      setConversionMatrix(matrix);
      
      // Simulate progress
      const totalTests = Object.values(filteredTests).flat().length;
      let completed = 0;
      
      const interval = setInterval(() => {
        completed++;
        setProgress(Math.min((completed / totalTests) * 90, 90));
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

  const runSpecificCategory = async (category) => {
    if (!settings) {
      alert('No settings available for testing');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    try {
      const calculator = new PAYECalculator(settings, true);
      
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const results = runCategoryTests(calculator, category);
      
      clearInterval(interval);
      setProgress(100);
      
      // Update test results with just this category
      setTestResults(prev => ({
        ...prev,
        summary: {
          total: results.total,
          passed: results.passed,
          failed: results.failed,
          successRate: results.successRate,
          categories: {
            ...prev?.summary?.categories,
            [category]: {
              total: results.total,
              passed: results.passed,
              failed: results.failed,
              successRate: results.successRate
            }
          }
        },
        details: {
          ...prev?.details,
          [category]: results.details
        }
      }));
      
      setTimeout(() => {
        setIsRunning(false);
      }, 1000);
      
    } catch (error) {
      console.error('Category test error:', error);
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

  const getCategoryInfo = (category) => {
    const info = {
      cycleBased: {
        title: 'Cycle Based Tests',
        description: 'Tests for monthly, annual, and weekly payroll cycles',
        count: 7,
        icon: '🔄'
      },
      ytdProjections: {
        title: 'YTD Projections',
        description: 'Year-to-Date calculations with partial periods',
        count: 3,
        icon: '📊'
      },
      edgeCases: {
        title: 'Edge Cases',
        description: 'Zero income, benefits only, maximum relief cases',
        count: 4,
        icon: '⚠️'
      },
      deductionScenarios: {
        title: 'Deduction Scenarios',
        description: 'NHIS, pension, rent relief, and statutory deductions',
        count: 3,
        icon: '💰'
      },
      conversionTests: {
        title: 'Conversion Tests',
        description: 'Cycle conversion accuracy tests',
        count: 2,
        icon: '⚖️'
      }
    };
    return info[category] || { title: category, description: '', count: 0, icon: '📋' };
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
          {settings && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Using Tax Year {settings.taxYear || 2026} Settings
              </span>
            </div>
          )}
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
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Test Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Select Test Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(selectedTests).map(([category, isSelected]) => {
            const info = getCategoryInfo(category);
            const testCases = generateTestCases();
            const count = testCases[category]?.length || info.count;
            
            return (
              <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTestCategory(category)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="mr-2">{info.icon}</span>
                      <div className="text-sm font-medium text-gray-900">{info.title}</div>
                    </div>
                    <div className="text-xs text-gray-500">{info.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{count} tests</span>
                  {testResults?.summary?.categories?.[category] && (
                    <button
                      onClick={() => runSpecificCategory(category)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Run
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
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
          onClick={() => {
            setTestResults(null);
            setConversionMatrix(null);
          }}
          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* Conversion Matrix */}
      {conversionMatrix && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Cycle Conversion Matrix</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-3 py-2 text-left">From</th>
                  <th className="px-3 py-2 text-left">To</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Converted</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {conversionMatrix.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b border-blue-200">
                    <td className="px-3 py-2">{row.fromCycle}</td>
                    <td className="px-3 py-2">{row.toCycle}</td>
                    <td className="px-3 py-2">₦{row.amount.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {row.error ? 'Error' : `₦${row.converted.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {row.error ? 'Failed' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
                {conversionMatrix.length > 5 && (
                  <tr>
                    <td colSpan="5" className="px-3 py-2 text-center text-blue-600 text-sm">
                      Showing 5 of {conversionMatrix.length} conversions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Results Summary */}
      {testResults && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {testResults.calculatorVersion || '2.0.0'}
              </div>
              <div className="text-sm text-purple-600">Version</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
            <div className="space-y-3">
              {testResults.summary.categories && Object.entries(testResults.summary.categories).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3">{getCategoryInfo(category).icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{getCategoryInfo(category).title}</div>
                      <div className="text-xs text-gray-500">{stats.passed}/{stats.total} tests passed</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats.successRate >= 95 ? 'bg-green-100 text-green-800' :
                    stats.successRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stats.successRate.toFixed(1)}%
                  </div>
                </div>
              ))}
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
                          <div>
                            <span className="font-medium text-red-800">{test.id}</span>
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {test.payrollCycle || 'monthly'}, {test.periodWorked || 12} periods
                          </div>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{test.description}</p>
                        {test.discrepancies?.map((d, idx) => (
                          <div key={idx} className="text-xs text-red-600 mb-1">
                            • {d.field}: expected {d.expected} {d.unit || ''}, got {d.actual} {d.unit || ''} (diff: {d.difference})
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
          {!settings && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ No settings loaded. Load settings first or calculator will use defaults.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollTestRunner;