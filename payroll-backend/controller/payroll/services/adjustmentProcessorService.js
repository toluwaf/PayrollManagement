/**
 * Adjustment Processor Service
 * Handles all payroll adjustment processing including overtime, loans, bonuses, etc.
 */

const { calculateOvertime, getOvertimeBreakdown } = require('../utilities/overtimeCalculator');
const { 
  LOAN_DEDUCTION_TYPES, 
  MAX_LOAN_DEDUCTION_PERCENTAGE 
} = require('../constants/payrollConstants');

/**
 * Process all payroll adjustments with Nigerian compliance
 * @param {object} adjustments - All adjustment types
 * @param {number} multiplier - Cycle multiplier
 * @returns {object} Processed adjustment amounts
 */
function processAdjustments(adjustments, multiplier) {
  // Store employee salary for loan calculation limits
  const employeeSalary = adjustments.baseSalary || 0;
  const estimatedNetSalary = adjustments.estimatedNetSalary || 0;
  
  // Calculate overtime
  const overtimeAmount = calculateOvertime(
    adjustments.overtime, 
    multiplier, 
    employeeSalary
  );
  
  // Calculate loan deductions
  const loanDeductionsAmount = calculateLoanDeductions(
    adjustments.loans, 
    estimatedNetSalary
  );
  
  // Process other adjustments
  const bonusAmount = (adjustments.bonus || 0) * multiplier;
  const commissionAmount = (adjustments.commission || 0) * multiplier;
  const allowanceAmount = (adjustments.specialAllowance || 0) * multiplier;
  
  // Nigerian-specific adjustments
  const nigerianSpecific = {
    hazardAllowance: (adjustments.hazardAllowance || 0) * multiplier,
    transportAllowance: (adjustments.transportAllowance || 0) * multiplier,
    furnitureAllowance: (adjustments.furnitureAllowance || 0) * multiplier,
    utilityAllowance: (adjustments.utilityAllowance || 0) * multiplier,
    mealAllowance: (adjustments.mealAllowance || 0) * multiplier
  };
  
  // Deductions (additional to statutory)
  const otherDeductions = {
    cooperativeDeduction: (adjustments.cooperative || 0) * multiplier,
    unionDues: (adjustments.unionDues || 0) * multiplier,
    investmentDeduction: (adjustments.investment || 0) * multiplier,
    charityDeduction: (adjustments.charity || 0) * multiplier
  };
  
  // Calculate totals
  const totalAdditions = 
    bonusAmount + 
    overtimeAmount + 
    commissionAmount + 
    allowanceAmount +
    Object.values(nigerianSpecific).reduce((sum, val) => sum + val, 0);
    
  const totalDeductions = 
    loanDeductionsAmount + 
    Object.values(otherDeductions).reduce((sum, val) => sum + val, 0);
    
  const netAdjustment = totalAdditions - totalDeductions;
  
  return {
    // Additions
    bonus: bonusAmount,
    overtime: overtimeAmount,
    commission: commissionAmount,
    allowance: allowanceAmount,
    ...nigerianSpecific,
    
    // Deductions
    loanDeductions: loanDeductionsAmount,
    ...otherDeductions,
    
    // Totals
    totalAdditions,
    totalDeductions,
    netAdjustment,
    
    // Details for reporting
    details: {
      overtimeBreakdown: getOvertimeBreakdown(
        adjustments.overtime, 
        multiplier, 
        employeeSalary
      ),
      loanBreakdown: getLoanBreakdown(adjustments.loans, estimatedNetSalary),
      nigerianAllowances: nigerianSpecific,
      otherAdjustments: adjustments.other || 0
    }
  };
}

/**
 * Calculate loan deductions with Nigerian financial regulations
 * @param {array|object|number} loans - Loan details
 * @param {number} estimatedNetSalary - Estimated net salary
 * @returns {number} Total loan deductions
 */
function calculateLoanDeductions(loans, estimatedNetSalary = 0) {
  if (!loans) {
    return 0;
  }

  // If loans is a simple number
  if (typeof loans === 'number') {
    // Apply Nigerian regulations: Maximum 33% of net salary can go to loan repayment
    return Math.min(loans, estimatedNetSalary * MAX_LOAN_DEDUCTION_PERCENTAGE);
  }

  // If loans is an array of loan objects
  if (Array.isArray(loans)) {
    let totalDeductions = 0;
    
    for (const loan of loans) {
      if (!loan || typeof loan !== 'object') continue;
      
      const {
        amount = 0,
        interestRate = 0,
        installment = 0,
        outstandingBalance = 0,
        deductionType = LOAN_DEDUCTION_TYPES.FIXED
      } = loan;

      let deduction = 0;

      switch (deductionType) {
        case LOAN_DEDUCTION_TYPES.FIXED:
          deduction = amount || installment || 0;
          break;
          
        case LOAN_DEDUCTION_TYPES.PERCENTAGE:
          const percentage = amount / 100; // amount is percentage
          deduction = estimatedNetSalary * percentage;
          break;
          
        case LOAN_DEDUCTION_TYPES.AMORTIZING:
          // Calculate EMI (Equated Monthly Installment)
          if (outstandingBalance > 0 && interestRate > 0 && loan.tenureMonths) {
            const monthlyInterestRate = interestRate / 100 / 12;
            const emi = (outstandingBalance * monthlyInterestRate * 
                        Math.pow(1 + monthlyInterestRate, loan.tenureMonths)) /
                        (Math.pow(1 + monthlyInterestRate, loan.tenureMonths) - 1);
            deduction = emi;
          }
          break;
          
        case LOAN_DEDUCTION_TYPES.INTEREST_ONLY:
          deduction = (outstandingBalance * interestRate) / 100 / 12;
          break;
      }

      // Apply Nigerian regulation: Maximum 33% of net salary for loan deductions
      const maxAllowed = estimatedNetSalary * MAX_LOAN_DEDUCTION_PERCENTAGE;
      if (totalDeductions + deduction > maxAllowed) {
        deduction = Math.max(0, maxAllowed - totalDeductions);
      }

      totalDeductions += deduction;
    }

    return totalDeductions;
  }

  // If loans is a single loan object
  if (typeof loans === 'object') {
    return calculateLoanDeductions([loans], estimatedNetSalary);
  }

  return 0;
}

/**
 * Get loan deduction breakdown
 * @param {array|object|number} loans - Loan details
 * @param {number} estimatedNetSalary - Estimated net salary
 * @returns {object|null} Loan breakdown or null
 */
function getLoanBreakdown(loans, estimatedNetSalary = 0) {
  if (!loans) return null;
  
  if (Array.isArray(loans)) {
    return loans.map(loan => ({
      loanId: loan.loanId,
      description: loan.description,
      type: loan.deductionType,
      amount: calculateLoanDeductions([loan], estimatedNetSalary),
      outstanding: loan.outstandingBalance,
      interestRate: loan.interestRate
    }));
  }
  
  return null;
}

module.exports = {
  processAdjustments,
  calculateLoanDeductions,
  getLoanBreakdown
};
