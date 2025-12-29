// src/utils/payeCalculatorEnhanced.js

/**
 * Enhanced PAYE (Pay As You Earn) Calculator for Nigerian Tax System
 * Implements progressive tax calculation, statutory deductions, and payroll processing
 * according to Nigerian Finance Act and tax regulations.
 * 
 * Features:
 * - Progressive tax brackets (₦0 to ∞)
 * - Statutory deductions (Pension, NHF, NHIS, NSITF, ITF)
 * - Rent relief calculations
 * - Multiple pay cycles (monthly, annual, weekly)
 * - Year-to-Date (YTD) projections
 * - Payroll adjustments processing
 * - Detailed calculation logging and debugging
 */
class PAYECalculator {
  /**
   * Initializes the PAYE calculator with tax settings and debugging options
   * 
   * @constructor
   * @param {Object|null} settings - Custom tax settings configuration (optional)
   * @param {boolean} debug - Enable detailed calculation logging for debugging
   * 
   * @example
   * // Using default settings
   * const calculator = new PAYECalculator();
   * 
   * // With custom settings and debugging enabled
   * const calculator = new PAYECalculator(customSettings, true);
   * 
   * @property {Object} settings - Tax configuration object
   * @property {Array} taxBrackets - Progressive tax brackets for PAYE calculation
   * @property {Object} rates - Statutory deduction rates as percentages
   * @property {Object} reliefs - Tax relief configurations
   * @property {boolean} debug - Debug mode flag
   * @property {Array} calculationLog - Storage for calculation logs when debug is true
   */
  constructor(settings = null, debug = false) {
    if (settings) {
      this.settings = settings;
    } else {
      this.settings = this.getDefaultSettings();
    }
    this.taxBrackets = this.settings.taxBrackets;
    this.rates = this.settings.statutoryRates;
    this.reliefs = this.settings.reliefs;
    this.debug = debug;
    this.calculationLog = [];
  }

