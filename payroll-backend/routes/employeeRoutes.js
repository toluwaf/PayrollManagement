const express = require('express');
const employeeController = require('../controller/employeeController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
    employeeValidation,
    validateEmployee, validatePersonalDetails, validateAddress, 
    validateDocument, validateEducation, validateEmploymentHistory
} = require('../validations/employeeValidation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/',  employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// Employee Profile Route
router.get('/:id/full-profile', employeeController.getEmployeeFullProfile);
router.get('/:id/complete-profile', employeeController.getEmployeeCompleteProfile);
router.get('/:id/payroll-summary', employeeController.getEmployeePayrollSummary);
router.get('/:id/compliance-data', employeeController.getEmployeeComplianceData);

// Enhanced update with versioning and conflict resolution
router.put('/:id/secure-update', employeeController.updateEmployeeWithConflictResolution);

// Multi-section atomic update
router.put('/:id/profile-sections', employeeController.updateEmployeeProfileSections);

// Address Management Routes
router.get('/:id/addresses', employeeController.getEmployeeAddresses);
router.post('/:id/addresses', employeeController.addEmployeeAddress);
router.put('/:id/addresses/:addressId', employeeController.updateEmployeeAddress);
router.delete('/:id/addresses/:addressId', employeeController.deleteEmployeeAddress);

// Education Management Routes
router.get('/:id/education', employeeController.getEmployeeEducation);
router.post('/:id/education', employeeController.addEmployeeEducation);
router.put('/:id/education/:educationId', employeeController.updateEmployeeEducation);
router.delete('/:id/education/:educationId', employeeController.deleteEmployeeEducation);

// Employment History Routes
router.get('/:id/employment-history', employeeController.getEmployeeEmploymentHistory);
router.post('/:id/employment-history', employeeController.addEmployeeEmploymentHistory);
router.put('/:id/employment-history/:historyId', employeeController.updateEmployeeEmploymentHistory);
router.delete('/:id/employment-history/:historyId', employeeController.deleteEmployeeEmploymentHistory);

// Document Management Routes
router.get('/:id/documents', employeeController.getEmployeeDocuments);
router.post('/:id/documents', employeeController.addEmployeeDocument);
router.put('/:id/documents/:documentId', employeeController.updateEmployeeDocument);
router.delete('/:id/documents/:documentId', employeeController.deleteEmployeeDocument);

// Personal Details Routes
router.get('/:id/personal-details', employeeController.getEmployeePersonalDetails);
router.put('/:id/personal-details', employeeController.updateEmployeePersonalDetails);

// Contract Management
router.get('/:id/contracts', employeeController.getEmployeeContracts);
router.post('/:id/contracts', employeeController.addEmployeeContract);

// JV Allocation Management  
router.get('/:id/jv-allocations', employeeController.getJVAllocations);
router.put('/:id/jv-allocations', employeeController.updateJVAllocation);

// Payroll Calculations
router.post('/:id/calculate-payroll', employeeController.calculateEmployeePayroll);

// JV Allocation Enhanced Routes
router.get('/:id/jv-allocations-with-rules', employeeController.getEmployeeJVAllocationsWithRules);
router.post('/:id/jv-allocations', employeeController.assignEmployeeToJV);
// router.put('/:id/jv-allocations/:allocationId', employeeController.updateEmployeeJVAllocation);
// router.delete('/:id/jv-allocations/:allocationId', employeeController.removeEmployeeJVAllocation);

// Payroll & Payment Routes
router.get('/:id/payroll-history', employeeController.getEmployeePayrollHistory);
// router.get('/:id/payment-transactions', employeeController.getEmployeePaymentTransactions);

// Advanced Search
router.get('/search/advanced', employeeController.searchEmployeesAdvanced);


module.exports = router;