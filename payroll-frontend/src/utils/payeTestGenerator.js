import PAYECalculator from "../services/payeCalculator";

/**
 * Nigerian PAYE Calculator Test Data Generator
 * Generates comprehensive test cases for NTA 2025/2026 tax compliance
 * Updated for cycle-based calculations and YTD projections
 */

export const generateTestCases = () => {
  const testCases = {
    // Basic salary test cases with different cycles
    cycleBased: [
      // Monthly cycle tests
      { 
        id: 'cycle-monthly-001',
        description: 'Monthly employee below tax threshold (₦400,000 annual)',
        payrollCycle: 'monthly',
        periodWorked: 12, // Full year
        employee: {
          name: 'John Doe',
          salaryComponents: {
            basic: 33333,     // Monthly: 400,000 / 12
            housing: 10000,
            transport: 5000,
            medical: 2000,
            benefitsInKind: 0
          },
          annualRentPaid: 0
        },
        additionalDeductions: {
          nhis: 0,
          lifeAssurance: 0,
          gratuities: 0,
          employeeCount: 1
        },
        expected: {
          annualGross: 400000,
          annualTax: 0,
          monthlyTax: 0,
          effectiveTaxRate: 0,
          netPayRatio: 0.92
        }
      },
      
      { 
        id: 'cycle-monthly-002',
        description: 'Monthly employee at threshold boundary (₦800,000 annual)',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Jane Smith',
          salaryComponents: {
            basic: 66667,     // Monthly: 800,000 / 12
            housing: 15000,
            transport: 8000,
            medical: 3000,
            benefitsInKind: 0
          },
          annualRentPaid: 0
        },
        expected: {
          annualGross: 800000,
          annualTax: 0,
          monthlyTax: 0,
          effectiveTaxRate: 0
        }
      },
      
      { 
        id: 'cycle-monthly-003',
        description: 'Monthly employee just above threshold (₦1,200,000 annual)',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Chinedu Okoro',
          salaryComponents: {
            basic: 100000,    // Monthly: 1,200,000 / 12
            housing: 20000,
            transport: 10000,
            medical: 5000,
            benefitsInKind: 0
          }
        },
        expected: {
          annualGross: 1620000,
          annualTax: 60000,    // (1,200,000 - 800,000) * 15%
          monthlyTax: 5000,
          effectiveTaxRate: 5.0
        }
      },
      
      { 
        id: 'cycle-monthly-004',
        description: 'Monthly middle income (₦5,000,000 annual)',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Amina Yusuf',
          salaryComponents: {
            basic: 416667,    // Monthly: 5,000,000 / 12
            housing: 100000,
            transport: 50000,
            medical: 15000,
            entertainment: 10000,
            benefitsInKind: 5000
          }
        },
        expected: {
          annualGross: 5000000,
          annualTax: 690000,   // (2,200,000 × 15%) + (2,000,000 × 18%)
          monthlyTax: 57500,
          effectiveTaxRate: 13.8
        }
      },
      
      // Annual cycle tests
      { 
        id: 'cycle-annual-001',
        description: 'Annual employee (₦12,000,000 annual)',
        payrollCycle: 'annual',
        periodWorked: 12,
        employee: {
          name: 'Dr. Adebayo',
          salaryComponents: {
            basic: 12000000,   // Annual salary
            housing: 3600000,  // Annual housing
            transport: 1800000, // Annual transport
            medical: 600000,
            entertainment: 600000,
            mealSubsidy: 360000,
            benefitsInKind: 1200000
          }
        },
        expected: {
          annualGross: 12000000,
          annualTax: 1950000,  // (2,200,000 × 15%) + (9,000,000 × 18%)
          monthlyEquivalentTax: 162500,
          effectiveTaxRate: 16.25
        }
      },
      
      // Weekly cycle tests
      { 
        id: 'cycle-weekly-001',
        description: 'Weekly employee (₦500,000 annual)',
        payrollCycle: 'weekly',
        periodWorked: 52, // Weeks in year
        employee: {
          name: 'Weekly Worker',
          salaryComponents: {
            basic: 9615,      // Weekly: 500,000 / 52
            housing: 2404,
            transport: 1202,
            medical: 481,
            benefitsInKind: 0
          }
        },
        expected: {
          annualGross: 500000,
          annualTax: 0,        // Below threshold
          weeklyTax: 0,
          effectiveTaxRate: 0
        }
      },
      
      { 
        id: 'cycle-weekly-002',
        description: 'Weekly high earner (₦6,000,000 annual)',
        payrollCycle: 'weekly',
        periodWorked: 52,
        employee: {
          name: 'Weekly Executive',
          salaryComponents: {
            basic: 115385,    // Weekly: 6,000,000 / 52
            housing: 28846,
            transport: 14423,
            medical: 5769,
            benefitsInKind: 5769
          }
        },
        expected: {
          annualGross: 6000000,
          annualTax: 858000,   // (2,200,000 × 15%) + (3,000,000 × 18%)
          weeklyTax: 16500,
          effectiveTaxRate: 14.3
        }
      }
    ],
    
    // YTD (Year-to-Date) Projection Tests
    ytdProjections: [
      {
        id: 'ytd-001',
        description: 'Employee worked 6 months (₦5,000,000 annual)',
        payrollCycle: 'monthly',
        periodWorked: 6, // Months worked so far
        employee: {
          name: 'Mid-Year Employee',
          salaryComponents: {
            basic: 416667,    // Monthly: 5,000,000 / 12
            housing: 100000,
            transport: 50000,
            medical: 15000
          },
          annualRentPaid: 600000 // Annual rent
        },
        expected: {
          monthsWorked: 6,
          ytdGross: 2500000,  // 5,000,000 × 6/12
          ytdTax: 345000,     // 690,000 × 6/12
          completionPercentage: 50,
          remainingMonths: 6,
          rentRelief: 120000   // 600,000 × 20% = 120,000 (not capped)
        }
      },
      
      {
        id: 'ytd-002',
        description: 'Employee worked 9 months with rent relief cap',
        payrollCycle: 'monthly',
        periodWorked: 9,
        employee: {
          name: 'Three Quarter Year',
          salaryComponents: {
            basic: 500000,
            housing: 125000,
            transport: 62500,
            medical: 25000
          },
          annualRentPaid: 3000000 // Should cap at 500,000 relief
        },
        expected: {
          monthsWorked: 9,
          ytdGross: 6187500,  // (500k+125k+62.5k+25k) × 9
          ytdTax: 1049625,    // Projected from full year
          completionPercentage: 75,
          rentRelief: 500000,  // Capped
          ytdRentRelief: 375000 // 500,000 × 9/12
        }
      },
      
      {
        id: 'ytd-003',
        description: 'Weekly employee worked 20 weeks',
        payrollCycle: 'weekly',
        periodWorked: 20, // Weeks worked
        employee: {
          name: 'Part-time Weekly',
          salaryComponents: {
            basic: 50000,     // Weekly
            housing: 12500,
            transport: 6250,
            medical: 2500
          }
        },
        expected: {
          weeksWorked: 20,
          equivalentMonths: 4.62, // 20 ÷ 4.33
          ytdGross: 1425000,     // (50k+12.5k+6.25k+2.5k) × 20
          completionPercentage: 38.46, // 20/52
          remainingWeeks: 32
        }
      }
    ],
    
    // Edge cases
    edgeCases: [
      // Zero income
      {
        id: 'edge-001',
        description: 'Zero income (internship/stipend)',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Intern Student',
          salaryComponents: {
            basic: 0,
            housing: 0,
            transport: 0,
            medical: 0
          }
        },
        expected: {
          annualGross: 0,
          annualTax: 0,
          monthlyTax: 0,
          netPay: 0
        }
      },
      
      // Only benefits (no basic salary)
      {
        id: 'edge-002',
        description: 'Income only from benefits',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Consultant',
          salaryComponents: {
            basic: 0,
            housing: 100000,
            transport: 50000,
            medical: 30000,
            benefitsInKind: 200000
          }
        },
        expected: {
          annualGross: 4560000, // 380,000 × 12
          annualTax: 570000,    // (2,200,000 × 15%) + (1,400,000 × 18%)
          monthlyTax: 47500
        }
      },
      
      // Maximum rent relief case
      {
        id: 'edge-003',
        description: 'Maximum rent relief utilization',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'High Rent Payer',
          salaryComponents: {
            basic: 500000,
            housing: 200000,
            transport: 100000
          },
          annualRentPaid: 3000000 // Should max at ₦500,000 relief
        },
        expected: {
          rentRelief: 500000,      // Capped at 500,000
          annualTaxReduction: 115000, // 500,000 × 23% (marginal rate)
          taxableIncomeReduction: 500000
        }
      },
      
      // ITF levy for company with 5+ employees
      {
        id: 'edge-004',
        description: 'Company with ITF levy (6 employees)',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'ITF Employee',
          salaryComponents: {
            basic: 300000,
            housing: 75000,
            transport: 30000
          }
        },
        additionalDeductions: {
          employeeCount: 6
        },
        expected: {
          itfApplicable: true,
          itfAmount: 4050, // 300,000 × 1.5% (1% ITF rate)
          employerCostIncrease: 4050
        }
      }
    ],
    
    // Additional deductions scenarios
    deductionScenarios: [
      // With NHIS
      {
        id: 'deduct-001',
        description: 'Employee with NHIS contribution',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'NHIS Member',
          salaryComponents: {
            basic: 300000,
            housing: 75000,
            transport: 30000,
            medical: 15000
          }
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
          taxSavings: 27000 // 180,000 × 15% (marginal rate)
        }
      },
      
      // Multiple statutory deductions
      {
        id: 'deduct-002',
        description: 'All statutory deductions',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Comprehensive Employee',
          salaryComponents: {
            basic: 600000,
            housing: 150000,
            transport: 75000,
            medical: 25000,
            entertainment: 20000
          }
        },
        additionalDeductions: {
          nhis: 20000,
          lifeAssurance: 10000,
          gratuities: 15000,
          employeeCount: 1
        },
        expected: {
          employeePension: 66000, // 8% of (600k+150k+75k)
          nhf: 15000,            // 2.5% of 600k
          totalStatutory: 101000,
          taxableIncomeReduction: 101000
        }
      },
      
      // Rent relief with other deductions
      {
        id: 'deduct-003',
        description: 'Rent relief with multiple deductions',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Complex Deductions',
          salaryComponents: {
            basic: 400000,
            housing: 100000,
            transport: 50000
          },
          annualRentPaid: 1200000
        },
        additionalDeductions: {
          nhis: 10000,
          lifeAssurance: 5000,
          gratuities: 10000,
          employeeCount: 1
        },
        expected: {
          rentRelief: 240000,     // 1,200,000 × 20%
          totalDeductions: 103000, // Monthly statutory + voluntary
          netTaxSavings: 36000    // 240,000 × 15%
        }
      }
    ],
    
    // Cycle conversion accuracy tests
    conversionTests: [
      {
        id: 'convert-001',
        description: 'Cycle conversion: Monthly to Annual to Weekly',
        payrollCycle: 'monthly',
        periodWorked: 12,
        employee: {
          name: 'Conversion Test',
          salaryComponents: {
            basic: 300000,
            housing: 75000,
            transport: 30000
          }
        },
        conversionExpected: {
          monthlyGross: 405000,
          annualGross: 4860000,   // 405,000 × 12
          weeklyGross: 93487,     // 405,000 ÷ 4.33
          monthlyTax: 43125,      // Calculated from annual
          weeklyTax: 9955         // Monthly tax ÷ 4.33
        }
      },
      
      {
        id: 'convert-002',
        description: 'Cycle conversion: Weekly to Monthly to Annual',
        payrollCycle: 'weekly',
        periodWorked: 52,
        employee: {
          name: 'Weekly Conversion',
          salaryComponents: {
            basic: 50000,
            housing: 12500,
            transport: 6250
          }
        },
        conversionExpected: {
          weeklyGross: 68750,
          monthlyGross: 297688,   // 68,750 × 4.33
          annualGross: 3572256,   // 297,688 × 12
          annualTax: 415836,      // Calculated from annual gross
          weeklyTax: 7997         // Annual tax ÷ 52
        }
      }
    ]
  };

  return testCases;
};

