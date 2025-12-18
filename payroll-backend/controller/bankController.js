// backend/controllers/bankController.js
const bankQueries = require('../queries/bankQueries');
const payrollQueries = require('../queries/payrollQueries');
const employeeQueries = require('../queries/employeeQueries');
const bankService = require('../services/bankService');
const ResponseHelper = require('../helpers/responseHelper');

class BankController {
  // ========== BANK MANAGEMENT ==========
  
  // Get all banks
  getAllBanks = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, status } = req.query;
      
      const banks = await bankQueries.findAllBanks(
        { status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, banks, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: banks.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch banks', 500, error.message);
    }
  };

  // Get bank by ID
  getBankById = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const bank = await bankQueries.findBankById(id, db);

      if (!bank) {
        return ResponseHelper.error(res, 'Bank not found', 404);
      }

      ResponseHelper.success(res, bank, 'Bank retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch bank', 500, error.message);
    }
  };

  // ========== PAYMENT BATCHES ==========
  
  // Get all payment batches
  getAllPaymentBatches = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, status, period } = req.query;
      
      const batches = await bankQueries.findAllPaymentBatches(
        { status, period },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, batches, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: batches.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payment batches', 500, error.message);
    }
  };

  // Create payment batch
  createPaymentBatch = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { payrollRunId, bankId, fileFormat = 'nibss' } = req.body;

      // Validate required fields
      if (!payrollRunId || !bankId) {
        return ResponseHelper.error(res, 'Payroll run ID and bank ID are required', 400);
      }

      // Get payroll run details
      const payrollRun = await payrollQueries.findById(payrollRunId, db);
      if (!payrollRun) {
        return ResponseHelper.error(res, 'Payroll run not found', 404);
      }

      // Get bank details
      const bank = await bankQueries.findBankById(bankId, db);
      if (!bank) {
        return ResponseHelper.error(res, 'Bank not found', 404);
      }

      // Get employee transactions for this payroll run
      const transactions = await this.getPayrollTransactions(payrollRunId, db);
      
      if (transactions.length === 0) {
        return ResponseHelper.error(res, 'No transactions found for payroll run', 400);
      }

      // Group transactions by bank and validate
      const bankTransactions = await this.validateAndGroupTransactions(transactions, bank.code, db);
      
      if (bankTransactions.length === 0) {
        return ResponseHelper.error(res, `No valid transactions found for bank ${bank.code}`, 400);
      }

      // Create payment batch
      const paymentBatch = await bankQueries.createPaymentBatch({
        payrollRunId,
        bankId,
        period: payrollRun.period,
        totalAmount: bankTransactions.reduce((sum, t) => sum + t.amount, 0),
        employeeCount: bankTransactions.length,
        fileFormat,
        status: 'generated',
        generatedBy: req.user?.id || 'system',
        generatedAt: new Date().toISOString()
      }, db);

      // Create payment transactions
      for (const transaction of bankTransactions) {
        await bankQueries.createPaymentTransaction({
          paymentBatchId: paymentBatch._key,
          employeeId: transaction.employeeId,
          employeeName: transaction.employeeName,
          bankAccount: transaction.bankAccount,
          amount: transaction.amount,
          reference: `PAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
          status: 'pending'
        }, db);
      }

      ResponseHelper.success(res, {
        paymentBatch,
        summary: {
          totalTransactions: bankTransactions.length,
          totalAmount: paymentBatch.totalAmount,
          bank: bank.name,
          fileFormat
        }
      }, 'Payment batch created successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Failed to create payment batch', 500, error.message);
    }
  };

  // Get payment batch by ID
  getPaymentBatchById = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;

      const paymentBatch = await bankQueries.getPaymentBatchWithTransactions(batchId, db);
      if (!paymentBatch) {
        return ResponseHelper.error(res, 'Payment batch not found', 404);
      }

      ResponseHelper.success(res, {
        paymentBatch,
        statusInfo: this.getStatusInfo(paymentBatch.status)
      }, 'Payment batch retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payment batch', 500, error.message);
    }
  };

  // Cancel payment batch
  cancelPaymentBatch = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;

      const paymentBatch = await bankQueries.findPaymentBatchById(batchId, db);
      if (!paymentBatch) {
        return ResponseHelper.error(res, 'Payment batch not found', 404);
      }

      // Check if batch can be cancelled
      if (!['generated', 'file_generated'].includes(paymentBatch.status)) {
        return ResponseHelper.error(res, 'Cannot cancel batch in current status', 400);
      }

      const updatedBatch = await bankQueries.updatePaymentBatch(batchId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: req.user?.id
      }, db);

      // Update all transactions to cancelled
      await bankQueries.updatePaymentTransactionsStatus(batchId, 'cancelled', db);

      ResponseHelper.success(res, updatedBatch, 'Payment batch cancelled successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to cancel payment batch', 500, error.message);
    }
  };

  // Retry failed payments
  retryFailedPayments = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;

      const paymentBatch = await bankQueries.findPaymentBatchById(batchId, db);
      if (!paymentBatch) {
        return ResponseHelper.error(res, 'Payment batch not found', 404);
      }

      if (paymentBatch.status !== 'failed') {
        return ResponseHelper.error(res, 'Can only retry failed batches', 400);
      }

      // Get failed transactions
      const failedTransactions = await bankQueries.getFailedTransactions(batchId, db);
      
      if (failedTransactions.length === 0) {
        return ResponseHelper.error(res, 'No failed transactions found', 400);
      }

      // Reset failed transactions to pending
      await bankQueries.retryFailedTransactions(batchId, db);

      // Update batch status
      const updatedBatch = await bankQueries.updatePaymentBatch(batchId, {
        status: 'processing',
        retryCount: (paymentBatch.retryCount || 0) + 1,
        lastRetryAt: new Date().toISOString()
      }, db);

      ResponseHelper.success(res, {
        batch: updatedBatch,
        retriedTransactions: failedTransactions.length
      }, 'Failed payments retried successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to retry payments', 500, error.message);
    }
  };

  // Generate payment file
  generatePaymentFile = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;
      const { format = 'nibss' } = req.body;

      // Get payment batch with transactions
      const paymentBatch = await bankQueries.getPaymentBatchWithTransactions(batchId, db);
      if (!paymentBatch) {
        return ResponseHelper.error(res, 'Payment batch not found', 404);
      }

      // Get bank details
      const bank = await bankQueries.findBankById(paymentBatch.bankId, db);
      if (!bank) {
        return ResponseHelper.error(res, 'Bank not found', 404);
      }

      // Prepare transactions for file generation
      const transactions = paymentBatch.transactions.map(t => ({
        employeeId: t.employeeId,
        employeeName: t.employeeName,
        bankAccount: t.bankAccount,
        amount: t.amount,
        reference: t.reference
      }));

      // Generate payment file
      const fileData = bankService.generatePaymentFile(transactions, bank.code, format);

      // Save bank file record
      const bankFile = await bankQueries.createBankFile({
        paymentBatchId: batchId,
        fileName: fileData.fileName,
        fileFormat: format,
        fileSize: fileData.content.length,
        recordCount: fileData.recordCount,
        totalAmount: fileData.totalAmount,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user?.id || 'system'
      }, db);

      // Update payment batch status
      await bankQueries.updatePaymentBatch(batchId, {
        status: 'file_generated',
        fileGeneratedAt: new Date().toISOString()
      }, db);

      ResponseHelper.success(res, {
        bankFile,
        fileData: {
          fileName: fileData.fileName,
          format: fileData.format,
          recordCount: fileData.recordCount,
          totalAmount: fileData.totalAmount,
          content: fileData.content
        }
      }, 'Payment file generated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate payment file', 500, error.message);
    }
  };

  // Simulate bank upload
  simulateBankUpload = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;

      const paymentBatch = await bankQueries.findPaymentBatchById(batchId, db);
      if (!paymentBatch) {
        return ResponseHelper.error(res, 'Payment batch not found', 404);
      }

      const bank = await bankQueries.findBankById(paymentBatch.bankId, db);
      if (!bank) {
        return ResponseHelper.error(res, 'Bank not found', 404);
      }

      // Simulate bank API upload
      const uploadResult = await bankService.simulateBankUpload(bank.code, '', paymentBatch.fileFormat);

      if (uploadResult.success) {
        // Update batch status
        const updatedBatch = await bankQueries.updatePaymentBatch(batchId, {
          status: 'uploaded',
          uploadedAt: new Date().toISOString(),
          uploadReference: uploadResult.reference,
          uploadedBy: req.user?.id
        }, db);

        // Update transaction statuses
        await bankQueries.updatePaymentTransactionsStatus(batchId, 'processing', db);

        ResponseHelper.success(res, {
          paymentBatch: updatedBatch,
          uploadResult
        }, 'Payment file uploaded to bank successfully');
      } else {
        ResponseHelper.error(res, `Bank upload failed: ${uploadResult.message}`, 400);
      }

    } catch (error) {
      ResponseHelper.error(res, 'Failed to upload payment file', 500, error.message);
    }
  };

  // ========== PAYMENT TRANSACTIONS ==========

  // Get payment transactions for a batch
  getPaymentTransactions = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { batchId } = req.params;
      const { page = 1, limit = 50, status } = req.query;

      const transactions = await bankQueries.findPaymentTransactionsByBatch(
        batchId, 
        { status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, transactions, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length
      });

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payment transactions', 500, error.message);
    }
  };

  // Update payment transaction
  updatePaymentTransaction = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { transactionId } = req.params;
      const updateData = req.body;

      const transaction = await bankQueries.findPaymentTransactionById(transactionId, db);
      if (!transaction) {
        return ResponseHelper.error(res, 'Payment transaction not found', 404);
      }

      const updatedTransaction = await bankQueries.updatePaymentTransaction(
        transactionId, 
        updateData, 
        db
      );

      ResponseHelper.success(res, updatedTransaction, 'Payment transaction updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to update payment transaction', 500, error.message);
    }
  };

  // ========== REPORTS & STATISTICS ==========

  // Get payment statistics
  getPaymentStatistics = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period } = req.params;

      const statistics = await bankQueries.getPaymentStatistics(period, db);

      ResponseHelper.success(res, statistics, 'Payment statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payment statistics', 500, error.message);
    }
  };

  // Get bank disbursement report
  getBankDisbursementReport = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period } = req.params;
      const { bankId } = req.query;

      const report = await bankQueries.generateBankDisbursementReport(period, bankId, db);

      ResponseHelper.success(res, report, 'Bank disbursement report generated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate disbursement report', 500, error.message);
    }
  };

  // ========== VALIDATION & UTILITIES ==========

  // Validate bank account
  validateBankAccount = async (req, res) => {
    try {
      const { accountNumber, bankCode } = req.body;

      if (!accountNumber || !bankCode) {
        return ResponseHelper.error(res, 'Account number and bank code are required', 400);
      }

      const validation = bankService.validateBankAccount(accountNumber, bankCode);

      ResponseHelper.success(res, validation, 'Bank account validation completed');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to validate bank account', 500, error.message);
    }
  };

  // Get supported file formats
  getSupportedFileFormats = async (req, res) => {
    try {
      const formats = await bankService.getSupportedFileFormats();
      
      ResponseHelper.success(res, formats, 'Supported file formats retrieved');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch supported formats', 500, error.message);
    }
  };

  // ========== HELPER METHODS ==========

  getPayrollTransactions = async (payrollRunId, db) => {
    const query = `
      FOR edge IN payroll_employees
      FILTER edge._to == CONCAT('payroll_runs/', @payrollRunId)
      FOR emp IN employees
      FILTER emp._id == edge._from
      RETURN {
        employeeId: emp._key,
        employeeName: emp.name,
        bankAccount: emp.bankAccount,
        bankName: emp.bankName,
        amount: edge.netSalary,
        department: emp.department
      }
    `;

    return await db.QueryAll(query, { payrollRunId });
  };

  validateAndGroupTransactions = async (transactions, bankCode, db) => {
    const validTransactions = [];
    
    for (const transaction of transactions) {
      // Simple bank matching (in reality, you'd have bank codes for each employee)
      if (transaction.bankName && transaction.bankName.toLowerCase().includes(bankCode.toLowerCase())) {
        const validation = bankService.validateBankAccount(transaction.bankAccount, bankCode);
        
        if (validation.valid) {
          validTransactions.push(transaction);
        } else {
          console.warn(`Invalid account for ${transaction.employeeName}: ${validation.error}`);
        }
      }
    }
    
    return validTransactions;
  };

  getStatusInfo = (status) => {
    const statusMap = {
      'generated': { 
        label: 'Generated', 
        color: 'blue', 
        description: 'Payment batch has been created',
        nextAction: 'Generate File'
      },
      'file_generated': { 
        label: 'File Ready', 
        color: 'orange', 
        description: 'Payment file is ready for bank upload',
        nextAction: 'Upload to Bank'
      },
      'uploaded': { 
        label: 'Uploaded', 
        color: 'purple', 
        description: 'File has been uploaded to bank for processing',
        nextAction: 'Check Status'
      },
      'processing': { 
        label: 'Processing', 
        color: 'yellow', 
        description: 'Bank is processing the payments',
        nextAction: 'Check Status'
      },
      'completed': { 
        label: 'Completed', 
        color: 'green', 
        description: 'All payments have been processed successfully',
        nextAction: 'Download Report'
      },
      'failed': { 
        label: 'Failed', 
        color: 'red', 
        description: 'Some payments failed during processing',
        nextAction: 'Review Failed Payments'
      },
      'cancelled': { 
        label: 'Cancelled', 
        color: 'gray', 
        description: 'Batch was cancelled',
        nextAction: 'Create New Batch'
      }
    };
    
    return statusMap[status] || { label: status, color: 'gray', description: 'Unknown status' };
  };
}

module.exports = new BankController();