// backend/queries/bankQueries.js
class BankQueries {
  // ========== BANK METHODS ==========
  
  async findAllBanks(filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (status) {
      whereConditions.push('b.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR b IN banks
      ${whereClause}
      SORT b.name ASC
      LIMIT @offset, @limit
      RETURN b
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findBankById(bankId, db) {
    const query = `
      FOR b IN banks
      FILTER b._key == @bankId
      RETURN b
    `;

    const result = await db.QueryFirst(query, { bankId });
    return result || null;
  }

  // ========== PAYMENT BATCH METHODS ==========

  async createPaymentBatch(batchData, db) {
    batchData._key = `batch_${Date.now().toString(36)}`;
    batchData.batchNumber = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    batchData.createdAt = new Date().toISOString();
    batchData.updatedAt = new Date().toISOString();
    
    return await db.AddDocument('payment_batches', batchData);
  }

  async findAllPaymentBatches(filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { status, period } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (status) {
      whereConditions.push('pb.status == @status');
      bindVars.status = status;
    }
    if (period) {
      whereConditions.push('pb.period == @period');
      bindVars.period = period;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR pb IN payment_batches
      ${whereClause}
      LET bank = DOCUMENT(CONCAT('banks/', pb.bankId))
      SORT pb.generatedAt DESC
      LIMIT @offset, @limit
      RETURN MERGE(pb, { bank: bank })
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findPaymentBatchById(batchId, db) {
    const query = `
      FOR pb IN payment_batches
      FILTER pb._key == @batchId
      RETURN pb
    `;

    const result = await db.QueryFirst(query, { batchId });
    return result || null;
  }

  async getPaymentBatchWithTransactions(batchId, db) {
    const query = `
      FOR pb IN payment_batches
      FILTER pb._key == @batchId
      LET transactions = (
        FOR pt IN payment_transactions
        FILTER pt.paymentBatchId == @batchId
        RETURN pt
      )
      LET bank = DOCUMENT(CONCAT('banks/', pb.bankId))
      RETURN MERGE(pb, { 
        transactions: transactions,
        bank: bank
      })
    `;

    const result = await db.QueryFirst(query, { batchId });
    return result || null;
  }

  async updatePaymentBatch(batchId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('payment_batches', batchId, updateData);
  }

  // ========== PAYMENT TRANSACTION METHODS ==========

  async createPaymentTransaction(transactionData, db) {
    transactionData._key = `txn_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    transactionData.createdAt = new Date().toISOString();
    
    return await db.AddDocument('payment_transactions', transactionData);
  }

  async findPaymentTransactionsByBatch(batchId, filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = ['pt.paymentBatchId == @batchId'];
    let bindVars = { batchId, offset, limit };

    if (status) {
      whereConditions.push('pt.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR pt IN payment_transactions
      ${whereClause}
      SORT pt.createdAt DESC
      LIMIT @offset, @limit
      RETURN pt
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findPaymentTransactionById(transactionId, db) {
    const query = `
      FOR pt IN payment_transactions
      FILTER pt._key == @transactionId
      RETURN pt
    `;

    const result = await db.QueryFirst(query, { transactionId });
    return result || null;
  }

  async updatePaymentTransaction(transactionId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('payment_transactions', transactionId, updateData);
  }

  async updatePaymentTransactionsStatus(batchId, status, db) {
    const query = `
      FOR pt IN payment_transactions
      FILTER pt.paymentBatchId == @batchId
      UPDATE pt WITH { status: @status, updatedAt: @updatedAt } IN payment_transactions
      RETURN NEW
    `;

    return await db.QueryAll(query, { 
      batchId, 
      status, 
      updatedAt: new Date().toISOString() 
    });
  }

  async getFailedTransactions(batchId, db) {
    const query = `
      FOR pt IN payment_transactions
      FILTER pt.paymentBatchId == @batchId AND pt.status == 'failed'
      RETURN pt
    `;

    return await db.QueryAll(query, { batchId });
  }

  async retryFailedTransactions(batchId, db) {
    const query = `
      FOR pt IN payment_transactions
      FILTER pt.paymentBatchId == @batchId AND pt.status == 'failed'
      UPDATE pt WITH { 
        status: 'pending',
        retryCount: (pt.retryCount || 0) + 1,
        lastRetryAt: @updatedAt,
        updatedAt: @updatedAt
      } IN payment_transactions
      RETURN NEW
    `;

    return await db.QueryAll(query, { 
      batchId, 
      updatedAt: new Date().toISOString() 
    });
  }

  // ========== BANK FILE METHODS ==========

  async createBankFile(fileData, db) {
    fileData._key = `file_${Date.now().toString(36)}`;
    fileData.createdAt = new Date().toISOString();
    
    return await db.AddDocument('bank_files', fileData);
  }

  // ========== STATISTICS & REPORTS ==========

  async getPaymentStatistics(period, db) {
    const query = `
      FOR pb IN payment_batches
      FILTER pb.period == @period
      COLLECT AGGREGATE 
        totalBatches = COUNT(pb),
        totalAmount = SUM(pb.totalAmount),
        totalEmployees = SUM(pb.employeeCount),
        completedBatches = COUNT(pb.status == 'completed' ? 1 : null),
        failedBatches = COUNT(pb.status == 'failed' ? 1 : null),
        cancelledBatches = COUNT(pb.status == 'cancelled' ? 1 : null)
      RETURN {
        period: @period,
        totalBatches: totalBatches,
        totalAmount: totalAmount,
        totalEmployees: totalEmployees,
        completedBatches: completedBatches,
        failedBatches: failedBatches,
        cancelledBatches: cancelledBatches,
        successRate: completedBatches / totalBatches * 100
      }
    `;

    const result = await db.QueryFirst(query, { period });
    return result || {
      period,
      totalBatches: 0,
      totalAmount: 0,
      totalEmployees: 0,
      completedBatches: 0,
      failedBatches: 0,
      cancelledBatches: 0,
      successRate: 0
    };
  }

  async generateBankDisbursementReport(period, bankId = null, db) {
    let filterConditions = ['pb.period == @period'];
    let bindVars = { period };

    if (bankId) {
      filterConditions.push('pb.bankId == @bankId');
      bindVars.bankId = bankId;
    }

    const filterClause = filterConditions.length > 0 ? `FILTER ${filterConditions.join(' AND ')}` : '';

    const query = `
      FOR pb IN payment_batches
      ${filterClause}
      LET bank = DOCUMENT(CONCAT('banks/', pb.bankId))
      LET transactions = (
        FOR pt IN payment_transactions
        FILTER pt.paymentBatchId == pb._key
        COLLECT status = pt.status
        WITH COUNT INTO count
        RETURN { status, count }
      )
      
      RETURN {
        batchId: pb._key,
        batchNumber: pb.batchNumber,
        bank: bank,
        period: pb.period,
        totalAmount: pb.totalAmount,
        employeeCount: pb.employeeCount,
        status: pb.status,
        generatedAt: pb.generatedAt,
        transactionsSummary: transactions
      }
    `;

    const batches = await db.QueryAll(query, bindVars);

    // Calculate summary
    const summary = {
      totalBatches: batches.length,
      totalAmount: batches.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      totalEmployees: batches.reduce((sum, b) => sum + (b.employeeCount || 0), 0),
      banks: [...new Set(batches.map(b => b.bank?.name))],
      statusDistribution: {}
    };

    // Calculate status distribution
    batches.forEach(batch => {
      summary.statusDistribution[batch.status] = (summary.statusDistribution[batch.status] || 0) + 1;
    });

    return {
      period,
      bankId,
      generatedAt: new Date().toISOString(),
      summary,
      batches
    };
  }
}

module.exports = new BankQueries();