// src/components/payroll/PAYECalculatorVisualization.jsx
import React, { useState, useEffect } from 'react';
import PAYECalculator from '../../../../services/payeCalculator';
import { generateTestCases, runTestSuite, generateTestReport, runCategoryTests } from '../../../../utils/payeTestGenerator'

const PAYECalculatorVisualization = ({ settings = null }) => {
  const [calculator, setCalculator] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('test-cases');
  const [debugMode, setDebugMode] = useState(false);
  const [customInput, setCustomInput] = useState({
    basic: 300000,
    housing: 75000,
    transport: 30000,
    medical: 15000,
    entertainment: 0,
    mealSubsidy: 0,
    benefitsInKind: 0,
    annualRentPaid: 0,
    nhis: 0,
    lifeAssurance: 0,
    gratuities: 0,
    employeeCount: 1,
    payrollCycle: 'monthly',
    periodWorked: 12
  });

  // Initialize calculator
  useEffect(() => {
    const calc = new PAYECalculator(settings, debugMode);
    setCalculator(calc);
  }, [settings, debugMode]);

  // Run test suite
  const runAllTests = () => {
    if (!calculator) return;
    
    const results = runTestSuite(calculator);
    setTestResults(results);
    setActiveTab('test-results');
  };

  // Run single test case
  const runTestCase = (testCase) => {
    if (!calculator) return;
    
    try {
      const result = calculator.computePAYE({
        salaryComponents: testCase.employee?.salaryComponents || testCase.employee,
        annualRentPaid: testCase.employee?.annualRentPaid || 0,
        additionalDeductions: testCase.additionalDeductions || {},
        payrollCycle: testCase.payrollCycle || 'monthly',
        periodWorked: testCase.periodWorked || 12,
        ytdMode: testCase.periodWorked < 12 || (testCase.payrollCycle === 'weekly' && testCase.periodWorked < 52)
      });
      
      setCalculationResult(result);
      setSelectedTestCase(testCase);
      setActiveTab('calculation-details');
    } catch (error) {
      console.error('Test case failed:', error);
    }
  };

  // Run custom calculation
  const runCustomCalculation = () => {
    if (!calculator) return;
    
    const salaryComponents = {
      basic: parseFloat(customInput.basic) || 0,
      housing: parseFloat(customInput.housing) || 0,
      transport: parseFloat(customInput.transport) || 0,
      medical: parseFloat(customInput.medical) || 0,
      entertainment: parseFloat(customInput.entertainment) || 0,
      mealSubsidy: parseFloat(customInput.mealSubsidy) || 0,
      benefitsInKind: parseFloat(customInput.benefitsInKind) || 0
    };

    const additionalDeductions = {
      nhis: parseFloat(customInput.nhis) || 0,
      lifeAssurance: parseFloat(customInput.lifeAssurance) || 0,
      gratuities: parseFloat(customInput.gratuities) || 0,
      employeeCount: parseInt(customInput.employeeCount) || 1
    };

    try {
      const result = calculator.computePAYE({
        salaryComponents,
        annualRentPaid: parseFloat(customInput.annualRentPaid) || 0,
        additionalDeductions,
        payrollCycle: customInput.payrollCycle,
        periodWorked: parseInt(customInput.periodWorked) || 12,
        ytdMode: (customInput.payrollCycle === 'monthly' && customInput.periodWorked < 12) || 
                 (customInput.payrollCycle === 'weekly' && customInput.periodWorked < 52)
      });
      
      setCalculationResult(result);
      setSelectedTestCase({
        description: 'Custom Calculation',
        employee: salaryComponents,
        payrollCycle: customInput.payrollCycle,
        periodWorked: customInput.periodWorked
      });
      setActiveTab('calculation-details');
    } catch (error) {
      console.error('Custom calculation failed:', error);
      alert(`Calculation error: ${error.message}`);
    }
  };

  // Download test report
  const downloadReport = () => {
    if (!testResults) return;
    
    const report = generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paye-test-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Get test case count by category
  const getTestCaseCounts = () => {
    const testCases = generateTestCases();
    return Object.entries(testCases).map(([category, cases]) => ({
      category,
      count: cases.length,
      icon: getCategoryIcon(category)
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      cycleBased: '🔄',
      ytdProjections: '📊',
      edgeCases: '⚠️',
      deductionScenarios: '💰',
      conversionTests: '⚖️'
    };
    return icons[category] || '📋';
  };

  if (!calculator) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4 text-gray-600">Initializing calculator...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">PAYE Calculator Testing & Visualization</h2>
        <p className="text-gray-600">Validate tax calculations against NTA 2026 standards</p>
        {settings && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Tax Year {settings.taxYear || 2026}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {calculator.taxBrackets?.length || 6} Tax Brackets
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run All Tests
        </button>
        
        <button
          onClick={runCustomCalculation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Run Custom Calculation
        </button>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Debug Mode</span>
        </label>
        
        {testResults && (
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Download Report
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'test-cases', label: 'Test Cases' },
            { id: 'custom-input', label: 'Custom Input' },
            { id: 'test-results', label: 'Test Results' },
            { id: 'calculation-details', label: 'Calculation Details' },
            { id: 'debug-log', label: 'Debug Log' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 text-sm font-medium flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Test Cases Tab */}
        {activeTab === 'test-cases' && (
          <div>
            <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {getTestCaseCounts().map(({ category, count, icon }) => (
                <div key={category} className="border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-xs font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-xs text-gray-500">{count} tests</div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Predefined Test Cases</h3>
            {Object.entries(generateTestCases()).map(([category, cases]) => (
              <div key={category} className="mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                  <h4 className="font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1')} ({cases.length} tests)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cases.map(testCase => (
                    <div
                      key={testCase.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => runTestCase(testCase)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{testCase.id}</h5>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {testCase.payrollCycle || 'monthly'}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {testCase.periodWorked || 12} periods
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        {testCase.employee?.salaryComponents?.basic && (
                          <div>Basic: {formatCurrency(testCase.employee.salaryComponents.basic)}</div>
                        )}
                        {testCase.employee?.basic && (
                          <div>Basic: {formatCurrency(testCase.employee.basic)}</div>
                        )}
                        {testCase.expected?.annualTax !== undefined && (
                          <div>Expected Tax: {formatCurrency(testCase.expected.annualTax)} annual</div>
                        )}
                        {testCase.expected?.ytdGross !== undefined && (
                          <div>YTD Gross: {formatCurrency(testCase.expected.ytdGross)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Input Tab */}
        {activeTab === 'custom-input' && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Custom Calculation Input</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Salary Components */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 border-b pb-2">Cycle & Period</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payroll Cycle
                  </label>
                  <select
                    value={customInput.payrollCycle}
                    onChange={(e) => setCustomInput(prev => ({
                      ...prev,
                      payrollCycle: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periods Worked
                  </label>
                  <input
                    type="number"
                    value={customInput.periodWorked}
                    onChange={(e) => setCustomInput(prev => ({
                      ...prev,
                      periodWorked: e.target.value
                    }))}
                    min="1"
                    max={customInput.payrollCycle === 'weekly' ? 52 : 12}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {customInput.payrollCycle === 'weekly' ? 'Weeks' : 'Months'} worked this year
                  </p>
                </div>

                <h4 className="font-medium text-gray-700 border-b pb-2 pt-4">
                  Salary Components ({customInput.payrollCycle})
                </h4>
                {[
                  { key: 'basic', label: 'Basic Salary', placeholder: 'e.g., 300000' },
                  { key: 'housing', label: 'Housing Allowance', placeholder: 'e.g., 75000' },
                  { key: 'transport', label: 'Transport Allowance', placeholder: 'e.g., 30000' },
                  { key: 'medical', label: 'Medical Allowance', placeholder: 'e.g., 15000' },
                  { key: 'entertainment', label: 'Entertainment', placeholder: 'e.g., 0' },
                  { key: 'mealSubsidy', label: 'Meal Subsidy', placeholder: 'e.g., 0' },
                  { key: 'benefitsInKind', label: 'Benefits in Kind', placeholder: 'e.g., 0' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₦</span>
                      <input
                        type="number"
                        value={customInput[field.key]}
                        onChange={(e) => setCustomInput(prev => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))}
                        className="border rounded-lg px-3 py-2 w-full pl-8"
                        placeholder={field.placeholder}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Inputs */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 border-b pb-2">Additional Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Rent Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">₦</span>
                    <input
                      type="number"
                      value={customInput.annualRentPaid}
                      onChange={(e) => setCustomInput(prev => ({
                        ...prev,
                        annualRentPaid: e.target.value
                      }))}
                      className="border rounded-lg px-3 py-2 w-full pl-8"
                      placeholder="e.g., 1200000"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">20% relief up to ₦500,000 annually</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Count
                  </label>
                  <input
                    type="number"
                    value={customInput.employeeCount}
                    onChange={(e) => setCustomInput(prev => ({
                      ...prev,
                      employeeCount: e.target.value
                    }))}
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="e.g., 1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">ITF applies if ≥ 5 employees</p>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2 mb-3">Voluntary Deductions</h4>
                  {[
                    { key: 'nhis', label: 'NHIS Contribution', placeholder: 'e.g., 15000' },
                    { key: 'lifeAssurance', label: 'Life Assurance', placeholder: 'e.g., 5000' },
                    { key: 'gratuities', label: 'Gratuities', placeholder: 'e.g., 0' }
                  ].map(field => (
                    <div key={field.key} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₦</span>
                        <input
                          type="number"
                          value={customInput[field.key]}
                          onChange={(e) => setCustomInput(prev => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))}
                          className="border rounded-lg px-3 py-2 w-full pl-8"
                          placeholder={field.placeholder}
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 border-b pb-2">Calculation Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payroll Cycle:</span>
                    <span className="font-medium capitalize">{customInput.payrollCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Periods Worked:</span>
                    <span className="font-medium">{customInput.periodWorked} {customInput.payrollCycle === 'weekly' ? 'weeks' : 'months'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent Relief:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        Math.min(
                          (parseFloat(customInput.annualRentPaid) || 0) * 0.2,
                          500000
                        )
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <button
                      onClick={runCustomCalculation}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Calculate PAYE
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">Current Tax Settings</h5>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>
                      <div className="font-semibold">Tax Brackets:</div>
                      {calculator.taxBrackets.map((bracket, index) => (
                        <div key={index} className="flex justify-between ml-2">
                          <span>₦{bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : `₦${bracket.max.toLocaleString()}`}:</span>
                          <span>{(bracket.rate * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-semibold">Statutory Rates:</div>
                      <div className="ml-2">
                        <div>Pension: {formatPercentage(calculator.rates.employeePension * 100)} employee, {formatPercentage(calculator.rates.employerPension * 100)} employer</div>
                        <div>NHF: {formatPercentage(calculator.rates.nhf * 100)}</div>
                        <div>NHIS: {formatPercentage(calculator.rates.nhis * 100)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* Test Results Tab */}
        {activeTab === 'test-results' && testResults && (
          <div>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{testResults.summary.total}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{testResults.summary.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{testResults.summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{testResults.summary.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{testResults.calculatorVersion || '2.0.0'}</div>
                  <div className="text-sm text-gray-600">Version</div>
                </div>
              </div>
              
              {/* Category Success Rates */}
              {testResults.summary.categories && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Category Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(testResults.summary.categories).map(([category, stats]) => (
                      <div key={category} className="text-center p-2 bg-white rounded border">
                        <div className="text-xs text-gray-600 mb-1 capitalize">
                          {category.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className={`text-sm font-bold ${
                          stats.successRate >= 95 ? 'text-green-600' :
                          stats.successRate >= 80 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stats.successRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {stats.passed}/{stats.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {Object.entries(testResults.details).map(([category, tests]) => (
              <div key={category} className="mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                  <h4 className="font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {tests.filter(t => t.passed).length}/{tests.length} passed
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Tax</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calculated Tax</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tests.map(test => (
                        <tr key={test.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{test.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>{test.payrollCycle || 'monthly'}</span>
                              <span className="text-xs text-gray-500">
                                {test.periodWorked || 12} periods
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              test.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {test.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {test.expected?.annualTax 
                              ? formatCurrency(test.expected.annualTax)
                              : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {test.calculated?.taxCalculation?.annualTax 
                              ? formatCurrency(test.calculated.taxCalculation.annualTax)
                              : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {test.expected?.annualTax && test.calculated?.taxCalculation?.annualTax ? (
                              <span className={Math.abs(test.expected.annualTax - test.calculated.taxCalculation.annualTax) > 100 ? 'text-red-600' : 'text-green-600'}>
                                {formatCurrency(Math.abs(test.expected.annualTax - test.calculated.taxCalculation.annualTax))}
                              </span>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculation Details Tab */}
        {activeTab === 'calculation-details' && calculationResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Calculation Details</h3>
                <p className="text-gray-600">{selectedTestCase?.description || 'Custom Calculation'}</p>

                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {calculationResult.payrollCycle || selectedTestCase?.payrollCycle || 'monthly'} cycle
                  </span>
                  {calculationResult.isYTDCalculation && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      YTD Calculation
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {calculationResult.monthsWorked || selectedTestCase?.periodWorked || 12} periods
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Calculated on</div>
                <div className="text-sm font-medium">
                  {new Date(calculationResult.calculationDate).toLocaleString()}
                </div>
              </div>
            </div>

            {/* YTD Projection Section */}
            {calculationResult.ytdProjection && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Year-to-Date Projection</h4>
                    <p className="text-sm text-gray-600">
                      {calculationResult.ytdProjection.monthsWorked.toFixed(1)} of 12 months completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculationResult.ytdProjection.completionPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Year completed</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${calculationResult.ytdProjection.completionPercentage}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-700 mb-3">Year-to-Date</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Income:</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.ytdProjection.ytdGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Paid:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(calculationResult.ytdProjection.ytdTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Income:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(calculationResult.ytdProjection.ytdNet)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-700 mb-3">Projected Full Year</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Gross:</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.ytdProjection.projectedAnnual.gross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Tax:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(calculationResult.ytdProjection.projectedAnnual.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Net:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(calculationResult.ytdProjection.projectedAnnual.net)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-1">Monthly Gross</div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(calculationResult.grossEmolument)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Annual: {formatCurrency(calculationResult.annualGrossEmolument)}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-red-700 mb-1">Monthly Tax</div>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(calculationResult.deductions.monthlyTax)}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Annual: {formatCurrency(calculationResult.taxCalculation.annualTax)}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 mb-1">Monthly Net Pay</div>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(calculationResult.netPay)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {calculationResult.taxCalculation.effectiveTaxRate.toFixed(2)}% effective tax rate
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Breakdown */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-4">Income Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(calculationResult.employee.salaryComponents || {}).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{formatCurrency(value)}</span>
                      </div>
                    )
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Monthly Gross:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(calculationResult.grossEmolument)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-4">Deductions Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(calculationResult.deductions.statutory || {}).map(([key, value]) => {
                    if (typeof value === 'number' && value > 0 && !['breakdown', 'totalEmployeeDeductions', 'totalEmployerContributions'].includes(key)) {
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(value)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  {calculationResult.deductions.rentRelief > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rent Relief:</span>
                      <span className="font-medium text-green-600">+{formatCurrency(calculationResult.deductions.rentRelief)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Monthly Deductions:</span>
                      <span className="text-lg font-bold text-red-900">
                        -{formatCurrency(calculationResult.deductions.totalMonthlyDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Bracket Visualization */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4">Tax Bracket Calculation</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Annual Taxable Income: {formatCurrency(calculationResult.taxCalculation.annualTaxableIncome)}</span>
                  <span>Total Tax: {formatCurrency(calculationResult.taxCalculation.annualTax)}</span>
                </div>
                
                {/* Tax bracket progress bar */}
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  {calculationResult.taxCalculation.bracketCalculations?.map((bracket, index) => {
                    const percentage = (bracket.taxableAmount / calculationResult.taxCalculation.annualTaxableIncome) * 100;
                    return percentage > 0 ? (
                      <div
                        key={index}
                        className="absolute h-full"
                        style={{
                          left: `${(bracket.taxableAmount * index) / calculationResult.taxCalculation.annualTaxableIncome * 100}%`,
                          width: `${percentage}%`,
                          backgroundColor: `hsl(${index * 40}, 70%, 50%)`
                        }}
                        title={`${bracket.bracket} - ${(bracket.rate * 100).toFixed(1)}%`}
                      />
                    ) : null;
                  })}
                </div>
                
                {/* Bracket details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {calculationResult.taxCalculation.taxBreakdown?.map((bracket, index) => (
                    bracket.tax > 0 && (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-700">{bracket.band}</span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {bracket.rate}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Taxable:</span>
                            <span className="font-medium">{formatCurrency(bracket.taxableAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Tax:</span>
                            <span className="font-medium text-red-600">{formatCurrency(bracket.tax)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Employer Cost Breakdown */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4">Employer Cost Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Gross Salary Cost</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculationResult.employerCosts.monthly)}
                  </div>
                  <div className="text-xs text-gray-500">Monthly</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Statutory Contributions</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(calculationResult.employerCosts.contributions)}
                  </div>
                  <div className="text-xs text-gray-500">Monthly</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(calculationResult.employerCosts.annual)}
                  </div>
                  <div className="text-xs text-gray-500">Annual</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p className="mb-1">Employer statutory contributions include:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Employer Pension: {formatPercentage(calculator.rates.employerPension * 100)} of pensionable emoluments</li>
                  <li>NSITF: {formatPercentage(calculator.rates.nsitf * 100)} of gross emolument</li>
                  {calculationResult.employerCosts.contributions > 0 && calculator.rates.itf > 0 && (
                    <li>ITF: {formatPercentage(calculator.rates.itf * 100)} of gross emolument (for companies with 5+ employees)</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Debug Log Tab */}
        {activeTab === 'debug-log' && debugMode && calculationResult?.calculationLog && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Calculation Debug Log</h3>
            <div className="space-y-4">
              {calculationResult.calculationLog.map((logEntry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Step {index + 1}: {logEntry.step}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(logEntry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                      {JSON.stringify(logEntry.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Active Tab Content */}
        {!['test-cases', 'custom-input', 'test-results', 'calculation-details', 'debug-log'].includes(activeTab) && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Calculation Data</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Run test cases or enter custom values to see detailed calculations and visualizations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PAYECalculatorVisualization;