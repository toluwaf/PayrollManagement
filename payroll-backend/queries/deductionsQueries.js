class DeductionsQueries {
  async findAll(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { period, type, status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (period) {
      whereConditions.push('d.period == @period');
      bindVars.period = period;
    }
    if (type) {
      whereConditions.push('d.type == @type');
      bindVars.type = type;
    }
    if (status) {
      whereConditions.push('d.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR d IN deductions
      ${whereClause}
      SORT d.calculatedAt DESC
      LIMIT @offset, @limit
      RETURN d
    `;

    return await db.QueryAll(query, bindVars);
  }

  async findById(deductionId, db) {
    const query = `
      FOR d IN deductions
      FILTER d._key == @deductionId
      RETURN d
    `;

    const result = await db.QueryFirst(query, { deductionId });
    return result || null;
  }

  async createDeductionBatch(batchData, db) {
    batchData._key = `batch_${Date.now()}`;
    batchData.type = 'batch';
    batchData.status = 'calculated';
    batchData.createdAt = new Date().toISOString();
    batchData.updatedAt = new Date().toISOString();
    
    return await db.AddDocument('deductions', batchData);
  }

  async createEmployeeDeduction(deductionData, db) {
    deductionData._key = `ded_${Date.now()}_${deductionData.employeeId}`;
    deductionData.type = 'employee';
    deductionData.status = 'calculated';
    deductionData.createdAt = new Date().toISOString();
    
    return await db.AddDocument('deductions', deductionData);
  }

  async updateDeductionBatch(batchId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('deductions', batchId, updateData);
  }

  async getDeductionSummary(period, db) {
    const query = `
      LET filtered = (
        FOR d IN deductions
          FILTER d.period == @period AND d.type == "employee"
          RETURN d
      )

      LET employeeIds = (
        FOR d IN filtered
          COLLECT empId = d.employeeId
          RETURN empId
      )

      LET totals = (
        FOR d IN filtered
          COLLECT AGGREGATE
            totalPAYE = SUM(d.paye),
            totalEmployeePension = SUM(d.pension),
            totalEmployerPension = SUM(d.employerPension),
            totalNHF = SUM(d.nhf),
            totalNSITF = SUM(d.nsitf),
            totalITF = SUM(d.itf),
            totalEmployeeDeductions = SUM(d.totalEmployeeDeductions),
            totalEmployerContributions = SUM(d.totalEmployerContributions)
          RETURN {
            totalPAYE,
            totalEmployeePension,
            totalEmployerPension,
            totalNHF,
            totalNSITF,
            totalITF,
            totalEmployeeDeductions,
            totalEmployerContributions
          }
      )

      RETURN MERGE(totals[0], {
        period: @period,
        employeeCount: LENGTH(employeeIds),
        itfApplies: LENGTH(employeeIds) >= 5
      })

    `;

    const result = await db.QueryFirst(query, { period });
    
    // If no results found, return default structure
    if (!result) {
      return {
        period,
        totalPAYE: 0,
        totalEmployeePension: 0,
        totalEmployerPension: 0,
        totalNHF: 0,
        totalNSITF: 0,
        totalITF: 0,
        totalEmployeeDeductions: 0,
        totalEmployerContributions: 0,
        employeeCount: 0,
        itfApplies: false
      };
    }

    return result;
  }


  async generateComplianceReport(period, reportType, db) {
    let query = '';
    
    switch (reportType) {
      case 'paye':
        query = `
          FOR d IN deductions
          FILTER d.period == @period AND d.type == 'employee'
          RETURN {
            employeeId: d.employeeId,
            employeeName: d.employeeName,
            employeeCode: d.employeeCode,
            department: d.department,
            grossEmolument: d.grossEmolument,
            paye: d.paye,
            pension: d.pension,
            nhf: d.nhf,
            totalDeductions: d.totalEmployeeDeductions,
            netSalary: d.netSalary
          }
        `;
        break;
      
      case 'pension':
        query = `
          FOR d IN deductions
          FILTER d.period == @period AND d.type == 'employee'
          RETURN {
            employeeId: d.employeeId,
            employeeName: d.employeeName,
            employeeCode: d.employeeCode,
            grossEmolument: d.grossEmolument,
            employeePension: d.pension,
            employerPension: d.employerPension,
            totalPensionContribution: d.pension + d.employerPension,
            pensionFundAdministrator: d.pensionFundAdministrator || 'Not Specified'
          }
        `;
        break;
      
      case 'nhf':
        query = `
          FOR d IN deductions
          FILTER d.period == @period AND d.type == 'employee'
          RETURN {
            employeeId: d.employeeId,
            employeeName: d.employeeName,
            employeeCode: d.employeeCode,
            basicSalary: d.grossEmolument, // NHF is typically on basic salary
            nhf: d.nhf,
            nhfNumber: d.nhfNumber || 'Not Registered'
          }
        `;
        break;

      case 'employer_contributions':
        query = `
          FOR d IN deductions
          FILTER d.period == @period AND d.type == 'employee'
          COLLECT 
            AGGREGATE 
              totalEmployerPension = SUM(d.employerPension),
              totalNSITF = SUM(d.nsitf),
              totalITF = SUM(d.itf)
          RETURN {
            period: @period,
            employerContributions: {
              pension: totalEmployerPension || 0,
              nsitf: totalNSITF || 0,
              itf: totalITF || 0,
              total: (totalEmployerPension || 0) + (totalNSITF || 0) + (totalITF || 0)
            }
          }
        `;
        break;
      
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    const results = await db.QueryAll(query, { period });
    
    return {
      reportType,
      period,
      generatedAt: new Date().toISOString(),
      data: results,
      summary: {
        totalRecords: results.length,
        // Calculate total amount based on report type
        totalAmount: results.reduce((sum, item) => {
          switch (reportType) {
            case 'paye':
              return sum + (item.paye || 0);
            case 'pension':
              return sum + (item.totalPensionContribution || 0);
            case 'nhf':
              return sum + (item.nhf || 0);
            case 'employer_contributions':
              return sum + (item.employerContributions?.total || 0);
            default:
              return sum;
          }
        }, 0)
      }
    };
  }

  async getEmployeeDeductions(employeeId, period, db) {
    const query = `
      FOR d IN deductions
      FILTER d.employeeId == @employeeId AND d.period == @period AND d.type == 'employee'
      RETURN d
    `;

    return await db.QueryAll(query, { employeeId, period });
  }


  async getDeductionsByPeriod(period, db) {
    const query = `
      FOR d IN deductions
      FILTER d.period == @period
      SORT d.type, d.employeeName
      RETURN d
    `;

    return await db.QueryAll(query, { period });
  }

  async getRemittanceHistory(filters = {}, pagination = { page: 1, limit: 20 }, db) {
    const { period, type, status } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = ['d.type == "batch"'];
    let bindVars = { offset, limit };

    if (period) {
      whereConditions.push('d.period == @period');
      bindVars.period = period;
    }
    if (type) {
      whereConditions.push('d.remittanceType == @type');
      bindVars.type = type;
    }
    if (status) {
      whereConditions.push('d.status == @status');
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR d IN deductions
      ${whereClause}
      SORT d.remittedAt DESC, d.calculatedAt DESC
      LIMIT @offset, @limit
      RETURN d
    `;

    return await db.QueryAll(query, bindVars);
  }

  async exportDeductions(period, format, db) {
    try {
      // Get all employee deductions for the period
      const employeeDeductionsQuery = `
        FOR d IN deductions
        FILTER d.period == @period AND d.type == 'employee'
        RETURN d
      `;

      const employeeDeductions = await db.QueryAll(employeeDeductionsQuery, { period });

      // Get batch summary for the period
      const batchSummaryQuery = `
        FOR d IN deductions
        FILTER d.period == @period AND d.type == 'batch'
        RETURN d
      `;

      const batchSummary = await db.QueryFirst(batchSummaryQuery, { period });

      // Format data based on requested format
      const exportData = {
        period,
        format,
        generatedAt: new Date().toISOString(),
        employeeDeductions,
        batchSummary: batchSummary || {
          period,
          totals: {
            PAYE: 0,
            employeePension: 0,
            employerPension: 0,
            NHF: 0,
            NSITF: 0,
            ITF: 0,
            totalEmployeeDeductions: 0,
            totalEmployerContributions: 0
          }
        }
      };

      // In a real implementation, you would use libraries like:
      // - pdfkit for PDF generation
      // - exceljs for Excel generation  
      // - csv-writer for CSV generation
      
      // For now, return the structured data
      // The actual file generation would happen in the controller or a separate service
      return exportData;

    } catch (error) {
      console.error('Error exporting deductions:', error);
      throw new Error(`Failed to export deductions: ${error.message}`);
    }
  }

  async checkRemittanceStatus(period, db) {
    const query = `
      FOR d IN deductions
      FILTER d.period == @period AND d.type == 'batch'
      RETURN {
        period: d.period,
        status: d.status,
        remittedAt: d.remittedAt,
        remittedBy: d.remittedBy,
        remittanceReference: d.remittanceReference,
        totals: d.totals
      }
    `;

    const result = await db.QueryFirst(query, { period });
    return result || {
      period,
      status: 'pending',
      remittedAt: null,
      remittedBy: null,
      remittanceReference: null,
      totals: null
    };
  }
}

module.exports = new DeductionsQueries();