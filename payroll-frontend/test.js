// test-payroll-settings.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update with your API URL
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6ImFkbWluQHBheXJvbGwuY29tIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IlN5c3RlbSBBZG1pbmlzdHJhdG9yIiwiZGVwYXJ0bWVudCI6IklUIiwiaWF0IjoxNzY0OTcyNTI3LCJleHAiOjE3NjQ5ODMzMjd9.QBdD9aUVVsqCEP5xOHAAdXlG8AVoL6UrzFVTFRgJmQ4'; // Replace with actual token or get from login

// Create axios instance with auth headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  },
  timeout: 10000
});

// Test data
const validPayrollSettings = {
  payrollCycle: 'monthly',
  approvalWorkflow: {
    enabled: true,
    requiredApprovals: 2,
    approvers: []
  },
  taxSettings: {
    taxYear: 2026,
    taxBrackets: [
      { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
      { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
      { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
      { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
      { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
      { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
    ],
    statutoryRates: {
      employeePension: 0.08,
      employerPension: 0.10,
      nhf: 0.025,
      nhis: 0.05,
      nsitf: 0.01,
      itf: 0.01
    },
    reliefs: {
      rentRelief: 0.20,
      rentReliefCap: 500000
    }
  },
  paymentSettings: {
    defaultBank: 'bank_1',
    paymentMethods: ['bank_transfer'],
    processingDays: 3,
    autoGeneratePaymentFiles: true
  },
  notificationSettings: {
    onPayrollProcess: true,
    onApprovalRequired: true,
    onPaymentProcessed: true,
    recipients: []
  },
  systemSettings: {
    autoBackup: true,
    backupFrequency: 'weekly',
    dataRetentionMonths: 36
  }
};

const invalidPayrollSettings = {
  payrollCycle: 'invalid-cycle', // Invalid cycle
  approvalWorkflow: {
    enabled: true,
    requiredApprovals: 10, // Too many approvals
    approvers: []
  },
  taxSettings: {
    taxYear: 1999, // Invalid year
    taxBrackets: [
      { min: 100, max: 50000, rate: 2.0 }, // Rate > 1
      { min: 50001, max: 200000, rate: 0.3 }
    ]
  }
};

const validPAYESettings = {
  taxYear: 2026,
  taxBrackets: [
    { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
    { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
    { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
    { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
    { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
    { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
  ],
  statutoryRates: {
    employeePension: 0.08,
    employerPension: 0.10,
    nhf: 0.025,
    nhis: 0.05,
    nsitf: 0.01,
    itf: 0.01
  },
  reliefs: {
    rentRelief: 0.20,
    rentReliefCap: 500000
  }
};

const invalidPAYESettings = {
  taxYear: 1990, // Invalid year
  taxBrackets: [
    { min: 50000, max: 100000, rate: 1.5 }, // Rate > 1
    { min: 100001, max: 200000, rate: 0.3 }
  ]
};

// Test runner class
class PayrollSettingsTester {
  constructor() {
    this.testResults = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      info: '\x1b[36m',    // Cyan
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async recordTest(testName, passed, error = null, response = null) {
    const result = {
      testName,
      timestamp: new Date().toISOString(),
      passed,
      error: error ? error.message : null,
      response: response ? {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      } : null
    };

    this.testResults.push(result);
    
    if (passed) {
      this.passed++;
      this.log(`✓ ${testName} - PASSED`, 'success');
    } else {
      this.failed++;
      this.log(`✗ ${testName} - FAILED: ${error?.message || 'Unknown error'}`, 'error');
      
      if (response) {
        this.log(`  Status: ${response.status} ${response.statusText}`, 'warning');
        if (response.data) {
          this.log(`  Response: ${JSON.stringify(response.data, null, 2)}`, 'warning');
        }
      }
    }

    return passed;
  }

  async testEndpoint(name, method, endpoint, data = null) {
    try {
      const response = await api({
        method,
        url: endpoint,
        data
      });
      
      this.log(`Request to ${endpoint}: ${method.toUpperCase()}`, 'info');
      this.log(`Payload: ${data ? JSON.stringify(data, null, 2) : 'none'}`, 'info');
      
      return {
        success: true,
        response
      };
    } catch (error) {
      return {
        success: false,
        error,
        response: error.response
      };
    }
  }

  // Test 1: Get current payroll settings
  async testGetPayrollSettings() {
    const result = await this.testEndpoint(
      'GET /payroll/settings/current',
      'GET',
      '/payroll/settings/current'
    );
    
    const passed = result.success && 
                  result.response && 
                  result.response.status === 200 && 
                  result.response.data;
    
    return this.recordTest(
      'Get Current Payroll Settings',
      passed,
      result.error,
      result.response
    );
  }

  // Test 2: Update payroll settings with valid data
  async testUpdateValidPayrollSettings() {
    const result = await this.testEndpoint(
      'PUT /payroll/settings/update (valid)',
      'PUT',
      '/payroll/settings/update',
      validPayrollSettings
    );
    
    const passed = result.success && 
                  result.response && 
                  result.response.status === 200 && 
                  result.response.data.success === true;
    
    return this.recordTest(
      'Update Payroll Settings (Valid)',
      passed,
      result.error,
      result.response
    );
  }

  // Test 3: Update payroll settings with invalid data
  async testUpdateInvalidPayrollSettings() {
    const result = await this.testEndpoint(
      'PUT /payroll/settings/update (invalid)',
      'PUT',
      '/payroll/settings/update',
      invalidPayrollSettings
    );
    
    // This should fail with 400 status
    const passed = !result.success && 
                  result.response && 
                  result.response.status === 400;
    
    return this.recordTest(
      'Update Payroll Settings (Invalid - Should Fail)',
      passed,
      result.error,
      result.response
    );
  }

  // Test 4: Get PAYE settings
  async testGetPAYESettings() {
    const result = await this.testEndpoint(
      'GET /payroll/settings/paye',
      'GET',
      '/payroll/settings/paye'
    );
    
    const passed = result.success && 
                  result.response && 
                  result.response.status === 200 && 
                  result.response.data;
    
    return this.recordTest(
      'Get PAYE Settings',
      passed,
      result.error,
      result.response
    );
  }

  // Test 5: Update PAYE settings with valid data
  async testUpdateValidPAYESettings() {
    const result = await this.testEndpoint(
      'PUT /payroll/settings/paye (valid)',
      'PUT',
      '/payroll/settings/paye',
      validPAYESettings
    );
    
    const passed = result.success && 
                  result.response && 
                  result.response.status === 200 && 
                  result.response.data.success === true;
    
    return this.recordTest(
      'Update PAYE Settings (Valid)',
      passed,
      result.error,
      result.response
    );
  }

  // Test 6: Update PAYE settings with invalid data
  async testUpdateInvalidPAYESettings() {
    const result = await this.testEndpoint(
      'PUT /payroll/settings/paye (invalid)',
      'PUT',
      '/payroll/settings/paye',
      invalidPAYESettings
    );
    
    // This should fail with 400 status
    const passed = !result.success && 
                  result.response && 
                  result.response.status === 400;
    
    return this.recordTest(
      'Update PAYE Settings (Invalid - Should Fail)',
      passed,
      result.error,
      result.response
    );
  }

  // Test 7: Get default payroll settings
  async testGetDefaultPayrollSettings() {
    const result = await this.testEndpoint(
      'GET /payroll/settings/default',
      'GET',
      '/payroll/settings/default'
    );
    
    const passed = result.success && 
                  result.response && 
                  result.response.status === 200 && 
                  result.response.data;
    
    return this.recordTest(
      'Get Default Payroll Settings',
      passed,
      result.error,
      result.response
    );
  }

  // Test 8: Test tax bracket continuity
  async testTaxBracketContinuity() {
    const invalidContinuitySettings = {
      ...validPayrollSettings,
      taxSettings: {
        ...validPayrollSettings.taxSettings,
        taxBrackets: [
          { min: 0, max: 100000, rate: 0.0 },
          { min: 200000, max: 300000, rate: 0.1 } // Gap at 100001-199999
        ]
      }
    };

    const result = await this.testEndpoint(
      'PUT /payroll/settings/update (bracket continuity)',
      'PUT',
      '/payroll/settings/update',
      invalidContinuitySettings
    );
    
    const passed = !result.success && 
                  result.response && 
                  result.response.status === 400 &&
                  result.response.data?.message?.includes('continuity');
    
    return this.recordTest(
      'Tax Bracket Continuity Validation',
      passed,
      result.error,
      result.response
    );
  }

  // Test 9: Test empty tax brackets
  async testEmptyTaxBrackets() {
    const emptyBracketsSettings = {
      ...validPayrollSettings,
      taxSettings: {
        ...validPayrollSettings.taxSettings,
        taxBrackets: []
      }
    };

    const result = await this.testEndpoint(
      'PUT /payroll/settings/update (empty brackets)',
      'PUT',
      '/payroll/settings/update',
      emptyBracketsSettings
    );
    
    const passed = !result.success && 
                  result.response && 
                  result.response.status === 400;
    
    return this.recordTest(
      'Empty Tax Brackets Validation',
      passed,
      result.error,
      result.response
    );
  }

  // Test 10: Test complete round-trip
  async testCompleteRoundTrip() {
    try {
      // 1. Get current settings
      const getResult = await api.get('/payroll/settings/current');
      const originalSettings = getResult.data;
      
      // 2. Update with modified settings
      const modifiedSettings = {
        ...validPayrollSettings,
        payrollCycle: 'bi-weekly',
        approvalWorkflow: {
          enabled: false,
          requiredApprovals: 1,
          approvers: []
        }
      };
      
      const updateResult = await api.put('/payroll/settings/update', modifiedSettings);
      
      // 3. Get settings again to verify
      const verifyResult = await api.get('/payroll/settings/current');
      const updatedSettings = verifyResult.data;
      
      // 4. Restore original settings
      await api.put('/payroll/settings/update', originalSettings.data || originalSettings);
      
      const passed = updateResult.status === 200 && 
                    verifyResult.status === 200 &&
                    updatedSettings.payrollCycle === 'bi-weekly';
      
      return this.recordTest(
        'Complete Round-Trip Test',
        passed,
        null,
        updateResult
      );
    } catch (error) {
      return this.recordTest(
        'Complete Round-Trip Test',
        false,
        error,
        error.response
      );
    }
  }

  async runAllTests() {
    this.log('Starting Payroll Settings Tests...', 'info');
    this.log('='.repeat(60), 'info');
    
    const tests = [
      this.testGetPayrollSettings.bind(this),
      this.testGetPAYESettings.bind(this),
      this.testGetDefaultPayrollSettings.bind(this),
      this.testUpdateValidPayrollSettings.bind(this),
      this.testUpdateInvalidPayrollSettings.bind(this),
      this.testUpdateValidPAYESettings.bind(this),
      this.testUpdateInvalidPAYESettings.bind(this),
      this.testTaxBracketContinuity.bind(this),
      this.testEmptyTaxBrackets.bind(this),
      this.testCompleteRoundTrip.bind(this)
    ];

    for (let i = 0; i < tests.length; i++) {
      this.log(`\nRunning Test ${i + 1}/${tests.length}...`, 'info');
      await tests[i]();
      await this.sleep(500); // Small delay between tests
    }

    this.generateReport();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${this.passed} (${((this.passed / this.testResults.length) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${this.failed} (${((this.failed / this.testResults.length) * 100).toFixed(1)}%)`);
    
    console.log('\n' + '='.repeat(60));
    console.log('DETAILED RESULTS:');
    console.log('='.repeat(60));
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const color = result.passed ? '\x1b[32m' : '\x1b[31m';
      console.log(`${color}${index + 1}. ${result.testName} - ${status}\x1b[0m`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.response && result.response.data && result.response.data.message) {
        console.log(`   Message: ${result.response.data.message}`);
      }
      
      if (result.response && result.response.data && result.response.data.details) {
        console.log(`   Details: ${JSON.stringify(result.response.data.details, null, 2)}`);
      }
    });

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.passed,
        failed: this.failed,
        successRate: ((this.passed / this.testResults.length) * 100).toFixed(1)
      },
      results: this.testResults
    };

    const filename = `payroll-settings-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\nDetailed report saved to: ${filename}`);
  }
}

// Quick test script
async function quickTest() {
  const tester = new PayrollSettingsTester();
  
  console.log('Running quick connection test...');
  
  try {
    // Test connection
    const response = await api.get('/payroll/settings/current');
    console.log('✓ Connection successful');
    console.log(`Response status: ${response.status}`);
    
    if (response.data) {
      console.log('Current settings structure:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    // Run all tests
    await tester.runAllTests();
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your backend server is running');
    console.log('2. Update BASE_URL in the test script');
    console.log('3. Check AUTH_TOKEN is valid');
    console.log('4. Verify CORS settings on backend');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nServer not reachable at:', BASE_URL);
    }
  }
}

// Main execution
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--quick') || args.includes('-q')) {
    quickTest();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Payroll Settings Testing Script
===============================

Usage:
  node test-payroll-settings.js [options]

Options:
  --quick, -q    Run quick connection test only
  --help, -h     Show this help message
  --all          Run all tests (default)

Environment Setup:
  1. Update BASE_URL in the script (line 9)
  2. Set AUTH_TOKEN or implement login in the script
  3. Install axios: npm install axios
  4. Run: node test-payroll-settings.js

Configuration:
  BASE_URL: ${BASE_URL}
  AUTH_TOKEN: ${AUTH_TOKEN ? 'Set' : 'NOT SET - Please update!'}
    `);
  } else {
    const tester = new PayrollSettingsTester();
    tester.runAllTests();
  }
}

module.exports = { PayrollSettingsTester };