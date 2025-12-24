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
  calculateStatutoryDeductions(salaryComponents, deductionInputs = {}, eligibilityData) {
    const grossEmolument = this.calculateGrossEmolument(salaryComponents);
    const pensionableEmoluments = this.calculatePensionableEmoluments(salaryComponents);
    const basic = salaryComponents.basic || 0;

    const employeePension = pensionableEmoluments * this.rates.employeePension;
    const employerPension = pensionableEmoluments * this.rates.employerPension;
    // console.log(eligibilityData)
    const additionalPension = eligibilityData.additionalPension || 0;
    const totalEmployeePension = employeePension + additionalPension;

    const nhfRate = eligibilityData.exemptFromNHF ? 0 : this.rates.nhf
    const nhf = basic * nhfRate;
    const nsitf = grossEmolument * this.rates.nsitf;
    
    // Apply disability relief (₦20,000 monthly)
    const disabilityRelief = eligibilityData.hasDisability ? 20000 : 0;

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
      additionalPension: additionalPension,
      disabilityRelief: disabilityRelief,
      gratuities: deductionInputs.gratuities || 0,

      // Rent relief (if applicable)
      rentRelief: this.calculateELRentRelief(eligibilityData),

      // Employer contributions
      employerPension,
      nsitf,
      itf,

      // Calculation metadata
      eligibilityApplied: {
        nhfExempt: eligibilityData.exemptFromNHF,
        disabilityStatus: eligibilityData.hasDisability,
        hasLifeAssurance: eligibilityData.hasLifeAssurance,
        housingSituation: eligibilityData.housingSituation
      },
      
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
      deductions.lifeAssurance -
      deductions.disabilityRelief + 
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
   * Apply eligibility adjustments to deductions
   */
  applyEligibilityAdjustments = (deductions, eligibilityData) => {
    const adjustedDeductions = { ...deductions };

    // Apply rent relief if renting
    if (eligibilityData.housingSituation === 'renting' && eligibilityData.annualRent > 0) {
      const rentRelief = this.calculateELRentRelief(eligibilityData);
      adjustedDeductions.rentRelief = rentRelief;
      adjustedDeductions.taxableIncomeAdjustment = -rentRelief; // Reduces taxable income
    }

    // Apply age-based relief if 65+
    if (eligibilityData.isAboveSixtyFive || eligibilityData.isAboveSixty) {
      const ageRelief = this.calculateAgeRelief(eligibilityData, deductions.grossSalary);
      adjustedDeductions.ageRelief = ageRelief;
      adjustedDeductions.taxableIncomeAdjustment = (adjustedDeductions.taxableIncomeAdjustment || 0) - ageRelief;
    }

    // Apply disability relief
    if (eligibilityData.hasDisability) {
      adjustedDeductions.disabilityRelief = 20000; // Monthly
      adjustedDeductions.taxableIncomeAdjustment = (adjustedDeductions.taxableIncomeAdjustment || 0) - 20000;
    }

    // Recalculate totals
    if (adjustedDeductions.taxableIncomeAdjustment) {
      adjustedDeductions.adjustedTaxableIncome = 
        (adjustedDeductions.grossSalary || 0) + (adjustedDeductions.taxableIncomeAdjustment || 0);
    }

    return adjustedDeductions;
  }
  
  /**
   * Calculate rent relief based on eligibility data
   */
  calculateELRentRelief = (eligibilityData) => {
    if (eligibilityData.housingSituation !== 'renting') return 0;
    
    const annualRent = eligibilityData.annualRent || 0;
    const rentRelief = Math.min(annualRent * 0.20, 500000); // 20% of rent, max ₦500,000
    return rentRelief / 12; // Monthly
  }


  /**
   * Calculate age-based relief
   */
  calculateAgeRelief = (eligibilityData, grossSalary) => {
    if (!eligibilityData.isAboveSixty && !eligibilityData.isAboveSixtyFive) return 0;
    
    // 5% relief for 65+, additional for 60+
    if (eligibilityData.isAboveSixtyFive) {
      return grossSalary * 0.05; // 5% of income
    } else if (eligibilityData.isAboveSixty) {
      return grossSalary * 0.03; // 3% of income
    }
    return 0;
  }

  /**
   * Adjust deductions based on eligibility
   */
  adjustDeductionsWithEligibility = (totalDeductions, eligibilityData, grossEmolument) => {
    let adjustedDeductions = totalDeductions;

    // Remove NHF if exempt
    if (eligibilityData.exemptFromNHF) {
      const basicSalary = eligibilityData.basicSalary || 0;
      const nhfAmount = basicSalary * 0.025; // 2.5%
      adjustedDeductions -= nhfAmount;
    }

    // Apply life assurance deduction (tax deductible)
    if (eligibilityData.hasLifeAssurance) {
      const lifeAssurancePremium = eligibilityData.lifeAssurancePremium || 0;
      // Up to 10% of income is tax deductible
      const maxDeductible = grossEmolument * 0.10;
      const deductibleAmount = Math.min(lifeAssurancePremium, maxDeductible);
      adjustedDeductions -= deductibleAmount * 0.20; // 20% tax savings
    }

    return Math.max(0, adjustedDeductions);
  }

  /**
   * Generate eligibility breakdown for reporting
   */
  getEligibilityBreakdown = (eligibilityData) => {
    const breakdown = {
      housingSituation: eligibilityData.housingSituation,
      annualRent: eligibilityData.annualRent || 0,
      rentRelief: this.calculateRentRelief(eligibilityData) * 12,
      
      nhfStatus: eligibilityData.exemptFromNHF ? 'EXEMPT' : 'CONTRIBUTING',
      nhfExemptionReason: eligibilityData.nhfExemptionReason,
      
      pension: {
        mandatory: (eligibilityData.basicSalary || 0) * 0.08,
        additionalVoluntary: eligibilityData.additionalPension || 0,
        total: ((eligibilityData.basicSalary || 0) * 0.08) + (eligibilityData.additionalPension || 0)
      },
      
      lifeAssurance: {
        hasPolicy: eligibilityData.hasLifeAssurance,
        premium: eligibilityData.lifeAssurancePremium || 0,
        provider: eligibilityData.lifeAssuranceProvider,
        taxDeductibleAmount: Math.min(eligibilityData.lifeAssurancePremium || 0, 
          (eligibilityData.salary || 0) * 0.10)
      },
      
      disability: {
        hasDisability: eligibilityData.hasDisability,
        category: eligibilityData.disabilityCategory,
        monthlyRelief: eligibilityData.hasDisability ? 20000 : 0
      },
      
      ageRelief: {
        isAboveSixty: eligibilityData.isAboveSixty,
        isAboveSixtyFive: eligibilityData.isAboveSixtyFive,
        reliefAmount: this.calculateAgeRelief(eligibilityData, eligibilityData.salary || 0)
      }
    };

    return breakdown;
  }

  /**
   * Calculate tax optimization potential
   */
  calculateTaxOptimization = (eligibilityData, grossEmolument) => {
    const optimization = {
      currentTaxLiability: 0,
      optimizedTaxLiability: 0,
      potentialSavings: 0,
      recommendations: []
    };

    // Check for unclaimed benefits
    if (eligibilityData.housingSituation === 'renting' && 
        (!eligibilityData.annualRent || eligibilityData.annualRent === 0)) {
      optimization.recommendations.push({
        type: 'RENT_RELIEF',
        description: 'Claim rent relief (up to ₦500,000 annually)',
        potentialSavings: 500000 * 0.20, // 20% tax on relief
        action: 'Enter annual rent amount'
      });
    }

    if (!eligibilityData.hasLifeAssurance && grossEmolument > 100000) {
      optimization.recommendations.push({
        type: 'LIFE_ASSURANCE',
        description: 'Consider life assurance (up to 10% of income tax deductible)',
        potentialSavings: grossEmolument * 0.10 * 0.20, // 20% tax on deductible amount
        action: 'Add life assurance policy'
      });
    }

    if (!eligibilityData.additionalPension && grossEmolument > 500000) {
      optimization.recommendations.push({
        type: 'ADDITIONAL_PENSION',
        description: 'Increase voluntary pension contributions (up to 15% additional)',
        potentialSavings: grossEmolument * 0.15 * 0.20, // 20% tax savings
        action: 'Increase additional pension contribution'
      });
    }

    // Calculate total potential savings
    optimization.potentialSavings = optimization.recommendations.reduce(
      (sum, rec) => sum + (rec.potentialSavings || 0), 0
    );

    return optimization;
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

    // console.log(employee)
    // console.log(options)
    this.calculationLog = []; // Reset log

      const salaryComponents = options.salaryComponents || employee.salaryComponents;
    
    const {
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

      console.log(options)
      // Step 2: Calculate statutory deductions
      const deductions = this.calculateStatutoryDeductions(salaryComponents, additionalDeductions, options.eligibilityData);

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

module.exports = PAYECalculator;