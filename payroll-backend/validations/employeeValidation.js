const Joi = require('joi');

const employeeValidation = {
  create: Joi.object({
    // Personal Information
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''), // Added
    address: Joi.string().allow(''), // Added
    dateOfBirth: Joi.date().max('now').allow(''), // Added
    gender: Joi.string().valid('male', 'female', 'other').allow(''), // Added
    maritalStatus: Joi.string().valid('single', 'married', 'divorced').allow(''), // Added
    nationality: Joi.string().valid('Nigerian', 'Non-Nigerian').default('Nigerian'),

    // Employment Information
    employeeId: Joi.string().pattern(/^EMP-\d+$/), // Made optional (generated automatically)
    department: Joi.string().required(), // Changed from enum to string (department IDs)
    position: Joi.string().max(100).required(),
    jobGrade: Joi.string().allow(''), // Added
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary').default('full-time'),
    employmentStatus: Joi.string().valid('active', 'probation', 'suspended', 'terminated').default('active'),
    joinDate: Joi.date().max('now').required(),
    probationEndDate: Joi.date().allow(null),
    
    // Salary Structure - UPDATED
    salary: Joi.number().min(30000).max(50000000).required(),
    basicSalary: Joi.number().min(30000).max(Joi.ref('salary')).required(),
    housingAllowance: Joi.number().min(0).default(0),
    transportAllowance: Joi.number().min(0).default(0),
    mealAllowance: Joi.number().min(0).default(0), 
    utilityAllowance: Joi.number().min(0).default(0),
    uniformAllowance: Joi.number().min(0).default(0),
    hardshipAllowance: Joi.number().min(0).default(0),
    entertainmentAllowance: Joi.number().min(0).default(0), // Added
    otherAllowances: Joi.number().min(0).default(0), // Added
    
    // Bank Information - UPDATED
    bankName: Joi.string().required(),
    bankAccount: Joi.string().pattern(/^\d+$/).required(), // Removed length validation for flexibility
    bankCode: Joi.string().allow(''), // Added
    accountType: Joi.string().valid('savings', 'current').default('savings'), // Added
        
    // Eligibility & Exemptions (NEW FIELDS)
    housingSituation: Joi.string().valid('renting', 'owner', 'company', '').default(''),
    annualRent: Joi.number().min(0).default(0),
    exemptFromNHF: Joi.boolean().default(false),
    nhfExemptionReason: Joi.string().allow(''),
    nhfExemptionDetails: Joi.string().allow(''),
    additionalPension: Joi.number().min(0).default(0),
    hasLifeAssurance: Joi.boolean().default(false),
    lifeAssurancePremium: Joi.number().min(0).default(0),
    lifeAssuranceProvider: Joi.string().allow(''),
    lifeAssurancePolicyNo: Joi.string().allow(''),
    hasDisability: Joi.boolean().default(false),
    disabilityCategory: Joi.string().allow(''),
    disabilityRegNo: Joi.string().allow(''),
    
    // Legacy exemptions structure
    exemptions: Joi.object({
      rentsPrimaryResidence: Joi.boolean().default(false),
      hasTenancyAgreement: Joi.boolean().default(false),
      hasRentReceipts: Joi.boolean().default(false),
      isPersonWithDisability: Joi.boolean().default(false),
      isAboveSixty: Joi.boolean().default(false),
      isAboveSixtyFive: Joi.boolean().default(false),
      isArmedForcesPersonnel: Joi.boolean().default(false),
      isPolicePersonnel: Joi.boolean().default(false),
      receivesCompanyProvidedHousing: Joi.boolean().default(false),
      isHomeOwner: Joi.boolean().default(false),
      transportAllowanceForOfficialDuties: Joi.boolean().default(false),
      mealAllowanceForOfficialDuties: Joi.boolean().default(false),
      utilityAllowanceForOfficialDuties: Joi.boolean().default(false),
      uniformAllowanceForOfficialDuties: Joi.boolean().default(false),
      hardshipAllowanceForOfficialDuties: Joi.boolean().default(false)
    }).default({}),
    
    // Compliance
    taxId: Joi.string().pattern(/^TIN-\d+$/).required(),
    pensionId: Joi.string().pattern(/^PEN-\d+$/).required(),
    nhfId: Joi.string().allow(''), // Added
    nhisId: Joi.string().allow(''), 
    itfId: Joi.string().allow(''), 

    // JV Information - Added
    jvPartners: Joi.array().items(Joi.string()).default([]),
        
    // Assessment Results
    eligibilityAssessment: Joi.object().allow(null),
    lastAssessmentDate: Joi.date().allow(null),
    assessmentVersion: Joi.string().allow(''),

    // Status
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active')
  }),

  update: Joi.object({
    // Personal Information
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().allow(''),
    address: Joi.string().allow(''),
    dateOfBirth: Joi.date().max('now').allow(''),
    gender: Joi.string().valid('male', 'female', 'other').allow(''),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced').allow(''),
    nationality: Joi.string().valid('Nigerian', 'Non-Nigerian'),

    // Employment Information
    department: Joi.string(),
    position: Joi.string().max(100),
    jobGrade: Joi.string().allow(''),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary'),
    employmentStatus: Joi.string().valid('active', 'probation', 'suspended', 'terminated'),
    joinDate: Joi.date().max('now'),
    probationEndDate: Joi.date().allow(null),
    
    // Salary Structure
    salary: Joi.number().min(30000).max(50000000),
    basicSalary: Joi.number().min(30000).max(Joi.ref('salary')),
    housingAllowance: Joi.number().min(0),
    transportAllowance: Joi.number().min(0),
    mealAllowance: Joi.number().min(0),
    utilityAllowance: Joi.number().min(0),
    uniformAllowance: Joi.number().min(0),
    hardshipAllowance: Joi.number().min(0),
    entertainmentAllowance: Joi.number().min(0),
    otherAllowances: Joi.number().min(0),
        
    // Eligibility & Exemptions
    housingSituation: Joi.string().valid('renting', 'owner', 'company', ''),
    annualRent: Joi.number().min(0),
    exemptFromNHF: Joi.boolean(),
    nhfExemptionReason: Joi.string().allow(''),
    nhfExemptionDetails: Joi.string().allow(''),
    additionalPension: Joi.number().min(0),
    hasLifeAssurance: Joi.boolean(),
    lifeAssurancePremium: Joi.number().min(0),
    lifeAssuranceProvider: Joi.string().allow(''),
    lifeAssurancePolicyNo: Joi.string().allow(''),
    hasDisability: Joi.boolean(),
    disabilityCategory: Joi.string().allow(''),
    disabilityRegNo: Joi.string().allow(''),
    
    // Legacy exemptions structure
    exemptions: Joi.object({
      rentsPrimaryResidence: Joi.boolean(),
      hasTenancyAgreement: Joi.boolean(),
      hasRentReceipts: Joi.boolean(),
      isPersonWithDisability: Joi.boolean(),
      isAboveSixty: Joi.boolean(),
      isAboveSixtyFive: Joi.boolean(),
      isArmedForcesPersonnel: Joi.boolean(),
      isPolicePersonnel: Joi.boolean(),
      receivesCompanyProvidedHousing: Joi.boolean(),
      isHomeOwner: Joi.boolean(),
      transportAllowanceForOfficialDuties: Joi.boolean(),
      mealAllowanceForOfficialDuties: Joi.boolean(),
      utilityAllowanceForOfficialDuties: Joi.boolean(),
      uniformAllowanceForOfficialDuties: Joi.boolean(),
      hardshipAllowanceForOfficialDuties: Joi.boolean()
    }),
    
    // Bank Information
    bankName: Joi.string(),
    bankAccount: Joi.string().pattern(/^\d+$/),
    bankCode: Joi.string().allow(''),
    accountType: Joi.string().valid('savings', 'current'),
    
    // Compliance
    taxId: Joi.string().pattern(/^TIN-\d+$/),
    pensionId: Joi.string().pattern(/^PEN-\d+$/),
    nhfId: Joi.string().allow(''),
    nhisId: Joi.string().allow(''),
    itfId: Joi.string().allow(''),
        
    // Bank Information
    bankName: Joi.string(),
    bankAccount: Joi.string().pattern(/^\d{10}$/),
    bankCode: Joi.string().allow(''),
    accountType: Joi.string().valid('savings', 'current', 'domiciliary'),
    
    // Documents
    documents: Joi.object({
      tenancyAgreement: Joi.string().allow(''),
      rentReceipts: Joi.array().items(Joi.string()),
      disabilityCertificate: Joi.string().allow(''),
      lifeAssurancePolicy: Joi.string().allow(''),
      nhfExemptionDoc: Joi.string().allow(''),
      ageProof: Joi.string().allow('')
    }),
    
    // JV Information
    jvPartners: Joi.array().items(Joi.string()),
        
    // Assessment Results
    eligibilityAssessment: Joi.object().allow(null),
    lastAssessmentDate: Joi.date().allow(null),
    assessmentVersion: Joi.string().allow(''),
    
    // Status
    status: Joi.string().valid('active', 'inactive', 'suspended')
  }).min(1),

  // Enhanced Personal Details Validation
  personalDetails: Joi.object({
    nationality: Joi.string().max(50).allow(''),
    stateOfOrigin: Joi.string().max(50).allow(''),
    lga: Joi.string().max(50).allow(''),
    nextOfKin: Joi.object({
      name: Joi.string().max(100).required(),
      relationship: Joi.string().max(50).required(),
      phone: Joi.string().max(20).required(),
      address: Joi.string().max(200).required()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).required(),
      relationship: Joi.string().max(50).required(),
      phone: Joi.string().max(20).required(),
      address: Joi.string().max(200).required()
    }).optional()
  }),

  // Address Validation
  address: Joi.object({
    type: Joi.string().valid('current', 'permanent', 'previous').required(),
    address: Joi.string().max(500).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    country: Joi.string().max(100).default('Nigeria'),
    postalCode: Joi.string().max(20).allow(''),
    isPrimary: Joi.boolean().default(false),
    startDate: Joi.date().max('now').required(),
    endDate: Joi.date().max('now').allow(null)
  }),

  // Education Validation
  education: Joi.object({
    institution: Joi.string().max(200).required(),
    qualification: Joi.string().max(100).required(),
    fieldOfStudy: Joi.string().max(100).required(),
    startDate: Joi.date().max('now').required(),
    endDate: Joi.date().max('now').required(),
    grade: Joi.string().max(50).allow(''),
    certificateUrl: Joi.string().uri().allow('')
  }),

  // Employment History Validation (Internal)
  employmentHistory: Joi.object({
    position: Joi.string().max(100).required(),
    department: Joi.string().max(100).required(),
    startDate: Joi.date().max('now').required(),
    endDate: Joi.date().max('now').allow(null),
    salary: Joi.number().min(0).required(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary').required(),
    location: Joi.string().max(100).allow(''),
    supervisor: Joi.string().max(100).allow(''),
    reasonForChange: Joi.string().max(200).allow('')
  }),

  // Document Validation
  document: Joi.object({
    type: Joi.string().valid('contract', 'certificate', 'id', 'other').required(),
    name: Joi.string().max(200).required(),
    url: Joi.string().uri().required(),
    uploadDate: Joi.date().max('now').required(),
    expiryDate: Joi.date().allow(null),
    status: Joi.string().valid('active', 'expired', 'pending').default('active')
  })
};

const validateEmployee = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  employeeValidation,
  validateEmployee,
  validatePersonalDetails: validateEmployee(employeeValidation.personalDetails),
  validateAddress: validateEmployee(employeeValidation.address),
  validateEducation: validateEmployee(employeeValidation.education),
  validateEmploymentHistory: validateEmployee(employeeValidation.employmentHistory),
  validateDocument: validateEmployee(employeeValidation.document)
};