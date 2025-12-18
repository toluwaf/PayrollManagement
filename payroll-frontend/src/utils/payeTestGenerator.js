/**
 * Nigerian PAYE Calculator Test Data Generator
 * Generates comprehensive test cases for NTA 2025/2026 tax compliance
 */

export const generateTestCases = () => {
  const testCases = {
    // Basic salary test cases (Monthly)
    monthlyBasic: [
      // Below tax threshold
      { 
        id: 'test-001',
        description: 'Employee below tax threshold (₦400,000 annual)',
        employee: {
          name: 'John Doe',
          basic: 33333,     // Monthly: 400,000 / 12
          housing: 10000,
          transport: 5000,
          medical: 2000,
          benefitsInKind: 0
        },
        expected: {
          annualTax: 0,
          monthlyTax: 0,
          netPayRatio: 0.92 // Approx 8% pension deduction
        }
      },
      
      // At threshold boundary
      { 
        id: 'test-002',
        description: 'Employee at tax threshold boundary (₦800,000 annual)',
        employee: {
          name: 'Jane Smith',
          basic: 66667,     // Monthly: 800,000 / 12
          housing: 15000,
          transport: 8000,
          medical: 3000,
          benefitsInKind: 0
        },
        expected: {
          annualTax: 0,
          monthlyTax: 0,
          netPayRatio: 0.92
        }
      },
      
      // Just above threshold (15% bracket)
      { 
        id: 'test-003',
        description: 'Employee just above threshold (₦1,200,000 annual)',
        employee: {
          name: 'Chinedu Okoro',
          basic: 100000,    // Monthly: 1,200,000 / 12
          housing: 20000,
          transport: 10000,
          medical: 5000,
          benefitsInKind: 0
        },
        expected: {
          annualTax: 60000, // (1,200,000 - 800,000) * 15%
          monthlyTax: 5000,
          netPayRatio: 0.85 // Approx deductions
        }
      },
      
      // Middle income (18% bracket)
      { 
        id: 'test-004',
        description: 'Middle income employee (₦5,000,000 annual)',
        employee: {
          name: 'Amina Yusuf',
          basic: 416667,    // Monthly: 5,000,000 / 12
          housing: 100000,
          transport: 50000,
          medical: 15000,
          entertainment: 10000,
          benefitsInKind: 5000
        },
        expected: {
          annualTax: 579000, // Complex calculation
          monthlyTax: 48250,
          netPayRatio: 0.80
        }
      },
      
      // High income (25% bracket)
      { 
        id: 'test-005',
        description: 'High income executive (₦12,000,000 annual)',
        employee: {
          name: 'Dr. Adebayo',
          basic: 1000000,   // Monthly: 12,000,000 / 12
          housing: 300000,
          transport: 150000,
          medical: 50000,
          entertainment: 50000,
          mealSubsidy: 30000,
          benefitsInKind: 100000
        },
        expected: {
          annualTax: 2182500, // Top bracket calculation
          monthlyTax: 181875,
          netPayRatio: 0.75
        }
      },
      
      // Ultra high income
      { 
        id: 'test-006',
        description: 'Ultra high income (₦30,000,000 annual)',
        employee: {
          name: 'Chief Williams',
          basic: 2500000,   // Monthly: 30,000,000 / 12
          housing: 500000,
          transport: 250000,
          medical: 100000,
          entertainment: 150000,
          mealSubsidy: 100000,
          benefitsInKind: 500000
        },
        expected: {
          annualTax: 5887500, // Complex progressive calculation
          monthlyTax: 490625,
          netPayRatio: 0.70
        }
      }
    ],
    
    // Edge cases
    edgeCases: [
      // Zero income
      {
        id: 'edge-001',
        description: 'Zero income (internship/stipend)',
        employee: {
          name: 'Intern Student',
          basic: 0,
          housing: 0,
          transport: 0,
          medical: 0
        },
        expected: {
          annualTax: 0,
          monthlyTax: 0,
          netPayRatio: 0
        }
      },
      
      // Only benefits
      {
        id: 'edge-002',
        description: 'Income only from benefits',
        employee: {
          name: 'Consultant',
          basic: 0,
          housing: 100000,
          transport: 50000,
          medical: 30000,
          benefitsInKind: 200000
        },
        expected: {
          annualTax: 57000, // Benefits taxed
          monthlyTax: 4750,
          netPayRatio: 0.85
        }
      },
      
      // Max rent relief case
      {
        id: 'edge-003',
        description: 'Maximum rent relief utilization',
        employee: {
          name: 'High Rent Payer',
          basic: 500000,
          housing: 200000,
          transport: 100000,
          annualRentPaid: 2500000 // Should max at ₦500,000 relief
        },
        expected: {
          rentRelief: 500000,
          annualTaxReduction: 75000 // 15% of 500,000
        }
      }
    ],
    
    // Additional deductions scenarios
    deductionScenarios: [
      // With NHIS
      {
        id: 'deduct-001',
        description: 'Employee with NHIS contribution',
        employee: {
          name: 'NHIS Member',
          basic: 300000,
          housing: 75000,
          transport: 30000,
          medical: 15000
        },
        additionalDeductions: {
          nhis: 15000, // Monthly NHIS contribution
          lifeAssurance: 5000,
          gratuities: 0,
          employeeCount: 1
        },
        expected: {
          nhisDeduction: 15000,
          annualNHIS: 180000,
          taxSavings: 27000 // 15% of 180,000
        }
      },
      
      // With loan deductions
      {
        id: 'deduct-002',
        description: 'Employee with loan repayments',
        employee: {
          name: 'Loan Repayer',
          basic: 400000,
          housing: 100000,
          transport: 50000
        },
        adjustments: {
          loans: 50000,
          otherDeductions: 10000
        },
        expected: {
          totalDeductions: 60000,
          netPayReduction: 60000
        }
      },
      
      // Multiple statutory deductions
      {
        id: 'deduct-003',
        description: 'All statutory deductions',
        employee: {
          name: 'Comprehensive Employee',
          basic: 600000,
          housing: 150000,
          transport: 75000,
          medical: 25000,
          entertainment: 20000
        },
        additionalDeductions: {
          nhis: 20000,
          lifeAssurance: 10000,
          gratuities: 15000,
          employeeCount: 1
        },
        expected: {
          employeePension: 66000, // 8% of (600k + 150k + 75k)
          nhf: 15000, // 2.5% of 600k
          totalStatutory: 101000,
          taxableIncomeReduction: 101000
        }
      }
    ],
    
    // Payroll cycle variations
    cycleScenarios: [
      // Weekly cycle
      {
        id: 'cycle-001',
        description: 'Weekly payroll (₦100,000 weekly = ₦400,000 monthly)',
        payrollCycle: 'weekly',
        employee: {
          name: 'Weekly Employee',
          basic: 100000, // Weekly salary
          housing: 25000, // Weekly housing
          transport: 12500, // Weekly transport
          medical: 5000
        },
        expected: {
          monthlyEquivalent: 550000, // (100k + 25k + 12.5k + 5k) * 4.33
          annualTax: 0, // Below threshold
          monthlyTax: 0
        }
      },
      
      // Bi-weekly cycle
      {
        id: 'cycle-002',
        description: 'Bi-weekly payroll (₦200,000 bi-weekly = ₦400,000 monthly)',
        payrollCycle: 'bi-weekly',
        employee: {
          name: 'Bi-weekly Employee',
          basic: 200000, // Bi-weekly salary
          housing: 50000, // Bi-weekly housing
          transport: 25000, // Bi-weekly transport
          medical: 10000
        },
        expected: {
          monthlyEquivalent: 606000, // (200k + 50k + 25k + 10k) * 2.17
          annualTax: 0, // Below threshold
          monthlyTax: 0
        }
      }
    ]
  };

  return testCases;
};