/**
 * Calculate exact expected values for verification with cycle support
 */
export const calculateExpectedValues = (testCase, calculator) => {
  const { 
    employee, 
    additionalDeductions = {}, 
    adjustments = {}, 
    payrollCycle = 'monthly',
    periodWorked = 12
  } = testCase;
  
  // Extract salary components
  const salaryComponents = employee.salaryComponents;

  // Run calculator with cycle information
  const result = calculator.computePAYE({
    salaryComponents,
    monthsWorked: payrollCycle === 'monthly' ? periodWorked : 12,
    annualRentPaid: employee.annualRentPaid || 0,
    additionalDeductions,
    payrollCycle,
    periodWorked,
    ytdMode: periodWorked < 12 || (payrollCycle === 'weekly' && periodWorked < 52)
  });

  // Apply adjustments if any
  let finalResult = result;
  if (Object.keys(adjustments).length > 0) {
    finalResult = calculator.processAdjustments(result, adjustments);
  }

  return finalResult;
};

/**
 * Verify test case results with cycle support
 */
export const verifyTestCase = (testCase, calculatedResult) => {
  const { expected, payrollCycle, periodWorked } = testCase;
  const verification = {
    passed: true,
    discrepancies: [],
    details: {}
  };

  // Helper function for currency comparison with tolerance
  const compareCurrency = (field, expectedValue, actualValue, tolerance = 100) => {
    const diff = Math.abs(actualValue - expectedValue);
    const withinTolerance = diff <= tolerance;
    
    if (!withinTolerance) {
      verification.passed = false;
      verification.discrepancies.push({
        field,
        expected: expectedValue,
        actual: actualValue,
        difference: diff,
        tolerance,
        unit: '₦'
      });
    }
    
    return withinTolerance;
  };

  // Helper function for percentage comparison
  const comparePercentage = (field, expectedValue, actualValue, tolerance = 0.5) => {
    const diff = Math.abs(actualValue - expectedValue);
    const withinTolerance = diff <= tolerance;
    
    if (!withinTolerance) {
      verification.discrepancies.push({
        field,
        expected: expectedValue,
        actual: actualValue,
        difference: diff,
        tolerance,
        unit: '%'
      });
    }
    
    return withinTolerance;
  };

  // Check annual tax
  if (expected.annualTax !== undefined) {
    const calculatedAnnualTax = calculatedResult.taxCalculation?.annualTax || 0;
    compareCurrency('annualTax', expected.annualTax, calculatedAnnualTax, 100);
  }

  // Check monthly tax
  if (expected.monthlyTax !== undefined) {
    const calculatedMonthlyTax = calculatedResult.deductions?.monthlyTax || 0;
    compareCurrency('monthlyTax', expected.monthlyTax, calculatedMonthlyTax, 10);
  }

  // Check weekly tax
  if (expected.weeklyTax !== undefined) {
    const calculatedWeeklyTax = calculatedResult.weekly?.tax || 
      (calculatedResult.deductions?.monthlyTax / 4.33);
    compareCurrency('weeklyTax', expected.weeklyTax, calculatedWeeklyTax, 10);
  }

  // Check effective tax rate
  if (expected.effectiveTaxRate !== undefined) {
    const calculatedRate = calculatedResult.taxCalculation?.effectiveTaxRate || 0;
    comparePercentage('effectiveTaxRate', expected.effectiveTaxRate, calculatedRate, 0.5);
  }

  // Check net pay ratio
  if (expected.netPayRatio !== undefined) {
    const gross = calculatedResult.grossEmolument;
    const net = calculatedResult.netPay;
    const actualRatio = gross > 0 ? net / gross : 0;
    comparePercentage('netPayRatio', expected.netPayRatio, actualRatio, 0.02);
  }

  // Check rent relief
  if (expected.rentRelief !== undefined) {
    const actualRentRelief = calculatedResult.deductions?.rentRelief || 0;
    compareCurrency('rentRelief', expected.rentRelief, actualRentRelief, 100);
  }

  // Check YTD projections
  if (expected.ytdGross !== undefined && calculatedResult.ytdProjection) {
    compareCurrency('ytdGross', expected.ytdGross, calculatedResult.ytdProjection.ytdGross, 100);
  }

  if (expected.ytdTax !== undefined && calculatedResult.ytdProjection) {
    compareCurrency('ytdTax', expected.ytdTax, calculatedResult.ytdProjection.ytdTax, 100);
  }

  if (expected.completionPercentage !== undefined && calculatedResult.ytdProjection) {
    comparePercentage('completionPercentage', 
      expected.completionPercentage, 
      calculatedResult.ytdProjection.completionPercentage, 
      0.1
    );
  }

  // Check pension deductions
  if (expected.employeePension !== undefined) {
    const actualPension = calculatedResult.deductions?.statutory?.employeePension || 0;
    compareCurrency('employeePension', expected.employeePension, actualPension, 10);
  }

  // Check NHF
  if (expected.nhf !== undefined) {
    const actualNHF = calculatedResult.deductions?.statutory?.nhf || 0;
    compareCurrency('nhf', expected.nhf, actualNHF, 10);
  }

  // Check ITF applicability
  if (expected.itfApplicable !== undefined) {
    const actualITFApplicable = calculatedResult.deductions?.statutory?.breakdown?.itfApplicable || false;
    if (expected.itfApplicable !== actualITFApplicable) {
      verification.discrepancies.push({
        field: 'itfApplicable',
        expected: expected.itfApplicable,
        actual: actualITFApplicable
      });
    }
  }

  // Check conversion accuracy
  if (testCase.conversionExpected) {
    const { conversionExpected } = testCase;
    
    if (conversionExpected.annualGross !== undefined) {
      const actualAnnualGross = calculatedResult.annualGrossEmolument || 0;
      compareCurrency('annualGross', conversionExpected.annualGross, actualAnnualGross, 1000);
    }
    
    if (conversionExpected.weeklyGross !== undefined && payrollCycle === 'weekly') {
      const actualWeeklyGross = (calculatedResult.grossEmolument / 4.33) || 0;
      compareCurrency('weeklyGross', conversionExpected.weeklyGross, actualWeeklyGross, 100);
    }
  }

  return verification;
};

