
import { PAYE_CONFIG } from './payeConfig';

class TaxEligibilityChecker {
  constructor(employeeData, employmentType) {
    this.employee = employeeData;
    this.employmentType = employmentType || employeeData.employmentType;
    this.assessment = {
      eligibleExemptions: [],
      recommendedDeductions: [],
      complianceWarnings: [],
      optimizationOpportunities: [],
      documentationRequirements: [],
      totalPotentialSavings: 0
    };
  }

  /**
   * Main assessment method - runs all checks
   */
  async checkAllEligibilities() {
    try {
      // Basic eligibility checks
      this.checkNHFEligibility();
      this.checkPensionEligibility();
      this.checkHousingEligibility();
      this.checkAllowanceExemptions();
      this.checkSpecialCategoryEligibility();
      this.checkLifeAssuranceEligibility();
      this.checkGratuityEligibility();
      this.checkConsolidatedRelief();
      
      // Calculate potential savings
      this.calculatePotentialSavings();
      
      // Generate recommendations
      this.generateOptimizationRecommendations();
      
      return {
        success: true,
        assessment: this.assessment,
        summary: this.getSummary(),
        optimalDeductions: this.getOptimalDeductions(),
        complianceWarnings: this.assessment.complianceWarnings || [],
        requiredDocs: this.assessment.documentationRequirements || []
      };
    } catch (error) {
      console.error('Tax eligibility check failed:', error);
      return {
        success: false,
        error: error.message,
        assessment: this.assessment
      };
    }
  }

  /**
   * NHF Exemption Eligibility
   */
  checkNHFEligibility() {
    const { exemptions } = this.employee;
    const isExempt = this.isNHFExempt();
    
    if (isExempt) {
      this.assessment.eligibleExemptions.push({
        type: 'NHF_EXEMPTION',
        description: 'Exempt from National Housing Fund contribution',
        reason: this.getNHFExemptionReason(),
        savings: this.calculateNHFSavings(),
        priority: 'HIGH',
        documentation: ['Proof of exemption reason']
      });
    }
  }

  isNHFExempt() {
    const { exemptions, dateOfBirth, nationality } = this.employee;
    const age = this.calculateAge(dateOfBirth);
    
    // Automatic exemptions
    if (age >= 60) return true;
    if (nationality !== 'Nigerian') return true;
    if (exemptions?.isArmedForcesPersonnel) return true;
    if (exemptions?.isPolicePersonnel) return true;
    if (this.employmentType === 'casual' && this.getServiceDuration() < 6) return true;
    
    return exemptions?.nhfExempt || false;
  }

  getNHFExemptionReason() {
    const { exemptions, dateOfBirth, nationality } = this.employee;
    const age = this.calculateAge(dateOfBirth);
    
    if (age >= 60) return 'Above 60 years old';
    if (nationality !== 'Nigerian') return 'Non-Nigerian citizen';
    if (exemptions?.isArmedForcesPersonnel) return 'Armed Forces Personnel';
    if (exemptions?.isPolicePersonnel) return 'Police Personnel';
    
    return exemptions?.nhfExemptionReason || 'Other exemption';
  }

  calculateNHFSavings() {
    const basic = parseFloat(this.employee.basicSalary) || 0;
    const nhfRate = PAYE_CONFIG.NHF_RATE || 0.025; // 2.5%
    return basic * nhfRate * 12; // Annual savings
  }

  /**
   * Pension Eligibility & Optimization
   */
  checkPensionEligibility() {
    const { exemptions, joinDate } = this.employee;
    const serviceDuration = this.getServiceDuration(joinDate);
    
    // Check if exempt from mandatory pension
    if (this.isPensionExempt()) {
      this.assessment.eligibleExemptions.push({
        type: 'PENSION_EXEMPTION',
        description: 'Exempt from mandatory pension contribution',
        reason: this.getPensionExemptionReason(serviceDuration),
        savings: 0, // Not a savings, just exemption
        priority: 'MEDIUM',
        documentation: ['Employment contract', 'Probation letter']
      });
    } else {
      // Check for additional voluntary contribution opportunity
      const currentVoluntary = parseFloat(exemptions?.additionalVoluntaryPension) || 0;
      const maxVoluntary = this.calculateMaxVoluntaryPension();
      
      if (currentVoluntary < maxVoluntary) {
        const potentialIncrease = maxVoluntary - currentVoluntary;
        const annualTaxSaving = potentialIncrease * 0.20 * 12; // Assuming 20% tax rate
        
        this.assessment.optimizationOpportunities.push({
          type: 'ADDITIONAL_PENSION',
          description: 'Increase voluntary pension contribution',
          current: currentVoluntary,
          recommended: maxVoluntary,
          potentialAnnualSavings: annualTaxSaving,
          priority: 'MEDIUM',
          action: `Increase voluntary pension to ₦${maxVoluntary.toLocaleString()}/month`
        });
      }
    }
  }

