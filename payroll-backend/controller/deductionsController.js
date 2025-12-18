const deductionsQueries = require('../queries/deductionsQueries');
const employeeQueries = require('../queries/employeeQueries');
const ResponseHelper  = require('../helpers/responseHelper');
const PAYECalculator  = require('../helpers/payeCalculator');

class DeductionsController {
  getAllDeductions = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { page = 1, limit = 50, period, type, status } = req.query;
      
      const deductions = await deductionsQueries.findAll(
        { period, type, status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, deductions, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: deductions.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch deductions', 500, error.message);
    }
  }

  calculateDeductions = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { period, employeeIds = [] } = req.body;
      
      if (!period || !/^\d{4}-\d{2}$/.test(period)) {
        return ResponseHelper.error(res, 'Invalid period format. Use YYYY-MM', 400);
      }

      // Get employees
      let employees = [];
      if (employeeIds.length > 0) {
        for (const empId of employeeIds) {
          const employee = await employeeQueries.findById(empId, db);
          if (employee) employees.push(employee);
        }
      } else {
        employees = await employeeQueries.findAll({ status: 'active' }, db);
      }

      if (employees.length === 0) {
        return ResponseHelper.error(res, 'No employees found to calculate deductions', 400);
      }

      const deductionResults = [];
      let totals = {
        PAYE: 0,
        employeePension: 0,
        employerPension: 0,
        NHF: 0,
        NSITF: 0,
        ITF: 0,
        totalEmployeeDeductions: 0,
        totalEmployerContributions: 0
      };

      // Check if ITF applies (company with ≥ 5 employees)
      const itfApplies = employees.length >= 5;

      for (const employee of employees) {
        const employeeDeductions = await this.calculateEmployeeDeductions(employee, period, itfApplies,db);
        deductionResults.push(employeeDeductions);
        
        totals.PAYE += employeeDeductions.paye;
        totals.employeePension += employeeDeductions.pension;
        totals.employerPension += employeeDeductions.employerPension;
        totals.NHF += employeeDeductions.nhf;
        totals.NSITF += employeeDeductions.nsitf;
        totals.ITF += employeeDeductions.itf;
        totals.totalEmployeeDeductions += employeeDeductions.totalEmployeeDeductions;
        totals.totalEmployerContributions += employeeDeductions.totalEmployerContributions;
      }

      // Save deduction batch
      const deductionBatch = await deductionsQueries.createDeductionBatch({
        period,
        totalEmployees: employees.length,
        totals,
        itfApplies,
        calculatedAt: new Date().toISOString(),
        calculatedBy: req.user?.id || 'system'
      }, db);

      ResponseHelper.success(res, {
        deductionBatch,
        summary: totals,
        details: deductionResults
      }, 'Deductions calculated successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Failed to calculate deductions', 500, error.message);
    }
  }

  calculateEmployeeDeductions = async (employee, period, itfApplies, db) => {
    const grossEmolument = employee.basicSalary + 
                          (employee.housingAllowance || 0) + 
                          (employee.transportAllowance || 0) + 
                          (employee.entertainmentAllowance || 0) +
                          (employee.mealSubsidy || 0) + 
                          (employee.medicalAllowance || 0) + 
                          (employee.benefitsInKind || 0);

    // Calculate statutory deductions using PAYE calculator
    const payeCalculations = PAYECalculator.calculate(grossEmolument, {
      basicSalary: employee.basicSalary,
      housing: employee.housingAllowance,
      transport: employee.transportAllowance,
      entertainment: employee.entertainmentAllowance,
      mealSubsidy: employee.mealSubsidy,
      medical: employee.medicalAllowance,
      benefitsInKind: employee.benefitsInKind
    });

    // Calculate other statutory deductions
    const employeePension = grossEmolument * 0.075; // 7.5% employee
    const employerPension = grossEmolument * 0.075; // 7.5% employer (PENCOM)
    const nhf = grossEmolument * 0.025; // 2.5% NHF
    const nsitf = employee.basicSalary * 0.01; // 1% NSITF (employer)
    const itf = itfApplies ? employee.basicSalary * 0.01 : 0; // 1% ITF if applicable

    const totalEmployeeDeductions = payeCalculations.monthlyTax + employeePension + nhf;
    const totalEmployerContributions = employerPension + nsitf + itf;

    const deductions = {
      employeeId: employee._key,
      employeeName: employee.name,
      employeeCode: employee.employeeId,
      department: employee.department,
      period,
      grossEmolument,
      
      // Employee Deductions
      paye: payeCalculations.monthlyTax,
      pension: employeePension,
      nhf: nhf,
      totalEmployeeDeductions,

      // Employer Contributions
      employerPension,
      nsitf,
      itf,
      totalEmployerContributions,

      // Additional info
      netSalary: grossEmolument - totalEmployeeDeductions,
      calculatedAt: new Date().toISOString()
    };

    // Save individual employee deduction record
    await deductionsQueries.createEmployeeDeduction(deductions, db);

    return deductions;
  }

  remitDeductions = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      const { remittanceData } = req.body;

      const deductionBatch = await deductionsQueries.findById(id, db);
      if (!deductionBatch) {
        return ResponseHelper.error(res, 'Deduction batch not found', 404);
      }

      // Update deduction batch with remittance info
      const updatedBatch = await deductionsQueries.updateDeductionBatch(id, {
        status: 'remitted',
        remittedAt: new Date().toISOString(),
        remittedBy: req.user?.id,
        remittanceReference: remittanceData.reference,
        remittanceDate: remittanceData.date,
        remittanceType: remittanceData.type,
        ...remittanceData
      }, db);

      ResponseHelper.success(res, updatedBatch, 'Deductions remitted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to remit deductions', 500, error.message);
    }
  }

  getDeductionSummary = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { period } = req.params;
      
      const summary = await deductionsQueries.getDeductionSummary(period, db);
      ResponseHelper.success(res, summary, 'Deduction summary retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch deduction summary', 500, error.message);
    }
  }

  generateComplianceReport = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period, reportType } = req.params;
      
      const report = await deductionsQueries.generateComplianceReport(period, reportType, db);
      
      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=compliance-report-${period}.pdf`);
      
      ResponseHelper.success(res, report, 'Compliance report generated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate compliance report', 500, error.message);
    }
  }

  exportDeductions = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period } = req.params;
      const { format = 'pdf' } = req.query;

      const exportData = await deductionsQueries.exportDeductions(period, format, db);
      
      // Set appropriate headers based on format
      const contentTypes = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv'
      };

      res.setHeader('Content-Type', contentTypes[format] || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=deductions-${period}.${format}`);
      
      ResponseHelper.success(res, exportData, 'Deductions exported successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to export deductions', 500, error.message);
    }
  }
}
module.exports = new DeductionsController();