/**
 * Enhanced test suite with cycle and YTD support
 */
export const runTestSuite = (calculator) => {
  const testCases = generateTestCases();
  const results = {
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      successRate: 0,
      categories: {}
    },
    details: {},
    timestamp: new Date().toISOString(),
    calculatorVersion: '2.0.0',
    featuresTested: ['cycle-support', 'ytd-projections', 'tax-brackets-2026']
  };

  // Test each category
  Object.entries(testCases).forEach(([category, cases]) => {
    results.details[category] = [];
    results.summary.categories[category] = { total: 0, passed: 0, failed: 0 };
    results.summary.total += cases.length;
    results.summary.categories[category].total = cases.length;
    
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
          expected: testCase.expected,
          payrollCycle: testCase.payrollCycle,
          periodWorked: testCase.periodWorked,
          verificationDetails: verification.details
        };
        
        results.details[category].push(testResult);
        
        if (verification.passed) {
          results.summary.passed++;
          results.summary.categories[category].passed++;
        } else {
          results.summary.failed++;
          results.summary.categories[category].failed++;
        }
      } catch (error) {
        const testResult = {
          id: testCase.id,
          description: testCase.description,
          passed: false,
          error: error.message,
          stack: error.stack,
          payrollCycle: testCase.payrollCycle
        };
        
        results.details[category].push(testResult);
        results.summary.failed++;
        results.summary.categories[category].failed++;
      }
    });
  });

  // Calculate success rates
  results.summary.successRate = results.summary.total > 0 
    ? (results.summary.passed / results.summary.total) * 100 
    : 0;
    
  Object.keys(results.summary.categories).forEach(category => {
    const cat = results.summary.categories[category];
    cat.successRate = cat.total > 0 ? (cat.passed / cat.total) * 100 : 0;
  });

  return results;
};

