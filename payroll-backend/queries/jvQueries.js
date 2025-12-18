// backend/queries/jvQueries.js
class JVQueries {
  // ========== JV PARTNER METHODS ==========
  
  async findAllPartners(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { status, type } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (status) {
      whereConditions.push('p.status == @status');
      bindVars.status = status;
    }
    if (type) {
      whereConditions.push('p.type == @type');
      bindVars.type = type;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR p IN jv_partners
      ${whereClause}
      SORT p.name ASC
      LIMIT @offset, @limit
      RETURN p
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findPartnerById(partnerId, db) {
    const query = `
      FOR p IN jv_partners
      FILTER p._key == @partnerId
      RETURN p
    `;

    const result = await db.QueryFirst(query, { partnerId });
    return result || null;
  }

  // ========== JV AGREEMENT METHODS ==========

  async findAllAgreements(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (status) {
      whereConditions.push('a.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR a IN jv_agreements
      ${whereClause}
      SORT a.effectiveDate DESC
      LIMIT @offset, @limit
      RETURN a
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findAgreementWithPartners(agreementId, db) {
    const query = `
      FOR a IN jv_agreements
      FILTER a._key == @agreementId
      LET partners = (
        FOR edge IN agreement_partners
        FILTER edge._from == CONCAT('jv_agreements/', @agreementId)
        FOR p IN jv_partners
        FILTER p._id == edge._to
        RETURN p
      )
      RETURN MERGE(a, { partners: partners })
    `;

    const result = await db.QueryFirst(query, { agreementId });
    return result || null;
  }

  // ========== ALLOCATION RULE METHODS ==========

  async findAllocationRules(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { agreementId, partnerId, status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (agreementId) {
      whereConditions.push('r.agreementId == @agreementId');
      bindVars.agreementId = agreementId;
    }
    if (partnerId) {
      whereConditions.push('r.partnerId == @partnerId');
      bindVars.partnerId = partnerId;
    }
    if (status) {
      whereConditions.push('r.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR r IN allocation_rules
      ${whereClause}
      LET agreement = DOCUMENT(CONCAT('jv_agreements/', r.agreementId))
      LET partner = DOCUMENT(CONCAT('jv_partners/', r.partnerId))
      SORT r.department ASC, r.effectiveDate DESC
      LIMIT @offset, @limit
      RETURN MERGE(r, { 
        agreement: agreement,
        partner: partner 
      })
    `;

    return await db.QueryAll(query, bindVars);
  }

  // ========== ALLOCATION CALCULATION METHODS ==========

  async calculateJVAllocations(payrollRunId, db) {
    // Get payroll data with employee departments
    const payrollData = await db.QueryAll(`
      FOR edge IN payroll_employees
      FILTER edge._to == CONCAT('payroll_runs/', @payrollRunId)
      FOR emp IN employees
      FILTER emp._id == edge._from
      LET department = DOCUMENT(CONCAT('departments/', emp.department))
      RETURN {
        employeeId: emp._key,
        employeeName: emp.name,
        department: department.name,
        grossSalary: edge.grossSalary,
        netSalary: edge.netSalary,
        basicSalary: edge.basicSalary,
        allowances: edge.allowances
      }
    `, { payrollRunId });

    // Get active allocation rules
    const allocationRules = await db.QueryAll(`
      FOR r IN allocation_rules
      FILTER r.status == 'active'
      LET partner = DOCUMENT(CONCAT('jv_partners/', r.partnerId))
      LET agreement = DOCUMENT(CONCAT('jv_agreements/', r.agreementId))
      RETURN MERGE(r, { partner: partner, agreement: agreement })
    `);

    // Calculate allocations by department and partner
    const allocations = [];
    const departmentTotals = {};

    // Group payroll data by department
    payrollData.forEach(employee => {
      if (!departmentTotals[employee.department]) {
        departmentTotals[employee.department] = {
          totalGross: 0,
          totalNet: 0,
          employeeCount: 0
        };
      }
      departmentTotals[employee.department].totalGross += employee.grossSalary;
      departmentTotals[employee.department].totalNet += employee.netSalary;
      departmentTotals[employee.department].employeeCount++;
    });

    // Apply allocation rules
    allocationRules.forEach(rule => {
      const deptTotal = departmentTotals[rule.department];
      if (deptTotal) {
        const allocatedAmount = deptTotal.totalGross * (rule.allocationPercentage / 100);
        
        allocations.push({
          _key: `alloc_${Date.now()}_${rule.partnerId}`,
          payrollRunId,
          agreementId: rule.agreementId,
          partnerId: rule.partnerId,
          department: rule.department,
          allocationPercentage: rule.allocationPercentage,
          allocatedAmount,
          costCenter: rule.costCenter,
          employeeCount: deptTotal.employeeCount,
          calculatedAt: new Date().toISOString(),
          partner: rule.partner,
          agreement: rule.agreement
        });
      }
    });

    // Save allocations to database
    for (const allocation of allocations) {
      await db.AddDocument('jv_allocations', allocation);
    }

    return allocations;
  }

  async getAllocationResults(payrollRunId, db) {
    const query = `
      FOR alloc IN jv_allocations
      FILTER alloc.payrollRunId == @payrollRunId
      LET partner = DOCUMENT(CONCAT('jv_partners/', alloc.partnerId))
      LET agreement = DOCUMENT(CONCAT('jv_agreements/', alloc.agreementId))
      COLLECT partnerId = alloc.partnerId
      AGGREGATE totalAmount = SUM(alloc.allocatedAmount)
      LET partnerDetails = FIRST(
        FOR p IN jv_partners
        FILTER p._key == partnerId
        RETURN p
      )
      RETURN {
        partner: partnerDetails,
        totalAmount: totalAmount,
        allocations: (
          FOR a IN jv_allocations
          FILTER a.partnerId == partnerId AND a.payrollRunId == @payrollRunId
          RETURN a
        )
      }
    `;

    return await db.QueryAll(query, { payrollRunId });
  }

  // ========== REPORT METHODS ==========

  async generateAllocationReport(period, filters = {}, db) {
    const { partnerId, agreementId } = filters;

    let filterConditions = ['alloc.payrollRunId LIKE CONCAT("%", @period, "%")'];
    let bindVars = { period };

    if (partnerId) {
      filterConditions.push('alloc.partnerId == @partnerId');
      bindVars.partnerId = partnerId;
    }
    if (agreementId) {
      filterConditions.push('alloc.agreementId == @agreementId');
      bindVars.agreementId = agreementId;
    }

    const filterClause = filterConditions.length > 0 ? `FILTER ${filterConditions.join(' AND ')}` : '';

    const query = `
      FOR alloc IN jv_allocations
      ${filterClause}
      LET partner = DOCUMENT(CONCAT('jv_partners/', alloc.partnerId))
      LET agreement = DOCUMENT(CONCAT('jv_agreements/', alloc.agreementId))
      LET payrollRun = DOCUMENT(CONCAT('payroll_runs/', alloc.payrollRunId))
      SORT alloc.partnerId, alloc.department
      RETURN {
        allocation: alloc,
        partner: partner,
        agreement: agreement,
        payrollRun: payrollRun
      }
    `;

    const allocations = await db.QueryAll(query, bindVars);

    // Generate summary
    const summary = {
      period,
      totalAllocated: allocations.reduce((sum, item) => sum + item.allocation.allocatedAmount, 0),
      partnerCount: new Set(allocations.map(item => item.partner._key)).size,
      agreementCount: new Set(allocations.map(item => item.agreement._key)).size,
      departmentCount: new Set(allocations.map(item => item.allocation.department)).size
    };

    return {
      period,
      generatedAt: new Date().toISOString(),
      summary,
      allocations
    };
  }

  async getAllocationStatistics(period, db) {
    const query = `
      FOR alloc IN jv_allocations
      FILTER alloc.payrollRunId LIKE CONCAT("%", @period, "%")
      COLLECT 
        partnerId = alloc.partnerId,
        agreementId = alloc.agreementId
      AGGREGATE 
        totalAmount = SUM(alloc.allocatedAmount),
        departmentCount = COUNT_DISTINCT(alloc.department),
        allocationCount = COUNT(alloc)
      LET partner = DOCUMENT(CONCAT('jv_partners/', partnerId))
      LET agreement = DOCUMENT(CONCAT('jv_agreements/', agreementId))
      RETURN {
        partner: partner,
        agreement: agreement,
        totalAmount: totalAmount,
        departmentCount: departmentCount,
        allocationCount: allocationCount
      }
    `;

    const statistics = await db.QueryAll(query, { period });

    const summary = {
      period,
      totalAllocated: statistics.reduce((sum, stat) => sum + stat.totalAmount, 0),
      totalPartners: new Set(statistics.map(stat => stat.partner._key)).size,
      totalAgreements: new Set(statistics.map(stat => stat.agreement._key)).size,
      averageAllocation: statistics.reduce((sum, stat) => sum + stat.totalAmount, 0) / statistics.length
    };

    return {
      summary,
      partnerBreakdown: statistics
    };
  }

  // ========== VALIDATION METHODS ==========

  async validateAllocationRules(agreementId, db) {
    const rules = await db.QueryAll(`
      FOR r IN allocation_rules
      FILTER r.agreementId == @agreementId AND r.status == 'active'
      COLLECT department = r.department
      AGGREGATE totalPercentage = SUM(r.allocationPercentage)
      RETURN {
        department: department,
        totalPercentage: totalPercentage,
        isValid: totalPercentage == 100
      }
    `, { agreementId });

    const validation = {
      agreementId,
      isValid: rules.every(rule => rule.isValid),
      rules: rules,
      issues: rules.filter(rule => !rule.isValid).map(rule => ({
        department: rule.department,
        totalPercentage: rule.totalPercentage,
        message: `Department ${rule.department} has ${rule.totalPercentage}% allocation (should be 100%)`
      }))
    };

    return validation;
  }
}

module.exports = new JVQueries();