  isPensionExempt() {
    const { exemptions, employmentType, joinDate } = this.employee;
    const serviceDuration = this.getServiceDuration(joinDate);
    
    // Automatic exemptions
    if (employmentType === 'casual' && serviceDuration < 6) return true;
    if (serviceDuration < 3/12) return true; // Less than 3 months
    
    return exemptions?.pensionExempt || false;
  }

  getPensionExemptionReason(serviceDuration) {
    if (serviceDuration < 3/12) return 'Under 3 months probation';
    if (this.employmentType === 'casual' && serviceDuration < 6) return 'Casual worker (< 6 months)';
    return 'Non-pensionable appointment';
  }

  calculateMaxVoluntaryPension() {
    const { basicSalary, housingAllowance, transportAllowance } = this.employee;
    const pensionableEmoluments = 
      (parseFloat(basicSalary) || 0) + 
      (parseFloat(housingAllowance) || 0) + 
      (parseFloat(transportAllowance) || 0);
    
    // Max voluntary contribution is 15% of pensionable emoluments
    return pensionableEmoluments * 0.15;
  }

  /**
   * Housing & Rent Relief Eligibility
   */
  checkHousingEligibility() {
    const { exemptions, housingSituation } = this.employee;
    
    if (housingSituation === 'renting' || exemptions?.rentsPrimaryResidence) {
      const annualRent = parseFloat(exemptions?.annualRentPaid) || 0;
      const rentRelief = Math.min(annualRent * 0.20, 500000);
      
      this.assessment.eligibleExemptions.push({
        type: 'RENT_RELIEF',
        description: 'Eligible for rent relief (20% of annual rent)',
        amount: rentRelief,
        documentation: ['Tenancy agreement', 'Rent receipts'],
        priority: 'HIGH'
      });
      
      // Check if maximizing relief
      if (annualRent * 0.20 > 500000) {
        this.assessment.complianceWarnings.push({
          type: 'RENT_RELIEF_CAPPED',
          message: 'Rent relief capped at ₦500,000 annually'
        });
      }
    }
    
    // Check for conflicting housing situations
    this.validateHousingConsistency();
  }

  validateHousingConsistency() {
    const { exemptions } = this.employee;
    const warnings = [];
    
    if (exemptions?.rentsPrimaryResidence && exemptions?.isHomeOwner) {
      warnings.push('Cannot claim rent relief while owning a home');
    }
    
    if (exemptions?.rentsPrimaryResidence && exemptions?.receivesCompanyProvidedHousing) {
      warnings.push('Cannot claim rent relief while receiving company housing');
    }
    
    warnings.forEach(warning => {
      this.assessment.complianceWarnings.push({
        type: 'HOUSING_CONFLICT',
        message: warning
      });
    });
  }

