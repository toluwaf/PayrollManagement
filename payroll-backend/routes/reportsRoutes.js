const express = require('express');
const reportsController = require('../controller/reportsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/payroll-summary', reportsController.getPayrollSummary);
router.get('/department-breakdown/:period', reportsController.getDepartmentBreakdown);
router.get('/deduction-analysis', reportsController.getDeductionAnalysis);
router.get('/compliance-status/:period', reportsController.getComplianceStatus);
router.get('/dashboard-metrics', reportsController.getDashboardMetrics);
router.get('/export/:format/:reportType', reportsController.exportReport);

module.exports = router;