/**
 * Calculate exact expected values for verification
 */
export const calculateExpectedValues = (testCase, calculator) => {
  const { employee, additionalDeductions = {}, adjustments = {}, payrollCycle = 'monthly' } = testCase;
  
  // Extract salary components
  const salaryComponents = {
    basic: employee.basic || 0,
    housing: employee.housing || 0,
    transport: employee.transport || 0,
    entertainment: employee.entertainment || 0,
    mealSubsidy: employee.mealSubsidy || 0,
    medical: employee.medical || 0,
    benefitsInKind: employee.benefitsInKind || 0
  };

  // Run calculator
  const result = calculator.computePAYE({
    salaryComponents,
    monthsWorked: 12,
    annualRentPaid: employee.annualRentPaid || 0,
    additionalDeductions,
    payrollCycle
  });

  // Apply adjustments if any
  let finalResult = result;
  if (Object.keys(adjustments).length > 0) {
    finalResult = calculator.processAdjustments(result, adjustments);
  }

  return finalResult;
};

/**
 * Verify test case results
 */
export const verifyTestCase = (testCase, calculatedResult) => {
  const { expected } = testCase;
  const verification = {
    passed: true,
    discrepancies: [],
    details: {}
  };

  // Check annual tax
  if (expected.annualTax !== undefined) {
    const calculatedAnnualTax = calculatedResult.taxCalculation.annualTax;
    const tolerance = 100; // Allow ₦100 tolerance
    const diff = Math.abs(calculatedAnnualTax - expected.annualTax);
    
    if (diff > tolerance) {
      verification.passed = false;
      verification.discrepancies.push({
        field: 'annualTax',
        expected: expected.annualTax,
        actual: calculatedAnnualTax,
        difference: diff
      });
    }
    
    verification.details.annualTax = {
      expected: expected.annualTax,
      actual: calculatedAnnualTax,
      difference: diff,
      withinTolerance: diff <= tolerance
    };
  }

  // Check monthly tax
  if (expected.monthlyTax !== undefined) {
    const calculatedMonthlyTax = calculatedResult.deductions.monthlyTax;
    const tolerance = 10; // Allow ₦10 tolerance
    const diff = Math.abs(calculatedMonthlyTax - expected.monthlyTax);
    
    if (diff > tolerance) {
      verification.passed = false;
      verification.discrepancies.push({
        field: 'monthlyTax',
        expected: expected.monthlyTax,
        actual: calculatedMonthlyTax,
        difference: diff
      });
    }
  }

  // Check net pay ratio (if provided)
  if (expected.netPayRatio !== undefined) {
    const gross = calculatedResult.grossEmolument;
    const net = calculatedResult.netPay;
    const actualRatio = gross > 0 ? net / gross : 0;
    const tolerance = 0.02; // 2% tolerance
    
    if (Math.abs(actualRatio - expected.netPayRatio) > tolerance) {
      verification.discrepancies.push({
        field: 'netPayRatio',
        expected: expected.netPayRatio,
        actual: actualRatio,
        difference: Math.abs(actualRatio - expected.netPayRatio)
      });
    }
  }

  // Check rent relief
  if (expected.rentRelief !== undefined) {
    const actualRentRelief = calculatedResult.deductions.rentRelief;
    if (Math.abs(actualRentRelief - expected.rentRelief) > 100) {
      verification.discrepancies.push({
        field: 'rentRelief',
        expected: expected.rentRelief,
        actual: actualRentRelief
      });
    }
  }

  return verification;
};