  /**
   * Allowance Exemption Checks
   */
  checkAllowanceExemptions() {
    const allowances = [
      { type: 'TRANSPORT', field: 'transportAllowance', limit: 30000, condition: 'officialDuties' },
      { type: 'MEAL', field: 'mealAllowance', limit: 5000, condition: 'officialDuties' },
      { type: 'UTILITY', field: 'utilityAllowance', limit: 10000, condition: 'officialCommunication' },
      { type: 'UNIFORM', field: 'uniformAllowance', limit: null, condition: 'requiredForWork' },
      { type: 'HARDSHIP', field: 'hardshipAllowance', limit: null, condition: 'hardshipArea' }
    ];
    
    allowances.forEach(allowance => {
      const amount = parseFloat(this.employee[allowance.field]) || 0;
      const isExempt = this.employee.exemptions?.[`${allowance.type.toLowerCase()}Exempt`] || 
                      this.employee.exemptions?.[`${allowance.field}ForOfficialDuties`];
      
      if (isExempt && amount > 0) {
        let exemptAmount = allowance.limit ? Math.min(amount, allowance.limit) : amount;
        
        this.assessment.eligibleExemptions.push({
          type: `${allowance.type}_EXEMPTION`,
          description: `${allowance.type} allowance exempt from tax`,
          amount: exemptAmount,
          monthlySavings: exemptAmount * 0.20, // Assuming 20% tax
          condition: allowance.condition,
          priority: 'MEDIUM'
        });
      }
    });
  }

  /**
   * Special Category Eligibility
   */
  checkSpecialCategoryEligibility() {
    const { exemptions, dateOfBirth } = this.employee;
    const age = this.calculateAge(dateOfBirth);
    
    // Disability
    if (exemptions?.hasDisability || exemptions?.isPersonWithDisability) {
      this.assessment.eligibleExemptions.push({
        type: 'DISABILITY_RELIEF',
        description: 'Additional relief for person with disability',
        amount: 20000, // Monthly
        annualAmount: 20000 * 12,
        documentation: ['Medical certificate', 'Disability registration'],
        priority: 'HIGH'
      });
    }
    
    // Age-based relief
    if (age >= 65) {
      const basic = parseFloat(this.employee.basicSalary) || 0;
      const additionalRelief = basic * 0.05; // 5% of basic salary
      
      this.assessment.eligibleExemptions.push({
        type: 'AGED_PERSON_RELIEF',
        description: 'Additional relief for persons 65+ years',
        amount: additionalRelief,
        monthlySavings: additionalRelief * 0.20,
        documentation: ['Age proof document'],
        priority: 'HIGH'
      });
    }
  }

  /**
   * Life Assurance Premium Deductibility
   */
  checkLifeAssuranceEligibility() {
    const { exemptions } = this.employee;
    
    if (exemptions?.hasLifeAssurance) {
      const premium = parseFloat(exemptions?.lifeAssurancePremium) || 0;
      const totalIncome = this.calculateTotalIncome();
      const maxDeductible = totalIncome * 0.10; // 10% of total income
      const deductibleAmount = Math.min(premium, maxDeductible);
      
      this.assessment.recommendedDeductions.push({
        type: 'LIFE_ASSURANCE',
        description: 'Life assurance premium tax deductible',
        amount: deductibleAmount,
        annualTaxSaving: deductibleAmount * 0.20, // Assuming 20% tax
        conditions: ['Policy in employee name', 'Minimum 10-year term'],
        priority: 'MEDIUM'
      });
    }
  }

  /**
   * Gratuity Eligibility
   */
  checkGratuityEligibility() {
    const { exemptions, joinDate } = this.employee;
    const yearsOfService = this.getServiceDuration(joinDate);
    
    if (yearsOfService >= 5) {
      this.assessment.eligibleExemptions.push({
        type: 'GRATUITY_EXEMPT',
        description: 'Gratuity payments exempt from tax',
        conditions: ['After 5+ years service', 'Retirement/Redundancy'],
        priority: 'LOW',
        futureBenefit: true
      });
    }
  }

  /**
   * Consolidated Relief Allowance
   */
  checkConsolidatedRelief() {
    const totalIncome = this.calculateTotalIncome();
    const consolidatedRelief = Math.max(200000, totalIncome * 0.01) + (totalIncome * 0.20);
    
    this.assessment.eligibleExemptions.push({
      type: 'CONSOLIDATED_RELIEF',
      description: 'Consolidated Relief Allowance (CRA)',
      amount: consolidatedRelief,
      calculation: `Higher of ₦200,000 or 1% of gross income + 20% of gross income`,
      priority: 'HIGH',
      automatic: true
    });
  }

