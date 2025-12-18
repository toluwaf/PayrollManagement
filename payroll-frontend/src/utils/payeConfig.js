// src/utils/payeConfig.js
export const PAYE_CONFIG = {
  // Tax Brackets 2025
  TAX_BRACKETS: [
    { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
    { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
    { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
    { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
    { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
    { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
  ],

  // Statutory Rates
  STATUTORY_RATES: {
    EMPLOYEE_PENSION: 0.08, // 8%
    EMPLOYER_PENSION: 0.10, // 10%
    NHF_RATE: 0.025, // 2.5%
    NHIS_RATE: 0.05, // 5%
    NSITF_RATE: 0.01, // 1%
    ITF_RATE: 0.01 // 1%
  },

  // Reliefs & Exemptions
  RELIEFS: {
    RENT_RELIEF_RATE: 0.20, // 20%
    RENT_RELIEF_CAP: 500000, // ₦500,000
    DISABILITY_RELIEF: 20000, // Monthly
    AGED_PERSON_RELIEF_RATE: 0.05, // 5%
    CONSOLIDATED_RELIEF_MIN: 200000, // Higher of ₦200,000 or 1% of gross
    CONSOLIDATED_RELIEF_RATE: 0.20 // 20% of gross income
  },

  // Allowance Exemption Limits (Monthly)
  ALLOWANCE_EXEMPTIONS: {
    TRANSPORT: 30000,
    MEAL: 5000, // Per day
    UTILITY: 10000,
    UNIFORM: null, // Actual cost
    HARDSHIP: null // Case by case
  },

  // Voluntary Contribution Limits
  VOLUNTARY_CONTRIBUTIONS: {
    MAX_PENSION_RATE: 0.15, // 15% additional
    MAX_LIFE_ASSURANCE_RATE: 0.10 // 10% of income
  },

  // Employment Categories
  EMPLOYMENT_CATEGORIES: {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    CASUAL: 'casual',
    TEMPORARY: 'temporary'
  },

  // Exemption Categories
  EXEMPTION_CATEGORIES: {
    NHF_EXEMPTIONS: [
      'age_60_plus',
      'non_nigerian',
      'armed_forces',
      'police_personnel',
      'casual_worker',
      'contract_staff',
      'other'
    ],
    
    PENSION_EXEMPTIONS: [
      'under_3_months_probation',
      'casual_worker_under_6_months',
      'non_pensionable_appointment',
      'other'
    ],
    
    DISABILITY_CATEGORIES: [
      'physical',
      'visual',
      'hearing',
      'intellectual',
      'multiple',
      'other'
    ]
  },

  // Required Documentation
  REQUIRED_DOCS: {
    RENT_RELIEF: ['tenancy_agreement', 'rent_receipts'],
    DISABILITY: ['medical_certificate', 'disability_registration'],
    AGE_PROOF: ['birth_certificate', 'passport', 'age_declaration'],
    NHF_EXEMPTION: ['age_proof', 'visa', 'official_exemption_letter'],
    LIFE_ASSURANCE: ['policy_document', 'premium_receipts']
  }
};

export default PAYE_CONFIG;