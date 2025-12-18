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
  calculateAnnualTax(taxableIncome) {
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const taxBreakdown = [];
    const bracketCalculations = [];

    // Sort brackets by min to ensure proper order
    const sortedBrackets = [...this.taxBrackets].sort((a, b) => a.min - b.min);

    for (const bracket of sortedBrackets) {
      if (remainingIncome <= 0) break;

      const bracketRange = bracket.max === Infinity 
        ? Infinity 
        : bracket.max - bracket.min + 1;
      
      let taxableInBracket = 0;
      
      if (remainingIncome > bracket.max && bracket.max !== Infinity) {
        taxableInBracket = bracketRange;
      } else {
        taxableInBracket = Math.max(0, remainingIncome - bracket.min + 1);
        if (taxableInBracket > bracketRange && bracket.max !== Infinity) {
          taxableInBracket = bracketRange;
        }
      }

      if (taxableInBracket > 0) {
        const taxInBracket = taxableInBracket * bracket.rate;
        totalTax += taxInBracket;

        bracketCalculations.push({
          bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
          rate: bracket.rate,
          taxableAmount: taxableInBracket,
          tax: taxInBracket,
          description: bracket.description
        });

        taxBreakdown.push({
          band: `₦${bracket.min.toLocaleString()} - ₦${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
          rate: `${(bracket.rate * 100).toFixed(1)}%`,
          taxableAmount: taxableInBracket,
          tax: taxInBracket,
          description: bracket.description || ''
        });
      }

      remainingIncome -= taxableInBracket;
      if (remainingIncome <= 0) break;
    }

    this.log('calculateAnnualTax', {
      taxableIncome,
      totalTax,
      bracketCalculations,
      remainingIncomeAfterTax: taxableIncome - totalTax
    });

    return { totalTax, taxBreakdown, bracketCalculations };
  }

  // Complete computation with detailed logging
  computePAYE(employee, options = {}) {
    this.calculationLog = []; // Reset log
    
    const {
      salaryComponents,
      monthsWorked = 12,
      annualRentPaid = 0,
      additionalDeductions = {},
      payrollCycle = 'monthly'
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