  /**
   * Utility Methods
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getServiceDuration(joinDate) {
    if (!joinDate) return 0;
    const join = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - join);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  }

  calculateTotalIncome() {
    const {
      basicSalary, housingAllowance, transportAllowance,
      mealAllowance, utilityAllowance, uniformAllowance,
      hardshipAllowance, entertainmentAllowance, otherAllowances
    } = this.employee;
    
    return (
      (parseFloat(basicSalary) || 0) +
      (parseFloat(housingAllowance) || 0) +
      (parseFloat(transportAllowance) || 0) +
      (parseFloat(mealAllowance) || 0) +
      (parseFloat(utilityAllowance) || 0) +
      (parseFloat(uniformAllowance) || 0) +
      (parseFloat(hardshipAllowance) || 0) +
      (parseFloat(entertainmentAllowance) || 0) +
      (parseFloat(otherAllowances) || 0)
    ) * 12; // Annual income
  }

  calculatePotentialSavings() {
    let totalSavings = 0;
    
    // Sum eligible exemptions
    this.assessment.eligibleExemptions.forEach(exemption => {
      if (exemption.monthlySavings) {
        totalSavings += exemption.monthlySavings * 12;
      }
      if (exemption.annualTaxSaving) {
        totalSavings += exemption.annualTaxSaving;
      }
    });
    
    // Sum optimization opportunities
    this.assessment.optimizationOpportunities.forEach(opp => {
      totalSavings += opp.potentialAnnualSavings || 0;
    });
    
    this.assessment.totalPotentialSavings = totalSavings;
  }

  generateOptimizationRecommendations() {
    const recommendations = [];
    
    // NHF exemption check
    if (!this.isNHFExempt() && this.calculateAge(this.employee.dateOfBirth) >= 60) {
      recommendations.push({
        type: 'NHF_EXEMPTION',
        benefit: 'Stop NHF contributions',
        action: 'Update employee record to mark as exempt (age 60+)',
        priority: 'HIGH'
      });
    }
    
    // Rent relief check
    if (this.employee.exemptions?.rentsPrimaryResidence && 
        !this.employee.exemptions?.hasTenancyAgreement) {
      recommendations.push({
        type: 'RENT_RELIEF_DOCUMENTATION',
        benefit: 'Claim rent relief',
        action: 'Upload tenancy agreement to claim 20% rent relief',
        priority: 'MEDIUM'
      });
    }
    
    // Additional pension check
    const maxVoluntary = this.calculateMaxVoluntaryPension();
    const currentVoluntary = parseFloat(this.employee.exemptions?.additionalVoluntaryPension) || 0;
    if (currentVoluntary < maxVoluntary * 0.5) {
      recommendations.push({
        type: 'VOLUNTARY_PENSION',
        benefit: 'Increase tax savings',
        action: `Consider increasing voluntary pension contribution to ₦${Math.round(maxVoluntary).toLocaleString()}/month`,
        priority: 'MEDIUM'
      });
    }
    
    this.assessment.recommendations = recommendations;
  }

  getSummary() {
    const totalExemptions = this.assessment.eligibleExemptions.length;
    const totalOptimizations = this.assessment.optimizationOpportunities.length;
    const totalWarnings = this.assessment.complianceWarnings.length;
    
    return {
      totalExemptions,
      totalOptimizations,
      totalWarnings,
      estimatedAnnualSavings: this.assessment.totalPotentialSavings,
      complianceStatus: totalWarnings > 0 ? 'REVIEW_REQUIRED' : 'COMPLIANT'
    };
  }

  getOptimalDeductions() {
    return {
      eligibleExemptions: this.assessment.eligibleExemptions|| [],
      recommendations: this.assessment.recommendations || [],
      totalPotentialSavings: this.assessment.totalPotentialSavings|| 0,
      nextSteps: this.generateNextSteps()|| []
    };
  }

  generateNextSteps() {
    const steps = [];
    
    // Documentation steps
    if (this.assessment.eligibleExemptions.some(e => e.documentation)) {
      steps.push('Upload required documentation for claimed exemptions');
    }
    
    // Compliance steps
    if (this.assessment.complianceWarnings.length > 0) {
      steps.push('Review and resolve compliance warnings');
    }
    
    // Optimization steps
    if (this.assessment.optimizationOpportunities.length > 0) {
      steps.push('Implement recommended optimizations');
    }
    
    return steps;
  }
}

export { TaxEligibilityChecker };