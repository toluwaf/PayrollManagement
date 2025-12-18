class ReportsQueries {
  async getPayrollSummary({ startDate, endDate, department }, db) {
    let whereConditions = [];
    let bindVars = {};

    if (startDate && endDate) {
      whereConditions.push('pr.period >= @startDate AND pr.period <= @endDate');
      bindVars.startDate = startDate;
      bindVars.endDate = endDate;
    }

    if (department) {
      whereConditions.push('emp.department == @department');
      bindVars.department = department;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR pr IN payroll_runs
      ${whereClause}
      LET employeeStats = (
        FOR edge IN payroll_employees
        FILTER edge._to == pr._id
        FOR emp IN employees
        FILTER emp._id == edge._from
        ${department ? 'FILTER emp.department == @department' : ''}
        RETURN {
          employeeId: emp._key,
          department: emp.department,
          grossSalary: edge.grossSalary,
          deductions: edge.totalDeductions,
          netSalary: edge.netSalary
        }
      )
      RETURN {
        period: pr.period,
        totalEmployees: LENGTH(employeeStats),
        totalGross: pr.totalGross,
        totalDeductions: pr.totalDeductions,
        totalNet: pr.totalNet,
        averageSalary: pr.totalGross / LENGTH(employeeStats),
        departmentBreakdown: (
          FOR emp IN employeeStats
          COLLECT dept = emp.department
          AGGREGATE total = SUM(emp.grossSalary), count = COUNT(emp.employeeId)
          RETURN { department: dept, totalSalary: total, employeeCount: count }
        )
      }
    `;

    return await db.QueryAll(query, bindVars);
  }

  async getDepartmentBreakdown(period, db) {
    const query = `
      FOR edge IN payroll_employees
      FILTER edge.period == @period
      FOR emp IN employees
      FILTER emp._id == edge._from
      COLLECT department = emp.department
      AGGREGATE 
        totalGross = SUM(edge.grossSalary),
        totalDeductions = SUM(edge.totalDeductions),
        totalNet = SUM(edge.netSalary),
        employeeCount = COUNT(emp._key),
        avgSalary = AVG(edge.grossSalary)
      RETURN {
        department: department,
        totalGross: totalGross,
        totalDeductions: totalDeductions,
        totalNet: totalNet,
        employeeCount: employeeCount,
        averageSalary: avgSalary,
        percentage: (totalGross / (
          FOR e2 IN payroll_employees
          FILTER e2.period == @period
          RETURN e2.grossSalary
        )) * 100
      }
    `;

    return await db.QueryAll(query, { period });
  }

  async getDeductionAnalysis(period, type = null, db) {
    let filter = 'd.period == @period';
    let bindVars = { period };

    if (type) {
      filter += ' AND d.type == @type';
      bindVars.type = type;
    }

    const query = `
      FOR d IN deductions
      FILTER ${filter}
      COLLECT deductionType = d.type
      AGGREGATE 
        totalAmount = SUM(d.total),
        averageAmount = AVG(d.total),
        recordCount = COUNT(d._key)
      RETURN {
        deductionType: deductionType,
        totalAmount: totalAmount,
        averageAmount: averageAmount,
        recordCount: recordCount
      }
    `;

    return await db.QueryAll(query, bindVars);
  }

  async getComplianceStatus(period, db) {
    const query = `
      FOR d IN deductions
      FILTER d.period == @period AND d.type == 'batch'
      RETURN {
        period: d.period,
        status: d.status,
        totalEmployees: d.totalEmployees,
        totals: d.totals,
        remittedAt: d.remittedAt,
        remittanceReference: d.remittanceReference
      }
    `;

    const results = await db.QueryAll(query, { period });
    
    // Calculate compliance score
    const totalBatches = results.length;
    const completedBatches = results.filter(b => b.status === 'remitted').length;
    const complianceScore = totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0;

    return {
      period,
      complianceScore: Math.round(complianceScore),
      totalBatches,
      completedBatches,
      pendingBatches: totalBatches - completedBatches,
      batches: results
    };
  }

  async exportReportData(reportType, filters, db) {
    switch (reportType) {
      case 'payroll':
        return await this.getPayrollSummary(filters, db);
      case 'deductions':
        return await this.getDeductionAnalysis(filters.period, filters.type, db);
      case 'compliance':
        return await this.getComplianceStatus(filters.period, db);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  async getDashboardMetrics(db) {
    // Get total employees
    const totalEmployeesQuery = `RETURN LENGTH(employees)`;
    const totalEmployees = await this.db.QueryFirst(totalEmployeesQuery);

    // Get active payroll runs
    const activePayrollQuery = `
      FOR pr IN payroll_runs
      FILTER pr.status IN ['processed', 'pending_approval']
      COLLECT WITH COUNT INTO count
      RETURN count
    `;
    const activePayrolls = await db.QueryFirst(activePayrollQuery);

    // Get total payroll this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyPayrollQuery = `
      FOR pr IN payroll_runs
      FILTER pr.period == @period
      RETURN pr.totalNet
    `;
    const monthlyPayrollResults = await db.QueryAll(monthlyPayrollQuery, { period: currentMonth });
    const monthlyPayroll = monthlyPayrollResults.reduce((sum, amount) => sum + amount, 0);

    // Get pending approvals
    const pendingQuery = `
      FOR pr IN payroll_runs
      FILTER pr.status == 'pending_approval'
      COLLECT WITH COUNT INTO count
      RETURN count
    `;
    const pendingApprovals = await db.QueryFirst(pendingQuery);

    return {
      totalEmployees: totalEmployees || 0,
      activePayrolls: activePayrolls || 0,
      monthlyPayroll: monthlyPayroll || 0,
      pendingApprovals: pendingApprovals || 0
    };
  }
}

module.exports = new ReportsQueries();