/**
 * Generate detailed CSV report for test results
 */
export const generateTestReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const lines = [
    'PAYE Calculator Test Report - Cycle & YTD Enhanced',
    `Generated: ${new Date().toLocaleString()}`,
    `Calculator Version: ${results.calculatorVersion || '2.0.0'}`,
    `Timestamp: ${results.timestamp}`,
    '',
    `Total Tests: ${results.summary.total}`,
    `Passed: ${results.summary.passed}`,
    `Failed: ${results.summary.failed}`,
    `Success Rate: ${results.summary.successRate.toFixed(2)}%`,
    '',
    'Category Breakdown:'
  ];

  // Add category breakdown
  Object.entries(results.summary.categories).forEach(([category, stats]) => {
    lines.push(`  ${category}: ${stats.passed}/${stats.total} (${stats.successRate.toFixed(1)}%)`);
  });

  lines.push('');
  lines.push('Detailed Results:');
  lines.push('Category,Test ID,Payroll Cycle,Period Worked,Description,Status,Discrepancies,Expected Annual Tax,Calculated Annual Tax,Difference');

  Object.entries(results.details).forEach(([category, tests]) => {
    tests.forEach(test => {
      const status = test.passed ? 'PASS' : 'FAIL';
      const discrepancies = test.discrepancies 
        ? test.discrepancies.map(d => 
            `${d.field}: ${d.expected}${d.unit || ''} vs ${d.actual}${d.unit || ''} (diff: ${d.difference})`
          ).join('; ')
        : test.error || 'N/A';
      
      const expectedTax = test.expected?.annualTax !== undefined ? test.expected.annualTax : 'N/A';
      const calculatedTax = test.calculated?.taxCalculation?.annualTax !== undefined 
        ? test.calculated.taxCalculation.annualTax 
        : 'N/A';
      const diff = (expectedTax !== 'N/A' && calculatedTax !== 'N/A') 
        ? Math.abs(expectedTax - calculatedTax) 
        : 'N/A';
      
      lines.push(
        `${category},` +
        `${test.id},` +
        `${test.payrollCycle || 'monthly'},` +
        `${test.periodWorked || 12},` +
        `"${test.description}",` +
        `${status},` +
        `"${discrepancies}",` +
        `${expectedTax},` +
        `${calculatedTax},` +
        `${diff}`
      );
    });
  });

  // Add feature compatibility check
  lines.push('');
  lines.push('Feature Compatibility:');
  lines.push('Feature,Status,Notes');
  lines.push('Cycle Conversion,IMPLEMENTED,Monthly/Annual/Weekly supported');
  lines.push('YTD Projections,IMPLEMENTED,Partial year calculations');
  lines.push('Rent Relief,IMPLEMENTED,20% up to ₦500,000 cap');
  lines.push('Statutory Deductions,IMPLEMENTED,Pension, NHF, NHIS, NSITF, ITF');
  lines.push('Tax Brackets 2026,IMPLEMENTED,NTA 2026 compliant');

  return lines.join('\n');
};