  /**
   * Logs calculation steps for debugging and audit purposes
   * 
   * @private
   * @param {string} step - Name/identifier of the calculation step
   * @param {Object} data - Data to log for this step
   * 
   * @example
   * this.log('gross_calculation', {
   *   basic: 500000,
   *   housing: 200000,
   *   gross: 700000
   * });
   */
  log(step, data) {
    if (this.debug) {
      this.calculationLog.push({
        timestamp: new Date().toISOString(),
        step,
        data: JSON.parse(JSON.stringify(data)) // Deep clone
      });
    }
  }

  
  /**
   * Returns default Nigerian tax settings based on current Finance Act
   * 
   * Tax Brackets (2024 Nigerian Tax Act):
   * 1. First ₦800,000: 0% (Tax Free Threshold)
   * 2. Next ₦2,200,000 (₦800,001 - ₦3,000,000): 15%
   * 3. Next ₦9,000,000 (₦3,000,001 - ₦12,000,000): 18%
   * 4. Next ₦13,000,000 (₦12,000,001 - ₦25,000,000): 21%
   * 5. Next ₦25,000,000 (₦25,000,001 - ₦50,000,000): 23%
   * 6. Above ₦50,000,000: 25%
   * 
   * Statutory Rates:
   * - Employee Pension: 8% of pensionable emoluments
   * - Employer Pension: 10% of pensionable emoluments
   * - NHF (National Housing Fund): 2.5% of basic salary
   * - NHIS (National Health Insurance): User-defined (typically 5%)
   * - NSITF (Social Insurance): 1% of gross emolument
   * - ITF (Industrial Training Fund): 1% of gross (for companies with 5+ employees)
   * 
   * Reliefs:
   * - Rent Relief: 20% of annual rent paid, capped at ₦500,000
   * 
   * @returns {Object} Default tax settings configuration
   */
  getDefaultSettings() {
    return {
      taxBrackets: [
        { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
        { min: 800000, max: 3000000, rate: 0.15, description: 'Next ₦2,200,000 (15%)' },
        { min: 3000000, max: 12000000, rate: 0.18, description: 'Next ₦9,000,000 (18%)' },
        { min: 12000000, max: 25000000, rate: 0.21, description: 'Next ₦13,000,000 (21%)' },
        { min: 25000000, max: 50000000, rate: 0.23, description: 'Next ₦25,000,000 (23%)' },
        { min: 50000000, max: Infinity, rate: 0.25, description: 'Above ₦50,000,000 (25%)' }
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
  }

  
  /**
   * Validates salary components to ensure data integrity
   * 
   * Validation Rules:
   * 1. All values must be numbers
   * 2. All values must be non-negative (≥ 0)
   * 3. Values must be realistic (≤ ₦100,000,000)
   * 
   * @param {Object} components - Salary components object
   * @throws {Error} If validation fails with details of invalid components
   * 
   * @example
   * validateSalaryComponents({
   *   basic: 500000,
   *   housing: 200000,
   *   transport: 50000
   * });
   */
  validateSalaryComponents(components) {
    const errors = [];
    
    Object.entries(components).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`${key} must be a non-negative number`);
      }
      
      // Check for unreasonable values
      if (value > 100000000) { // ₦100 million
        errors.push(`${key} value (${value}) seems unrealistically high`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Invalid salary components: ${errors.join(', ')}`);
    }
  }

  /**
   * Calculates Gross Emolument (total compensation before deductions)
   * 
   * Formula:
   * Gross Emolument = Basic + Housing + Transport + Entertainment + Meal Subsidy + Medical + Benefits in Kind
   * 
   * @param {Object} salaryComponents - Employee salary components
   * @param {number} salaryComponents.basic - Basic salary
   * @param {number} [salaryComponents.housing=0] - Housing allowance
   * @param {number} [salaryComponents.transport=0] - Transport allowance
   * @param {number} [salaryComponents.entertainment=0] - Entertainment allowance
   * @param {number} [salaryComponents.mealSubsidy=0] - Meal subsidy
   * @param {number} [salaryComponents.medical=0] - Medical allowance
   * @param {number} [salaryComponents.benefitsInKind=0] - Non-cash benefits
   * @returns {number} Gross emolument amount
   * 
   * @example
   * const gross = calculateGrossEmolument({
   *   basic: 500000,
   *   housing: 200000,
   *   transport: 50000
   * }); // Returns 750000
   */
  calculateGrossEmolument(salaryComponents) {
    this.validateSalaryComponents(salaryComponents);
    
    const components = {
      basic: salaryComponents.basic || 0,
      housing: salaryComponents.housing || 0,
      transport: salaryComponents.transport || 0,
      entertainment: salaryComponents.entertainment || 0,
      mealSubsidy: salaryComponents.mealSubsidy || 0,
      medical: salaryComponents.medical || 0,
      benefitsInKind: salaryComponents.benefitsInKind || 0
    };

    const gross = Object.values(components).reduce((sum, val) => sum + val, 0);
    
    this.log('calculateGrossEmolument', {
      components,
      gross,
      breakdown: components
    });

    return gross;
  }

  /**
   * Calculates all statutory deductions as per Nigerian regulations
   * 
   * Statutory Deductions Breakdown:
   * 1. Employee Pension: 8% of pensionable emoluments (Basic + Housing + Transport)
   * 2. Employer Pension: 10% of pensionable emoluments (employer contribution)
   * 3. NHF (National Housing Fund): 2.5% of basic salary
   * 4. NHIS (National Health Insurance Scheme): User-specified amount
   * 5. NSITF (Social Insurance): 1% of gross emolument
   * 6. ITF (Industrial Training Fund): 1% of gross (only for companies with 5+ employees)
   * 
   * @param {Object} salaryComponents - Salary components for deduction calculation
   * @param {Object} deductionInputs - Additional deduction parameters
   * @param {number} [deductionInputs.nhis=0] - NHIS contribution amount
   * @param {number} [deductionInputs.lifeAssurance=0] - Life assurance premium
   * @param {number} [deductionInputs.gratuities=0] - Gratuity contributions
   * @param {number} [deductionInputs.employeeCount=0] - Total employees (determines ITF applicability)
   * @returns {Object} Complete deductions breakdown
   */
  calculateStatutoryDeductions(salaryComponents, deductionInputs = {}) {
    const grossEmolument = this.calculateGrossEmolument(salaryComponents);
    const pensionableEmoluments = this.calculatePensionableEmoluments(salaryComponents);
    const basic = salaryComponents.basic || 0;

    const employeePension = pensionableEmoluments * this.rates.employeePension;
    const employerPension = pensionableEmoluments * this.rates.employerPension;
    const nhf = basic * this.rates.nhf;
    const nsitf = grossEmolument * this.rates.nsitf;
    
    // ITF only applies if company has 5+ employees
    const itf = (deductionInputs.employeeCount >= 5) 
      ? grossEmolument * this.rates.itf 
      : 0;

    const deductions = {
      // Employee deductions
      employeePension,
      nhf,
      nhis: deductionInputs.nhis || 0,
      lifeAssurance: deductionInputs.lifeAssurance || 0,
      gratuities: deductionInputs.gratuities || 0,

      // Employer contributions
      employerPension,
      nsitf,
      itf,
      
      // Calculation breakdown
      breakdown: {
        pensionableEmoluments,
        employeePensionRate: this.rates.employeePension,
        nhfRate: this.rates.nhf,
        nsitfRate: this.rates.nsitf,
        itfRate: this.rates.itf,
        itfApplicable: deductionInputs.employeeCount >= 5
      }
    };

    // Calculate totals
    deductions.totalEmployeeDeductions = 
      deductions.employeePension + 
      deductions.nhf + 
      deductions.nhis + 
      deductions.lifeAssurance + 
      deductions.gratuities;

    deductions.totalEmployerContributions = 
      deductions.employerPension + 
      deductions.nsitf + 
      deductions.itf;

    this.log('calculateStatutoryDeductions', {
      grossEmolument,
      pensionableEmoluments,
      basic,
      deductions,
      totalEmployeeDeductions: deductions.totalEmployeeDeductions,
      totalEmployerContributions: deductions.totalEmployerContributions
    });

    return deductions;
  }

  /**
   * Calculates pensionable emoluments (basis for pension calculations)
   * 
   * Formula:
   * Pensionable Emoluments = Basic Salary + Housing Allowance + Transport Allowance
   * 
   * Note: According to Nigerian Pension Reform Act, only these three components
   * are considered for pension calculation.
   * 
   * @param {Object} salaryComponents - Salary components
   * @returns {number} Total pensionable emoluments
   */
  calculatePensionableEmoluments(salaryComponents) {
    return (salaryComponents.basic || 0) + 
           (salaryComponents.housing || 0) + 
           (salaryComponents.transport || 0);
  }

  /**
   * Calculates rent relief for tax purposes
   * 
   * Formula:
   * Rent Relief = min(Annual Rent Paid × 20%, ₦500,000)
   * 
   * This relief reduces the taxable income, not the tax liability directly.
   * Maximum relief is capped at ₦500,000 regardless of rent amount.
   * 
   * @param {number} annualRentPaid - Total annual rent paid by employee
   * @returns {number} Rent relief amount (capped)
   * 
   * @example
   * calculateRentRelief(3000000); // Returns 500000 (capped)
   * calculateRentRelief(1000000); // Returns 200000 (20% of 1M)
   */
  calculateRentRelief(annualRentPaid = 0) {
    const rawRelief = annualRentPaid * this.reliefs.rentRelief;
    const cappedRelief = Math.min(rawRelief, this.reliefs.rentReliefCap);
    
    this.log('calculateRentRelief', {
      annualRentPaid,
      rentReliefRate: this.reliefs.rentRelief,
      rawRelief,
      rentReliefCap: this.reliefs.rentReliefCap,
      finalRelief: cappedRelief,
      isCapped: rawRelief > this.reliefs.rentReliefCap
    });

    return cappedRelief;
  }

  // Enhanced tax calculation with detailed breakdown
  // calculateAnnualTax(taxableIncome) {
  //   console.log(taxableIncome)

  //   let remainingIncome = taxableIncome;
  //   let totalTax = 0;
  //   const taxBreakdown = [];
  //   const bracketCalculations = [];

  //   // Sort brackets by min to ensure proper order
  //   const sortedBrackets = [...this.taxBrackets].sort((a, b) => a.min - b.min);
 
  //   // Track how much income has been taxed so far
  //   let incomeTaxedSoFar = 0;
    
  //   for (let i = 0; i < sortedBrackets.length; i++) {
  //     const bracket = sortedBrackets[i];
      
  //     // If we've already taxed all income, stop
  //     if (incomeTaxedSoFar >= taxableIncome) break;
      
  //     // Calculate the amount of income in this bracket
  //     let amountInBracket;
      
  //     if (bracket.max === Infinity) {
  //       // Last bracket - all remaining income
  //       amountInBracket = taxableIncome - incomeTaxedSoFar;
  //     } else {
  //       // Regular bracket
  //       const bracketWidth = bracket.max - bracket.min;
  //       const incomeRemaining = taxableIncome - incomeTaxedSoFar;
        
  //       amountInBracket = Math.min(bracketWidth, incomeRemaining);
  //     }
      
  //     // Ensure amount is non-negative
  //     amountInBracket = Math.max(0, amountInBracket);
      
  //     const taxForThisBracket = amountInBracket * bracket.rate;
  //     totalTax += taxForThisBracket;

  //     bracketCalculations.push({
  //       bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
  //       rate: bracket.rate,
  //       taxableAmount: amountInBracket,
  //       tax: taxForThisBracket,
  //       description: bracket.description,
  //       cumulativeTax: totalTax
  //     });

  //     taxBreakdown.push({
  //       band: `₦${bracket.min.toLocaleString()} - ₦${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
  //       rate: `${(bracket.rate * 100).toFixed(1)}%`,
  //       taxableAmount: amountInBracket,
  //       tax: taxForThisBracket,
  //       cumulativeIncome: bracket.min + amountInBracket,
  //       description: bracket.description || ''
  //     });

  //     // Update income taxed so far
  //     incomeTaxedSoFar += amountInBracket;
  //   }

      
  //   // Round to 2 decimal places (kobo)
  //   totalTax = Math.round(totalTax * 100) / 100;

  //   this.log('calculateAnnualTax', {
  //     taxableIncome,
  //     totalTax,
  //     bracketCalculations,
  //     remainingIncomeAfterTax: taxableIncome - totalTax,
  //     effectiveRate: (totalTax / taxableIncome) * 100
  //   });

  //   return { totalTax, taxBreakdown, bracketCalculations };
  // }


  
  
  /**
   * Calculates annual PAYE tax using progressive tax brackets
   * 
   * Calculation Method:
   * 1. Income is taxed in segments according to each bracket
   * 2. Only the portion of income within each bracket is taxed at that bracket's rate
   * 3. Brackets are applied sequentially from lowest to highest
   * 
   * Example for ₦5,000,000 taxable income:
   * - First ₦800,000: 0% = ₦0
   * - Next ₦2,200,000: 15% = ₦330,000
   * - Remaining ₦2,000,000: 18% = ₦360,000
   * Total Tax = ₦690,000
   * 
   * @param {number} taxableIncome - Annual taxable income after deductions and reliefs
   * @returns {Object} Tax calculation results with detailed breakdown
   * @returns {number} return.totalTax - Total annual tax payable
   * @returns {Array} return.taxBreakdown - Detailed bracket-by-bracket calculation
   * @returns {Array} return.bracketCalculations - Same as taxBreakdown (legacy support)
   */
  calculateAnnualTax(taxableIncome) {
    console.log('Calculating tax for taxable income:', taxableIncome);

    if (taxableIncome <= 0) {
      return {
        totalTax: 0,
        taxBreakdown: [],
        bracketCalculations: []
      };
    }

    const brackets = [
      { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
      { min: 800000, max: 3000000, rate: 0.15, description: 'Next ₦2,200,000 (15%)' },
      { min: 3000000, max: 12000000, rate: 0.18, description: 'Next ₦9,000,000 (18%)' },
      { min: 12000000, max: 25000000, rate: 0.21, description: 'Next ₦13,000,000 (21%)' },
      { min: 25000000, max: 50000000, rate: 0.23, description: 'Next ₦25,000,000 (23%)' },
      { min: 50000000, max: Infinity, rate: 0.25, description: 'Above ₦50,000,000 (25%)' }
    ];

    let totalTax = 0;
    const taxBreakdown = [];
    let incomeRemaining = taxableIncome;

    for (let i = 0; i < brackets.length && incomeRemaining > 0; i++) {
      const bracket = brackets[i];
      
      // Calculate the portion of income in this bracket
      let taxableInBracket;
      
      if (taxableIncome <= bracket.min) {
        // Income is below this bracket's minimum, skip it
        continue;
      } else if (taxableIncome <= bracket.max) {
        // Income falls within this bracket
        taxableInBracket = taxableIncome - bracket.min;
      } else {
        // Income exceeds this bracket's maximum
        taxableInBracket = bracket.max - bracket.min;
      }
      
      // Only tax the portion that's actually in this bracket
      // but limited to remaining income
      taxableInBracket = Math.min(taxableInBracket, incomeRemaining);
      
      if (taxableInBracket <= 0) {
        continue;
      }
      
      const taxForBracket = taxableInBracket * bracket.rate;
      totalTax += taxForBracket;
      incomeRemaining -= taxableInBracket;
      
      taxBreakdown.push({
        band: `₦${bracket.min.toLocaleString()} - ₦${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
        rate: `${(bracket.rate * 100).toFixed(0)}%`,
        taxableAmount: taxableInBracket,
        tax: taxForBracket,
        cumulativeTax: totalTax,
        description: bracket.description
      });

      // If we've taxed all income, break out
      if (incomeRemaining <= 0) {
        break;
      }
    }


    totalTax = Math.round(totalTax * 100) / 100

    this.log('calculateAnnualTax', {
      taxableIncome,
      totalTax,
      taxBreakdown,
      effectiveRate: taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0,
      roundingMethod: 'nearest whole number (Math.round)'
    });

    return {
      totalTax,
      taxBreakdown,
      bracketCalculations: taxBreakdown
    };
  }

  /**
   * Calculates PAYE for different pay cycles (monthly, annual, weekly)
   * 
   * Cycle Conversion Formulas:
   * - Annual to Monthly: ÷ 12
   * - Weekly to Monthly: × 4.33 (average weeks per month)
   * - Monthly to Annual: × 12
   * - Weekly to Annual: × 52 (or × 4.33 × 12)
   * 
   * @param {Object} salaryComponents - Salary components in the specified cycle
   * @param {string} cycle - Pay cycle: 'monthly', 'annual', or 'weekly'
   * @param {number} periodWorked - Number of periods worked in the cycle
   * @returns {Object} PAYE calculation results for the specified cycle
   */
  calculateForCycle(salaryComponents, cycle, periodWorked = 12) {
    // Convert to monthly for standard calculation
    let monthlyComponents = { ...salaryComponents };
    
    if (cycle === 'annual') {
      // Convert annual to monthly
      Object.keys(monthlyComponents).forEach(key => {
        monthlyComponents[key] = monthlyComponents[key] / 12;
      });
    } else if (cycle === 'weekly') {
      // Convert weekly to monthly (approx 4.33 weeks per month)
      Object.keys(monthlyComponents).forEach(key => {
        monthlyComponents[key] = monthlyComponents[key] * 4.33;
      });
    }
    
    // Calculate as usual
    const result = this.computePAYE({
      salaryComponents: monthlyComponents,
      monthsWorked: periodWorked
    });
    
    // Add cycle-specific adjustments
    result.originalCycle = cycle;
    result.periodWorked = periodWorked;
    
    if (cycle === 'weekly') {
      result.weekly = {
        gross: salaryComponents.basic + (salaryComponents.housing || 0) + (salaryComponents.transport || 0),
        tax: result.taxCalculation.monthlyTax / 4.33,
        net: result.netPay / 4.33
      };
    }
    
    return result;
  }

  /**
   * Calculates Year-to-Date (YTD) projections based on months worked
   * 
   * Formulas:
   * - YTD Gross = Annual Gross × (Months Worked ÷ 12)
   * - YTD Tax = Annual Tax × (Months Worked ÷ 12)
   * - YTD Net = Annual Net × (Months Worked ÷ 12)
   * - Completion % = (Months Worked ÷ 12) × 100
   * 
   * @param {Object} fullYearResult - Complete annual PAYE calculation
   * @param {number} monthsWorked - Number of months worked so far in the year
   * @returns {Object} YTD projections and remaining year calculations
   */
  calculateYTDProjection(fullYearResult, monthsWorked) {
    const fraction = monthsWorked / 12;
    
    return {
      monthsWorked,
      fractionOfYear: fraction,
      ytdGross: fullYearResult.annualGrossEmolument * fraction,
      ytdTax: fullYearResult.taxCalculation.annualTax * fraction,
      ytdNet: (fullYearResult.annualGrossEmolument - fullYearResult.taxCalculation.annualTax) * fraction,
      remainingMonths: 12 - monthsWorked,
      projectedRemainingGross: fullYearResult.annualGrossEmolument * (1 - fraction),
      projectedRemainingTax: fullYearResult.taxCalculation.annualTax * (1 - fraction),
      completionPercentage: (monthsWorked / 12) * 100
    };
  }

  /**
   * Validates pay cycle input parameters
   * 
   * Validation Rules:
   * - Cycle must be 'monthly', 'annual', or 'weekly'
   * - Amount must be non-negative number
   * - Months worked: 1-12 for monthly, 1-52 for weekly
   * 
   * @param {string} cycle - Pay cycle to validate
   * @param {number} amount - Salary amount to validate
   * @param {number} periodWorked - Period worked to validate
   * @returns {Array} Array of error messages (empty if valid)
   */
  validateCycleInput(cycle, amount, periodWorked) {
    const errors = [];
    
    if (!['monthly', 'annual', 'weekly'].includes(cycle)) {
      errors.push('Cycle must be monthly, annual, or weekly');
    }
    
    if (typeof amount !== 'number' || amount < 0) {
      errors.push('Amount must be a non-negative number');
    }
    
    if (cycle === 'monthly' && (periodWorked < 1 || periodWorked > 12)) {
      errors.push('Months worked must be between 1 and 12');
    }
    
    if (cycle === 'weekly' && (periodWorked < 1 || periodWorked > 52)) {
      errors.push('Weeks worked must be between 1 and 52');
    }
    
    if (cycle === 'annual' && (periodWorked < 1 || periodWorked > 12)) {
      errors.push('For annual cycle, period worked (months) must be between 1 and 12');
    }
    
    return errors;
  }

  /**
   * Converts amounts between different pay cycles
   * 
   * Conversion Factors:
   * - 1 month = 4.33 weeks (average)
   * - 1 year = 12 months = 52 weeks
   * 
   * @static
   * @param {number} amount - Amount to convert
   * @param {string} fromCycle - Source cycle ('monthly', 'annual', 'weekly')
   * @param {string} toCycle - Target cycle ('monthly', 'annual', 'weekly')
   * @returns {number} Converted amount
   */
  static convertAmount(amount, fromCycle, toCycle) {
    const conversions = {
      monthly: {
        annual: (val) => val * 12,
        weekly: (val) => val / 4.33
      },
      annual: {
        monthly: (val) => val / 12,
        weekly: (val) => (val / 12) / 4.33
      },
      weekly: {
        monthly: (val) => val * 4.33,
        annual: (val) => (val * 4.33) * 12
      }
    };
    
    if (fromCycle === toCycle) return amount;
    if (conversions[fromCycle] && conversions[fromCycle][toCycle]) {
      return conversions[fromCycle][toCycle](amount);
    }
    
    // Default: convert to monthly first
    let monthly;
    switch(fromCycle) {
      case 'annual': monthly = amount / 12; break;
      case 'weekly': monthly = amount * 4.33; break;
      default: monthly = amount;
    }
    
    switch(toCycle) {
      case 'annual': return monthly * 12;
      case 'weekly': return monthly / 4.33;
      default: return monthly;
    }
  }
  
  /**
   * Main PAYE computation function - orchestrates the complete calculation
   * 
   * Calculation Steps:
   * 1. Calculate Gross Emolument (monthly)
   * 2. Calculate Statutory Deductions
   * 3. Apply Rent Relief
   * 4. Calculate Annual Taxable Income:
   *    Annual Taxable Income = Annual Gross - (Rent Relief + Annual Deductions)
   * 5. Calculate Annual Tax (progressive)
   * 6. Calculate Monthly Values:
   *    Monthly Tax = Annual Tax ÷ 12
   *    Net Pay = Monthly Gross - (Monthly Deductions + Monthly Tax)
   * 
   * @param {Object} employee - Employee data object
   * @param {Object} employee.salaryComponents - Salary breakdown
   * @param {number} [employee.monthsWorked=12] - Months worked in the year
   * @param {number} [employee.annualRentPaid=0] - Annual rent paid for relief
   * @param {Object} [employee.additionalDeductions={}] - Additional deduction inputs
   * @param {string} [employee.payrollCycle='monthly'] - Pay cycle type
   * @param {number} [employee.periodWorked] - Period worked (for YTD)
   * @param {boolean} [employee.ytdMode=false] - Enable YTD calculations
   * @param {Object} options - Additional calculation options
   * @returns {Object} Complete PAYE calculation results
   * @throws {Error} If calculation fails due to invalid inputs
   */
  computePAYE(employee, options = {}) {
    this.calculationLog = []; // Reset log
   
    const {
      salaryComponents,
      monthsWorked = 12,
      annualRentPaid = 0,
      additionalDeductions = {},
      payrollCycle = 'monthly',
      periodWorked = monthsWorked,
      ytdMode = false
    } = employee;

    try {
      // Step 1: Calculate Gross Emolument
      const grossEmolument = this.calculateGrossEmolument(salaryComponents);
  
      const annualGrossEmolument = grossEmolument * 12;

      this.log('step1_gross', {
        monthlyGross: grossEmolument,
        annualGross: annualGrossEmolument,
        monthsWorked,
        payrollCycle
      });

      // Step 2: Calculate statutory deductions
      const deductions = this.calculateStatutoryDeductions(salaryComponents, additionalDeductions);

      this.log('step2_deductions', {
        monthlyDeductions: deductions,
        annualDeductions: {
          employeePension: deductions.employeePension * 12,
          nhf: deductions.nhf * 12,
          nhis: (deductions.nhis || 0) * 12,
          lifeAssurance: (deductions.lifeAssurance || 0) * 12,
          gratuities: (deductions.gratuities || 0) * 12
        }
      });

      // Step 3: Calculate Rent Relief
      const rentRelief = this.calculateRentRelief(annualRentPaid);

      // Step 4: Calculate annual deductions
      const annualPension = deductions.employeePension * 12;
      const annualNHF = deductions.nhf * 12;
      const annualNHIS = (deductions.nhis || 0) * 12;
      const annualLifeAssurance = (deductions.lifeAssurance || 0) * 12;
      const annualGratuities = (deductions.gratuities || 0) * 12;

 
      // Step 5: Calculate taxable income
      const totalAnnualDeductions = rentRelief + annualPension + annualNHF + annualNHIS;
      console.log('ag',annualGrossEmolument)
      console.log('ad',totalAnnualDeductions)
      const annualTaxableIncome = Math.max(0, annualGrossEmolument - totalAnnualDeductions);

      this.log('step3_taxableIncome', {
        annualGrossEmolument,
        deductions: {
          rentRelief,
          annualPension,
          annualNHF,
          annualNHIS,
          annualLifeAssurance,
          annualGratuities
        },
        totalAnnualDeductions,
        annualTaxableIncome
      });

      console.log(annualTaxableIncome)
      // Step 6: Calculate annual tax
      const annualTaxCalculation = this.calculateAnnualTax(annualTaxableIncome);
      
      const annualTax = annualTaxCalculation.totalTax;

      // Step 7: Calculate monthly values
      const monthlyTax = annualTax / 12;
      const totalMonthlyDeductions = deductions.totalEmployeeDeductions + monthlyTax;
      const netPay = Math.max(0, grossEmolument - totalMonthlyDeductions);

      // Employer costs
      const employerMonthlyCost = grossEmolument + deductions.totalEmployerContributions;
      const employerAnnualCost = employerMonthlyCost * 12;

      const result = {
        employee,
        grossEmolument,
        annualGrossEmolument,
        deductions: {
          statutory: deductions,
          rentRelief,
          monthlyTax,
          totalMonthlyDeductions,
          annual: {
            pension: annualPension,
            nhf: annualNHF,
            nhis: annualNHIS,
            lifeAssurance: annualLifeAssurance,
            gratuities: annualGratuities,
            total: totalAnnualDeductions
          }
        },
        taxCalculation: {
          annualTaxableIncome,
          annualTax,
          monthlyTax,
          taxBreakdown: annualTaxCalculation.taxBreakdown,
          bracketCalculations: annualTaxCalculation.bracketCalculations,
          effectiveTaxRate: annualGrossEmolument > 0 ? (annualTax / annualGrossEmolument) * 100 : 0
        },
        netPay,
        employerCosts: {
          monthly: employerMonthlyCost,
          annual: employerAnnualCost,
          contributions: deductions.totalEmployerContributions
        },
        payrollCycle,
        monthsWorked,
        calculationDate: new Date().toISOString(),
        calculationLog: this.debug ? this.calculationLog : undefined
      };

      this.log('final_result', result);

      if (ytdMode && periodWorked < 12) {
        result.ytdProjection = this.calculateYTDProjection(result, periodWorked);
        result.isYTDCalculation = true;
        result.periodWorked = periodWorked;
      }

      return result;


    } catch (error) {
      console.error('Error in computePAYE:', error);
      this.log('error', {
        message: error.message,
        stack: error.stack,
        employee,
        options
      });
      throw error;
    }
  }

  
  /**
   * Processes payroll adjustments (bonuses, overtime, loans, etc.)
   * 
   * Adjustment Types:
   * - Additions: Bonus, Overtime, Commission (increase gross)
   * - Deductions: Loans, Other Deductions (reduce net pay)
   * 
   * Formula:
   * Adjusted Gross = Base Gross + Bonus + Overtime + Commission
   * Adjusted Net Pay = Adjusted Gross - (Adjusted Deductions + Loans + Other Deductions)
   * 
   * @param {Object} baseCalculation - Original PAYE calculation
   * @param {Object} adjustments - Adjustment values
   * @param {number} [adjustments.bonus=0] - Bonus amount
   * @param {number} [adjustments.overtime=0] - Overtime pay
   * @param {number} [adjustments.loans=0] - Loan repayments
   * @param {number} [adjustments.otherDeductions=0] - Other deductions
   * @param {number} [adjustments.commission=0] - Commission earnings
   * @returns {Object} Adjusted PAYE calculation
   */
  processAdjustments(baseCalculation, adjustments = {}) {
    const {
      bonus = 0,
      overtime = 0,
      loans = 0,
      otherDeductions = 0,
      commission = 0
    } = adjustments;

    // Calculate new gross
    const adjustedGross = baseCalculation.grossEmolument + bonus + overtime + commission;
    const adjustedAnnualGross = adjustedGross * 12;

    // Recalculate statutory deductions on adjusted gross if needed
    // For simplicity, we adjust existing deductions proportionally
    const grossAdjustmentFactor = baseCalculation.grossEmolument > 0 
      ? adjustedGross / baseCalculation.grossEmolument 
      : 1;

    const adjustedStatutoryDeductions = {
      ...baseCalculation.deductions.statutory,
      employeePension: baseCalculation.deductions.statutory.employeePension * grossAdjustmentFactor,
      nhf: baseCalculation.deductions.statutory.nhf * grossAdjustmentFactor
    };

    // Recalculate total deductions
    const adjustedTotalMonthlyDeductions = 
      adjustedStatutoryDeductions.totalEmployeeDeductions + 
      baseCalculation.deductions.monthlyTax + 
      loans + 
      otherDeductions;

    // Recalculate net pay
    const adjustedNetPay = Math.max(0, adjustedGross - adjustedTotalMonthlyDeductions);

    return {
      ...baseCalculation,
      adjustments: {
        bonus,
        overtime,
        commission,
        loans,
        otherDeductions,
        totalAdjustments: bonus + overtime + commission - loans - otherDeductions,
        grossAdjustmentFactor
      },
      adjustedGross,
      adjustedAnnualGross,
      adjustedStatutoryDeductions,
      adjustedTotalMonthlyDeductions,
      adjustedNetPay,
      originalNetPay: baseCalculation.netPay,
      netPayChange: adjustedNetPay - baseCalculation.netPay
    };
  }

  // Get calculation log
  getLog() {
    return this.calculationLog;
  }

  // Clear log
  clearLog() {
    this.calculationLog = [];
  }
}

export default PAYECalculator;