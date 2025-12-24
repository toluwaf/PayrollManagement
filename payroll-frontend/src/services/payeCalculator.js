// src/utils/payeCalculatorEnhanced.js
/**
 * Enhanced PAYE Calculator with debugging and validation
 */
class PAYECalculator {
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

  log(step, data) {
    if (this.debug) {
      this.calculationLog.push({
        timestamp: new Date().toISOString(),
        step,
        data: JSON.parse(JSON.stringify(data)) // Deep clone
      });
    }
  }

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

  // Validate inputs
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

  // Enhanced gross emolument calculation
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

  // Enhanced statutory deductions with detailed breakdown
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

  calculatePensionableEmoluments(salaryComponents) {
    return (salaryComponents.basic || 0) + 
           (salaryComponents.housing || 0) + 
           (salaryComponents.transport || 0);
  }

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

    // CORRECTED Progressive Tax Calculation
  calculateAnnualTax(taxableIncome) {
    console.log('Calculating tax for taxable income:', taxableIncome);

    if (taxableIncome <= 0) {
      return {
        totalTax: 0,
        taxBreakdown: [],
        bracketCalculations: []
      };
    }

    // CORRECTED: Proper bracket thresholds based on Nigerian tax act
    // First ₦800,000: 0% tax
    // Next ₦2.2M: 15% (₦800,001 - ₦3,000,000)
    // Next ₦9M: 18% (₦3,000,001 - ₦12,000,000)
    // Next ₦13M: 21% (₦12,000,001 - ₦25,000,000)
    // Next ₦25M: 23% (₦25,000,001 - ₦50,000,000)
    // Above ₦50M: 25% (₦50,000,001 and above)
    
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


  // Add this method to your PAYECalculator class
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

  // Add this method to calculate YTD projections
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

  // Add these validation methods
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
  // Complete computation with detailed logging
  computePAYE(employee, options = {}) {
    this.calculationLog = []; // Reset log
    console.log(employee)
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

  // Enhanced adjustments processing
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