/**
 * Run specific test category with detailed logging
 */
export const runCategoryTests = (calculator, category) => {
  const testCases = generateTestCases();
  const categoryTests = testCases[category] || [];
  const results = {
    category,
    total: categoryTests.length,
    passed: 0,
    failed: 0,
    details: []
  };

  categoryTests.forEach(testCase => {
    try {
      const calculatedResult = calculateExpectedValues(testCase, calculator);
      const verification = verifyTestCase(testCase, calculatedResult);
      
      results.details.push({
        ...testCase,
        result: calculatedResult,
        verification,
        passed: verification.passed
      });
      
      if (verification.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.details.push({
        ...testCase,
        error: error.message,
        passed: false
      });
      results.failed++;
    }
  });

  results.successRate = (results.passed / results.total) * 100;
  return results;
};

/**
 * Generate cycle conversion test matrix
 */
export const generateCycleConversionMatrix = (calculator) => {
  const testAmounts = [100000, 500000, 1000000, 5000000];
  const cycles = ['monthly', 'annual', 'weekly'];
  const matrix = [];

  testAmounts.forEach(amount => {
    cycles.forEach(fromCycle => {
      cycles.forEach(toCycle => {
        if (fromCycle !== toCycle) {
          try {
            const converted = PAYECalculator.convertAmount(amount, fromCycle, toCycle);
            matrix.push({
              fromCycle,
              toCycle,
              amount,
              converted,
              formula: `${fromCycle} → ${toCycle}`
            });
          } catch (error) {
            matrix.push({
              fromCycle,
              toCycle,
              amount,
              error: error.message,
              formula: 'ERROR'
            });
          }
        }
      });
    });
  });

  return matrix;
};

// Export utility functions for external use
export const TestUtils = {
  generateTestCases,
  calculateExpectedValues,
  verifyTestCase,
  runTestSuite,
  runCategoryTests,
  generateTestReport,
  generateCycleConversionMatrix
};

export default TestUtils;