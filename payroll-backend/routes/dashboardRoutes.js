// routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controller/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/hr-statistics', dashboardController.getHRStatistics);
router.get('/recent-hires', dashboardController.getRecentHires);

module.exports = router;