/**
 * Eligibility Service
 * Handles employee eligibility assessments, savings calculations, and relief computations
 */

/**
 * Calculate eligibility savings
 * @param {object} eligibilityBreakdown - Employee's eligibility breakdown
 * @returns {number} Total savings
 */
function calculateEligibilitySavings(eligibilityBreakdown) {
  let totalSavings = 0;
  
  // Rent relief
  totalSavings += eligibilityBreakdown.rentRelief || 0;
  
  // Disability relief
  totalSavings += eligibilityBreakdown.disability?.monthlyRelief || 0;
  
  // Age relief
  totalSavings += eligibilityBreakdown.ageRelief?.reliefAmount || 0;
  
  // NHF exemption savings
  if (eligibilityBreakdown.nhfStatus === 'EXEMPT') {
    const nhfAmount = (eligibilityBreakdown.basicSalary || 0) * 0.025;
    totalSavings += nhfAmount;
  }
  
  return totalSavings;
}

/**
 * Generate eligibility summary from payroll results
 * @param {Array} payrollResults - Array of payroll calculation results
 * @returns {object} Summary of eligibility data
 */
function generateEligibilitySummary(payrollResults) {
  const summary = {
    totalEmployees: payrollResults.length,
    employeesWithEligibility: 0,
    totalRentRelief: 0,
    totalDisabilityRelief: 0,
    totalNHFExemptions: 0,
    totalLifeAssurance: 0,
    totalAdditionalPension: 0
  };

  payrollResults.forEach(result => {
    if (result.eligibilityBreakdown) {
      summary.employeesWithEligibility++;
      summary.totalRentRelief += result.eligibilityBreakdown.rentRelief || 0;
      summary.totalDisabilityRelief += result.eligibilityBreakdown.disability?.monthlyRelief || 0;
      if (result.eligibilityBreakdown.nhfStatus === 'EXEMPT') {
        summary.totalNHFExemptions++;
      }
      summary.totalLifeAssurance += result.eligibilityBreakdown.lifeAssurance?.premium || 0;
      summary.totalAdditionalPension += result.eligibilityBreakdown.pension?.additionalVoluntary || 0;
    }
  });

  return summary;
}

/**
 * Enhance employee data with eligibility information
 * @param {object} employee - Employee data
 * @returns {object} Enhanced employee data with eligibility fields
 */
function enhanceEmployeeEligibility(employee) {
  const eligibilityAssessment = employee.eligibilityAssessment || {};
  const exemptions = employee.exemptions || {};

  return {
    ...employee,
    exemptFromNHF: employee.exemptFromNHF || false,
    hasDisability: employee.hasDisability || false,
    housingSituation: employee.housingSituation || null,
    annualRent: employee.annualRent || 0,
    additionalPension: employee.additionalPension || 0,
    hasLifeAssurance: employee.hasLifeAssurance || false,
    lifeAssurancePremium: employee.lifeAssurancePremium || 0,

    exemptions: { 
      ...exemptions,
      nhfExempt: employee.exemptFromNHF || false,
      isPersonWithDisability: employee.hasDisability || false 
    },

    eligibilityAssessment: eligibilityAssessment
  };
}

/**
 * Adjust deductions based on eligibility
 * @param {number} totalDeductions - Total deductions before adjustment
 * @param {object} eligibilityData - Employee eligibility data
 * @param {number} grossEmolument - Gross salary
 * @returns {number} Adjusted deductions
 */
function adjustDeductionsWithEligibility(totalDeductions, eligibilityData, grossEmolument) {
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

module.exports = {
  calculateEligibilitySavings,
  generateEligibilitySummary,
  enhanceEmployeeEligibility,
  adjustDeductionsWithEligibility
};
