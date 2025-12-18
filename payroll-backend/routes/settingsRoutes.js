const express = require('express');
const settingsController = require('../controller/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Salary bands
router.get('/salary-bands', settingsController.getSalaryBands);
router.put('/salary-bands', settingsController.updateSalaryBands);

// HR settings
router.get('/hr-settings', settingsController.getHRSettings);
router.put('/hr-settings', settingsController.updateHRSettings);

//Payroll
router.get('/payroll-settings/current', settingsController.getPayrollSettings);
router.get('/payroll-settings/paye', settingsController.getPAYESettings);
router.get('/payroll-settings/default', settingsController.getDefaultPayrollSettings);
router.put('/payroll-settings/update',  settingsController.updatePayrollSettings);
router.put('/payroll-settings/paye', settingsController.updatePAYESettings);


module.exports = router;