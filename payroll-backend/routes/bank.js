// backend/routes/bank.js
const express = require('express');
const bankController = require('../controller/bankController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Bank management
router.get('/banks', bankController.getAllBanks);
router.get('/banks/:id', bankController.getBankById);

// Payment batches
router.get('/payment-batches', bankController.getAllPaymentBatches);
router.post('/payment-batches', bankController.createPaymentBatch);
router.get('/payment-batches/:batchId', bankController.getPaymentBatchById);
router.put('/payment-batches/:batchId/cancel', bankController.cancelPaymentBatch);
router.post('/payment-batches/:batchId/retry-failed', bankController.retryFailedPayments);
router.post('/payment-batches/:batchId/generate-file', bankController.generatePaymentFile);
router.post('/payment-batches/:batchId/upload', bankController.simulateBankUpload);

// Payment transactions
router.get('/payment-batches/:batchId/transactions', bankController.getPaymentTransactions);
router.put('/payment-transactions/:transactionId', bankController.updatePaymentTransaction);

// Reports & Statistics
router.get('/payment-statistics/:period', bankController.getPaymentStatistics);
router.get('/reports/:period', bankController.getBankDisbursementReport);

// Validation & Utilities
router.post('/validate-account', bankController.validateBankAccount);
router.get('/supported-file-formats', bankController.getSupportedFileFormats);

module.exports = router;