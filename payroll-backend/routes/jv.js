// backend/routes/jv.js
const express = require('express');
const jvController = require('../controller/jvController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// JV Partners
router.get('/partners', jvController.getAllPartners);
router.get('/partners/:id', jvController.getPartnerById);

// JV Agreements
router.get('/agreements', jvController.getAllAgreements);
router.get('/agreements/:id', jvController.getAgreementById);

// Allocation Rules
router.get('/allocation-rules', jvController.getAllocationRules);

// Allocation Calculations
router.post('/allocations/calculate', jvController.calculateAllocations);
router.get('/allocations/results/:payrollRunId', jvController.getAllocationResults);

// Reports & Statistics
router.get('/reports/:period', jvController.generateAllocationReport);
router.get('/statistics/:period', jvController.getAllocationStatistics);

// Validation
router.get('/validate-rules/:agreementId', jvController.validateAllocationRules);

module.exports = router;