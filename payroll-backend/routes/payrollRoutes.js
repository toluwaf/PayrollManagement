const express = require('express');
const payrollController = require('../controller/payrollController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', payrollController.getAllPayrollRuns);
router.get('/summary/:period', payrollController.getPayrollSummary);
router.get('/:id', payrollController.getPayrollRunById);
router.post('/process', payrollController.processPayroll);
router.post('/:id/approve', payrollController.approvePayroll);
router.get('/payslip/:employeeId/:period', payrollController.getEmployeePayslip);

router.post('/:payrollRunId/approval/initiate', payrollController.initiateApprovalWorkflow);
router.post('/approval/:workflowId/approve', payrollController.approveWorkflowStep);
router.post('/approval/:workflowId/reject', payrollController.rejectWorkflowStep);
router.get('/approval/pending', payrollController.getPendingApprovals);
router.get('/:payrollRunId/approval/workflow', payrollController.getWorkflowByPayrollRun);

router.get('/adjustments/list', payrollController.getAdjustments);
router.post('/adjustments/create', payrollController.createAdjustment);
router.put('/adjustments/update/:id', payrollController.updateAdjustment);
router.delete('/adjustments/delete/:id', payrollController.deleteAdjustment);
router.post('/adjustments/bulk-create', payrollController.bulkCreateAdjustments);
router.get('/adjustments/types', payrollController.getAdjustmentTypes);

// Cycle management routes
router.get('/periods/generate', payrollController.generatePayrollPeriods);


router.get('/history/all', payrollController.getPayrollHistory);
router.get('/history/export', payrollController.exportPayrollHistory);

module.exports = router;