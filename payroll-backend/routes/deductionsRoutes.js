const express = require('express');
const deductionsController = require('../controller/deductionsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', deductionsController.getAllDeductions);
router.post('/calculate', deductionsController.calculateDeductions);
router.post('/:id/remit', deductionsController.remitDeductions);
router.get('/summary/:period', deductionsController.getDeductionSummary);
router.get('/compliance/:period/:reportType', deductionsController.generateComplianceReport);
router.get('/export/:period', deductionsController.exportDeductions); 
module.exports = router;