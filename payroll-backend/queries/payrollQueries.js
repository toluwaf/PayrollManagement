const { ensureDBInitialized, getDB } = require('../helpers/databaseInit');

class PayrollQueries {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      this.db = await ensureDBInitialized();
      this.initialized = true;
    }
  }

  async findAll(filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { period, status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (period) {
      whereConditions.push('pr.period == @period');
      bindVars.period = period;
    }
    if (status) {
      whereConditions.push('pr.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR pr IN payroll_runs
      ${whereClause}
      SORT pr.processedAt DESC
      LIMIT @offset, @limit
      RETURN pr
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findById(payrollId, db) {
    const query = `
      FOR pr IN payroll_runs
      FILTER pr._key == @payrollId
      LET employeeDetails = (
        FOR edge IN payroll_employees
        FILTER edge._to == pr._id
        FOR emp IN employees
        FILTER emp._id == edge._from
        RETURN {
          employeeId: emp._key,
          name: emp.name,
          department: emp.department,
          position: emp.position,
          payrollData: edge
        }
      )
      RETURN MERGE(pr, { employees: employeeDetails })
    `;

    const result = await db.QueryFirst(query, { payrollId });
    return result || null;
  }

  async createPayrollRun(payrollData, db) {
    payrollData.createdAt = new Date().toISOString();
    payrollData.updatedAt = new Date().toISOString();
    
    return await db.AddDocument('payroll_runs', payrollData);
  }

  async addEmployeeToPayroll(payrollId, employeeId, payrollData, db) {
    const edgeDocument = {
      _from: `employees/${employeeId}`,
      _to: `payroll_runs/${payrollId}`,
      ...payrollData,
      linkedAt: new Date().toISOString()
    };

    return await db.AddDocument('payroll_employees', edgeDocument);
  }

  async getEmployeePayslip(employeeId, period, db) {
    const query = `
      FOR edge IN payroll_employees
      FILTER edge.employeeId == @employeeId AND edge.period == @period
      FOR pr IN payroll_runs
      FILTER pr._id == edge._to
      FOR emp IN employees
      FILTER emp._key == @employeeId
      RETURN {
        employee: {
          _key: emp._key,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department,
          position: emp.position,
          bankAccount: emp.bankAccount,
          bankName: emp.bankName
        },
        payrollRun: {
          _key: pr._key,
          period: pr.period,
          status: pr.status,
          processedAt: pr.processedAt
        },
        payrollData: edge
      }
    `;

    const result = await db.QueryFirst(query, { employeeId, period });
    return result || null;
  }

  async updatePayrollStatus(payrollId, status, updateData = {}, db) {
    const updateDoc = {
      status,
      updatedAt: new Date().toISOString(),
      ...updateData
    };

    return await db.UpdateDocument('payroll_runs', payrollId, updateDoc);
  }

  async getPayrollSummary(period, db) {
    const query = `
      FOR pr IN payroll_runs
      FILTER pr.period == @period
      LET employeeCount = LENGTH(
        FOR edge IN payroll_employees
        FILTER edge._to == pr._id
        RETURN 1
      )
      RETURN {
        period: pr.period,
        totalPayrollRuns: 1,
        totalEmployees: employeeCount,
        totalGross: pr.totalGross,
        totalDeductions: pr.totalDeductions,
        totalNet: pr.totalNet,
        status: pr.status,
        processedAt: pr.processedAt
      }
    `;

    const result = await db.QueryFirst(query, { period });
    return result || {
      period,
      totalPayrollRuns: 0,
      totalEmployees: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      status: 'no_data'
    };
  }

  async getPayrollByPeriod(period, db) {
    const query = `
      FOR pr IN payroll_runs
      FILTER pr.period == @period
      RETURN pr
    `;

    return await db.QueryAll(query, { period });
  }


  // Approval Workflow Queries
  async createApprovalWorkflow(workflowData, db) {
    return await db.AddDocument('approval_workflows', workflowData);
  }

  async getApprovalWorkflowById(workflowId, db) {
    const query = `
      FOR wf IN approval_workflows
      FILTER wf._key == @workflowId
      RETURN wf
    `;
    return await db.QueryFirst(query, { workflowId });
  }

  async getApprovalWorkflowByPayrollRun(payrollRunId, db) {
    const query = `
      FOR wf IN approval_workflows
      FILTER wf.payrollRunId == @payrollRunId
      RETURN wf
    `;
    return await db.QueryFirst(query, { payrollRunId });
  }

  async updateApprovalWorkflow(workflowId, updateData, db) {
    return await db.UpdateDocument('approval_workflows', workflowId, updateData);
  }

  async getPendingApprovalsForUser(userId, db) {
    const query = `
      FOR wf IN approval_workflows
      FILTER wf.status == 'pending'
      FOR step IN wf.steps
        FILTER step.step == wf.currentStep
        FILTER step.approverId == @userId
        FILTER step.status == 'pending'
        LET payrollRun = DOCUMENT('payroll_runs', wf.payrollRunId)
        RETURN {
          workflow: wf,
          currentStep: step,
          payrollRun: payrollRun
        }
    `;
    return await db.QueryAll(query, { userId });
  }

  async getApprovalWorkflows(filters = {}, db) {
    const { status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (status) {
      whereConditions.push('wf.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR wf IN approval_workflows
      ${whereClause}
      SORT wf.createdAt DESC
      LIMIT @offset, @limit
      LET payrollRun = DOCUMENT('payroll_runs', wf.payrollRunId)
      RETURN MERGE(wf, { payrollRunDetails: payrollRun })
    `;

    return await db.QueryAll(query, bindVars);
  }

  // Adjustments Queries
  async findAdjustments(filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { employeeId, type, status, period, startDate, endDate } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (employeeId) {
      whereConditions.push('adj.employeeId == @employeeId');
      bindVars.employeeId = employeeId;
    }
    if (type) {
      whereConditions.push('adj.type == @type');
      bindVars.type = type;
    }
    if (status) {
      whereConditions.push('adj.status == @status');
      bindVars.status = status;
    }
    if (period) {
      whereConditions.push('adj.effectiveDate LIKE @periodPattern');
      bindVars.periodPattern = `${period}%`;
    }
    if (startDate && endDate) {
      whereConditions.push('adj.effectiveDate >= @startDate AND adj.effectiveDate <= @endDate');
      bindVars.startDate = startDate;
      bindVars.endDate = endDate;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR adj IN payroll_adjustments
      ${whereClause}
      SORT adj.createdAt DESC
      LIMIT @offset, @limit
      LET employee = DOCUMENT('employees', adj.employeeId)
      RETURN MERGE(adj, {
        employeeName: employee.name,
        employeeDepartment: employee.department
      })
    `;

    const adjustments = await db.QueryAll(query, bindVars);

    // Get total count
    const countQuery = `
      FOR adj IN payroll_adjustments
      ${whereClause}
      COLLECT WITH COUNT INTO total
      RETURN total
    `;

    const totalCount = await db.QueryFirst(countQuery, bindVars);

    return {
      data: adjustments,
      totalCount
    };
  }

  async createAdjustment(adjustmentData, db) {
    return await db.AddDocument('payroll_adjustments', adjustmentData);
  }

  async getAdjustmentById(adjustmentId, db) {
    const query = `
      FOR adj IN payroll_adjustments
      FILTER adj._key == @adjustmentId
      LET employee = DOCUMENT('employees', adj.employeeId)
      RETURN MERGE(adj, {
        employeeName: employee.name,
        employeeDepartment: employee.department,
        employeePosition: employee.position
      })
    `;
    return await db.QueryFirst(query, { adjustmentId });
  }

  async updateAdjustment(adjustmentId, updateData, db) {
    return await db.UpdateDocument('payroll_adjustments', adjustmentId, updateData);
  }

  async deleteAdjustment(adjustmentId, db) {
    return await db.DeleteDocument('payroll_adjustments', adjustmentId);
  }

  async getAdjustmentTypes(db) {
    const query = `
      FOR adj IN payroll_adjustments
      COLLECT type = adj.type WITH COUNT INTO count
      RETURN {
        type: type,
        count: count
      }
    `;
    return await db.QueryAll(query);
  }

  async getAdjustmentsForPayroll(employeeIds, period, db) {
    const query = `
      FOR adj IN payroll_adjustments
      FILTER adj.employeeId IN @employeeIds
      FILTER adj.effectiveDate LIKE @periodPattern
      FILTER adj.status == 'approved'
      RETURN adj
    `;
    return await db.QueryAll(query, { 
      employeeIds, 
      periodPattern: `${period}%` 
    });
  }

  async findPayrollHistory(
    filters = {}, 
    pagination = { page: 1, limit: 20 }, 
    sortBy = 'processedAt', 
    sortOrder = 'DESC', 
    db
  ) {
    const { period, status, dateRange } = filters;

    // Safely handle pagination parameter
    let page = 1;
    let limit = 20;
    
    if (pagination && typeof pagination === 'object') {
      page = Math.max(1, parseInt(pagination.page) || 1);
      limit = Math.min(Math.max(1, parseInt(pagination.limit) || 20), 100);
    }
    
    const offset = (page - 1) * limit;

    try {
      // First, get the data
      let dataQuery = `
        FOR pr IN payroll_runs
      `;

      const dataBindVars = { offset, limit };

      // Build WHERE conditions dynamically
      const conditions = [];
      if (period) {
        conditions.push('pr.period == @period');
        dataBindVars.period = period;
      }
      if (status) {
        conditions.push('pr.status == @status');
        dataBindVars.status = status;
      }
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        conditions.push('pr.processedAt >= @startDate AND pr.processedAt <= @endDate');
        dataBindVars.startDate = dateRange.startDate;
        dataBindVars.endDate = dateRange.endDate;
      }

      if (conditions.length > 0) {
        dataQuery += ` FILTER ${conditions.join(' AND ')}`;
      }

      // Add sorting and pagination
      const validSortFields = ['processedAt', 'period', 'totalGross', 'totalNet', 'status'];
      const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'processedAt';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      dataQuery += `
        SORT pr.${safeSortBy} ${safeSortOrder}
        LIMIT @offset, @limit
        RETURN {
          _key: pr._key,
          period: pr.period,
          status: pr.status,
          totalEmployees: pr.totalEmployees,
          totalGross: pr.totalGross,
          totalDeductions: pr.totalDeductions,
          totalNet: pr.totalNet,
          processedBy: pr.processedBy,
          processedAt: pr.processedAt,
          approvedBy: pr.approvedBy,
          approvedAt: pr.approvedAt,
          breakdown: pr.breakdown
        }
      `;

      const payrollRuns = await db.QueryAll(dataQuery, dataBindVars);

      // Then, get the count with the same conditions
      let countQuery = `
        FOR pr IN payroll_runs
      `;

      const countBindVars = {};
      if (period) {
        countBindVars.period = period;
        countQuery += ` FILTER pr.period == @period`;
      }
      if (status) {
        countBindVars.status = status;
        countQuery += countBindVars.period ? ` AND pr.status == @status` : ` FILTER pr.status == @status`;
      }
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        countBindVars.startDate = dateRange.startDate;
        countBindVars.endDate = dateRange.endDate;
        const dateCondition = `pr.processedAt >= @startDate AND pr.processedAt <= @endDate`;
        countQuery += (countBindVars.period || countBindVars.status) ? ` AND ${dateCondition}` : ` FILTER ${dateCondition}`;
      }

      countQuery += `
        COLLECT WITH COUNT INTO total
        RETURN total
      `;

      const totalCount = await db.QueryFirst(countQuery, countBindVars);

      return {
        data: payrollRuns || [],
        totalCount: totalCount || 0,
        page: page || 1,
        limit: limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      };
      
    } catch (error) {
      console.error('Payroll history query failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async getPayrollHistorySummary(filters = {}, db) {
    const { period, status, dateRange } = filters;
    
    let whereConditions = [];
    let bindVars = {};

    if (period) {
      whereConditions.push('pr.period == @period');
      bindVars.period = period;
    }
    if (status) {
      whereConditions.push('pr.status == @status');
      bindVars.status = status;
    }
    if (dateRange) {
      whereConditions.push('pr.processedAt >= @startDate AND pr.processedAt <= @endDate');
      bindVars.startDate = dateRange.startDate;
      bindVars.endDate = dateRange.endDate;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR pr IN payroll_runs
      ${whereClause}
      COLLECT AGGREGATE 
        totalRuns = LENGTH(1),
        totalEmployees = SUM(pr.totalEmployees),
        totalGross = SUM(pr.totalGross),
        totalDeductions = SUM(pr.totalDeductions),
        totalNet = SUM(pr.totalNet),
        processedCount = SUM(pr.status == 'processed' ? 1 : 0),
        approvedCount = SUM(pr.status == 'approved' ? 1 : 0),
        paidCount = SUM(pr.status == 'paid' ? 1 : 0)
      RETURN {
        totalRuns,
        totalEmployees,
        totalGross,
        totalDeductions,
        totalNet,
        processedCount,
        approvedCount,
        paidCount,
        averageGross: totalRuns > 0 ? totalGross / totalRuns : 0,
        averageNet: totalRuns > 0 ? totalNet / totalRuns : 0
      }
    `;

    try {
      const result = await db.QueryFirst(query, bindVars);
      return result || {
        totalRuns: 0,
        totalEmployees: 0,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        processedCount: 0,
        approvedCount: 0,
        paidCount: 0,
        averageGross: 0,
        averageNet: 0
      };
    } catch (error) {
      console.error('Error in getPayrollHistorySummary:', error);
      return {
        totalRuns: 0,
        totalEmployees: 0,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        processedCount: 0,
        approvedCount: 0,
        paidCount: 0,
        averageGross: 0,
        averageNet: 0
      };
    }
  }

  async exportPayrollHistory(period, format, db) {
    let whereClause = '';
    let bindVars = {};
    
    if (period) {
      whereClause = 'FILTER pr.period == @period';
      bindVars.period = period;
    }

    const query = `
      FOR pr IN payroll_runs
      ${whereClause}
      SORT pr.processedAt DESC
      LET employeeDetails = (
        FOR edge IN payroll_employees
        FILTER edge._to == pr._id
        FOR emp IN employees
        FILTER emp._id == edge._from
        RETURN {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          grossSalary: edge.grossSalary,
          deductions: edge.totalDeductions,
          netSalary: edge.netSalary
        }
      )
      RETURN {
        payrollRun: {
          period: pr.period,
          status: pr.status,
          totalEmployees: pr.totalEmployees,
          totalGross: pr.totalGross,
          totalDeductions: pr.totalDeductions,
          totalNet: pr.totalNet,
          processedAt: pr.processedAt
        },
        employees: employeeDetails
      }
    `;

    const data = await db.QueryAll(query, bindVars);
    
    // Convert to CSV format
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }

  // Payroll Settings Queries
  async getPayrollSettings(db) {
    const query = `
      FOR settings IN payroll_settings
      LIMIT 1
      RETURN settings
    `;
    
    return await db.QueryFirst(query);
  }

  async upsertPayrollSettings(settings, db) {
    // Check if settings already exist
    const existing = await this.getPayrollSettings(db);
    
    if (existing) {
      // Update existing settings
      settings.updatedAt = new Date().toISOString();
      settings.updatedBy = 'system'; // In real app, use req.user.id
      return await db.UpdateDocument('payroll_settings', existing._key, settings);
    } else {
      // Create new settings
      settings._key = 'current_settings';
      settings.createdAt = new Date().toISOString();
      settings.createdBy = 'system';
      settings.updatedAt = new Date().toISOString();
      return await db.AddDocument('payroll_settings', settings);
    }
  }


  /**
   * Get PAYE settings from database
   */
  async getPAYESettings(db) {
    const query = `
      FOR settings IN paye_settings
      LIMIT 1
      RETURN settings
    `;
    
    return await db.QueryFirst(query);
  }

  /**
   * Create or update PAYE settings
   */
  async upsertPAYESettings(settings, db) {
    // Check if settings already exist
    const existing = await this.getPAYESettings(db);
    
    if (existing) {
      // Update existing settings
      settings.updatedAt = new Date().toISOString();
      return await db.UpdateDocument('paye_settings', existing._key, settings);
    } else {
      // Create new settings
      settings._key = 'current_paye_settings';
      settings.createdAt = new Date().toISOString();
      settings.updatedAt = new Date().toISOString();
      return await db.AddDocument('paye_settings', settings);
    }
  }
  
  convertToCSV(data) {
    const headers = 'Period,Status,Employee ID,Employee Name,Department,Gross Salary,Deductions,Net Salary,Processed Date\n';
    
    const rows = data.flatMap(run => 
      run.employees.map(emp => 
        `"${run.payrollRun.period}","${run.payrollRun.status}","${emp.employeeId}","${emp.name}","${emp.department}",${emp.grossSalary},${emp.deductions},${emp.netSalary},"${run.payrollRun.processedAt}"`
      )
    ).join('\n');
    
    return headers + rows;
  }
}

module.exports = new PayrollQueries();