/**
 * Run comprehensive test suite
 */
export const runTestSuite = (calculator) => {
  const testCases = generateTestCases();
  const results = {
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      successRate: 0
    },
    details: {}
  };

  // Test each category
  Object.entries(testCases).forEach(([category, cases]) => {
    results.details[category] = [];
    results.summary.total += cases.length;
    
    cases.forEach(testCase => {
      try {
        const calculatedResult = calculateExpectedValues(testCase, calculator);
        const verification = verifyTestCase(testCase, calculatedResult);
        
        const testResult = {
          id: testCase.id,
          description: testCase.description,
          passed: verification.passed,
          discrepancies: verification.discrepancies,
          calculated: calculatedResult,
          employee: testCase.employee
        };
        
        results.details[category].push(testResult);
        
        if (verification.passed) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        const testResult = {
          id: testCase.id,
          description: testCase.description,
          passed: false,
          error: error.message,
          stack: error.stack
        };
        
        results.details[category].push(testResult);
        results.summary.failed++;
      }
    });
  });

  // Calculate success rate
  results.summary.successRate = results.summary.total > 0 
    ? (results.summary.passed / results.summary.total) * 100 
    : 0;

  return results;
};

/**
 * Generate CSV report for test results
 */
export const generateTestReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const lines = [
    'PAYE Calculator Test Report',
    `Generated: ${new Date().toLocaleString()}`,
    `Total Tests: ${results.summary.total}`,
    `Passed: ${results.summary.passed}`,
    `Failed: ${results.summary.failed}`,
    `Success Rate: ${results.summary.successRate.toFixed(2)}%`,
    '',
    'Detailed Results:',
    'Category,Test ID,Description,Status,Discrepancies'
  ];

  Object.entries(results.details).forEach(([category, tests]) => {
    tests.forEach(test => {
      const status = test.passed ? 'PASS' : 'FAIL';
      const discrepancies = test.discrepancies 
        ? test.discrepancies.map(d => `${d.field}: expected ${d.expected}, got ${d.actual}`).join('; ')
        : test.error || 'N/A';
      
      lines.push(`${category},${test.id},"${test.description}",${status},"${discrepancies}"`);
    });
  });

  return lines.join('\n');
};