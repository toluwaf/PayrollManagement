const payrollQueries = require('../queries/payrollQueries');
const employeeQueries = require('../queries/employeeQueries');
const { getCycleMultiplier, getCycleConfiguration, 
  adjustEmployeeForCycle, validatePayrollPeriod} = require('./payroll/utilities/cycleHelpers')
const { generatePeriods,getDayOfYear,getWeekNumber} = require('./payroll/utilities/dateHelpers')
const { calculateEligibilitySavings, generateEligibilitySummary,
  enhanceEmployeeEligibility, adjustDeductionsWithEligibility } = require('./payroll/services/eligibilityService')
const { processAdjustments, calculateLoanDeductions, getLoanBreakdown } = require('./payroll/services/adjustmentProcessorService')
const ResponseHelper  = require('../helpers/responseHelper');
const PAYECalculator  = require('../helpers/payeCalculator');

class PayrollController {
  getAllPayrollRuns = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { page = 1, limit = 20, period, status } = req.query;
      
      const payrollRuns = await payrollQueries.findAll(
        { period, status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, payrollRuns, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payrollRuns.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll runs', 500, error.message);
    }
  }

  getPayrollRunById = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      const payrollRun = await payrollQueries.findById(id, db);

      if (!payrollRun) {
        return ResponseHelper.error(res, 'Payroll run not found', 404);
      }

      ResponseHelper.success(res, payrollRun, 'Payroll run retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll run', 500, error.message);
    }
  }
 
  processPayroll = async (req, res) => {
    const { ctx: { db }} = req
    try {
      const { period, employeeIds = [], options = {}, cycleType = 'monthly' } = req.body;
      
      // Validate period based on cycle type
      const validation = validatePayrollPeriod(period, cycleType);
      if (!validation.isValid) {
        return ResponseHelper.error(res, validation.message, 400);
      }

      // Get payroll settings for cycle configuration
      const settings = await payrollQueries.getPayrollSettings(db);
      const cycleConfig = getCycleConfiguration(cycleType, settings);

      // Get employees to process
      let employees = [];
      if (employeeIds.length > 0) {
        // Process specific employees
        employees = await employeeQueries.findEmployeesForPayrollRun(employeeIds, db); 
        
      } else {
        // Process all active employees
        employees = await employeeQueries.findAllActiveWithEligibility(db);
      }

      if (employees.length === 0) {
        return ResponseHelper.error(res, 'No employees found to process', 400);
      }

      // Adjust salaries based on cycle type
      const adjustedEmployees = employees.map(emp => 
        adjustEmployeeForCycle(emp, cycleConfig)
      );

      // Calculate payroll for each employee
      const payrollResults = [];
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalEligibilitySavings = 0;

      for (const employee of adjustedEmployees) {
        const payrollCalculation = await this.calculateEmployeePayroll(
          employee, 
          period, 
          { ...options, cycleType },
          db
        );
        payrollResults.push(payrollCalculation);
        
        totalGross += payrollCalculation.grossSalary;
        totalDeductions += payrollCalculation.totalDeductions;
        totalNet += payrollCalculation.netSalary;
              
        // Track eligibility savings
        if (payrollCalculation.eligibilitySavings) {
          totalEligibilitySavings += payrollCalculation.eligibilitySavings.monthly || 0;
        }
      }

      // Create payroll run record with cycle info
      const payrollRun = await payrollQueries.createPayrollRun({
        period,
        cycleType,
        status: 'processed',
        totalEmployees: employees.length,
        totalGross,
        totalDeductions,
        totalNet,
        totalEligibilitySavings,
        processedBy: req.user?.id || 'system',
        processedAt: new Date().toISOString(),
        cycleConfig,
        eligibilitySummary: generateEligibilitySummary(payrollResults),
        breakdown: {
          basicSalary: payrollResults.reduce((sum, r) => sum + r.basicSalary, 0),
          allowances: payrollResults.reduce((sum, r) => sum + r.allowances, 0),
          statutoryDeductions: payrollResults.reduce((sum, r) => sum + (r.statutoryDeductions?.totalEmployeeDeductions || 0), 0),
          eligibilityAdjustments: totalEligibilitySavings,
          netPay: totalNet
        }
      }, db);

      // Link employees to this payroll run
      for (const result of payrollResults) {
        await payrollQueries.addEmployeeToPayroll(payrollRun._key, result.employeeId, result, db);
      }

      // Initialize approval workflow if enabled
      if (settings?.approvalWorkflow?.enabled) {
        this.initiateApprovalWorkflowForPayroll(payrollRun._key, settings.approvalWorkflow, db);
      }

      ResponseHelper.success(res, {
        payrollRun,
        summary: {
          totalEmployees: employees.length,
          totalGross,
          totalDeductions,
          totalNet,
          totalEligibilitySavings,
          cycleType,
          averageSavingsPerEmployee: totalEligibilitySavings / employees.length
        },
        details: payrollResults.map(r => ({
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          grossSalary: r.grossSalary,
          netSalary: r.netSalary,
          eligibilitySavings: r.eligibilitySavings?.monthly || 0,
          optimizationOpportunities: r.taxOptimization?.recommendations?.length || 0
        }))
      }, 'Payroll processed successfully', 201);

    } catch (error) {
      console.error('Failed to process payroll:', error);
      ResponseHelper.error(res, 'Failed to process payroll', 500, error.message);
    }
  }

  // Generate payroll periods based on cycle type
  generatePayrollPeriods = async (req, res) => {
    try {
      const { cycleType = 'monthly', count = 12 } = req.query;
      
      const periods = generatePeriods(cycleType, parseInt(count));
      
      ResponseHelper.success(res, periods, 'Payroll periods generated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate payroll periods', 500, error.message);
    }
  }

  calculateEmployeePayroll = async (employee, period, options = {},db) => {
    const {
      includeStatutory = true,
      adjustments = {},
      cycleType
    } = options;

    
  
    // Declare payeResult in outer scope
    let payeResult = null;

    try {
      // Get current payroll settings
      const payrollSettings = await payrollQueries.getPayrollSettings(db);
      let taxSettings = payrollSettings?.taxSettings;

      // If no payroll settings, try to get PAYE settings
      if (!taxSettings) {
        const payeSettings = await payrollQueries.getPAYESettings(db);
        taxSettings = payeSettings;
      }

      // Create PAYE calculator with current settings
      const payeCalculator = new PAYECalculator(taxSettings);

      // Calculate cycle-based adjustments
      const cycleMultiplier = getCycleMultiplier(cycleType);
      const basicSalary = employee.salary * cycleMultiplier;

    
        // Get employee eligibility and exemptions
      const eligibilityAssessment = employee.eligibilityAssessment  || {};
      const exemptions = employee.exemptions || {};

      
      const enhancedEligibility = {
        ...employee,
        exemptFromNHF: employee.exemptFromNHF || false,
        hasDisability: employee.hasDisability || false,
        housingSituation: employee.housingSituation || null,
        annualRent: employee.annualRent || 0,
        additionalPension: employee.additionalPension || 0,
        hasLifeAssurance: employee.hasLifeAssurance || false,
        lifeAssurancePremium: employee.lifeAssurancePremium || 0,

        exemptions: { 
          ...exemptions,
          // Ensure these exist in exemptions
          nhfExempt: employee.exemptFromNHF || false,
          isPersonWithDisability: employee.hasDisability || false 
        },

        eligibilityAssessment: eligibilityAssessment
      };

      

      // Process adjustments with context
      const adjustmentContext = {
        baseSalary: employee.salary,
        estimatedNetSalary: employee.salary * 0.7, // Rough estimate\
        eligibilityData: enhancedEligibility,
        ...adjustments
      };
      
      // Process different adjustment types
      const adjustmentAmounts = processAdjustments(adjustments, cycleMultiplier);

      // Calculate gross salary using the calculator
      const salaryComponents = {
        basic: employee.salary,
        housing: employee.housingAllowance || 0,
        transport: employee.transportAllowance || 0,
        entertainment: adjustments.entertainment || 0,
        mealSubsidy: adjustments.mealSubsidy || 0,
        medical: employee.medicalAllowance || 0,
        benefitsInKind: adjustments.benefitsInKind || 0
      };

      const grossEmolument = payeCalculator.calculateGrossEmolument(salaryComponents);

      // Calculate statutory deductions using the calculator
      let statutoryDeductions = {};
      let totalDeductions = 0;

      if (includeStatutory) {
        statutoryDeductions = payeCalculator.calculateStatutoryDeductions(salaryComponents, {
          nhis: adjustments.nhis || 0,
          lifeAssurance: adjustments.lifeAssurance || 0,
          gratuities: adjustments.gratuities || 0,
          employeeCount: adjustments.employeeCount || 1
        }, enhancedEligibility);

        // Calculate PAYE tax
        const payeResult = payeCalculator.computePAYE(employee,{
          salaryComponents,
          eligibilityData: enhancedEligibility,
          additionalDeductions: {
            nhis: adjustments.nhis || 0,
            lifeAssurance: adjustments.lifeAssurance || 0,
            gratuities: adjustments.gratuities || 0,
            employeeCount: adjustments.employeeCount || 1,
            // Eligibility-specific deductions
            additionalPension: enhancedEligibility.additionalPension || 0,
            disabilityRelief: enhancedEligibility.hasDisability ? 20000 : 0,
            rentRelief: payeCalculator.calculateRentRelief(enhancedEligibility),
            nhfExempt: enhancedEligibility.exemptFromNHF || false
          }
        });

        statutoryDeductions.monthlyTax = payeResult.deductions.monthlyTax;
        statutoryDeductions.taxCalculation = payeResult.taxCalculation;

              // Adjust deductions based on eligibility
        statutoryDeductions = payeCalculator.applyEligibilityAdjustments(
          statutoryDeductions,
          enhancedEligibility
        );

        totalDeductions = statutoryDeductions.totalEmployeeDeductions;
      }

      // Additional deductions
      const otherDeductions = adjustments.loanDeduction || 0;
      totalDeductions += otherDeductions;

      // Eligibility-based reductions to deductions
      totalDeductions = payeCalculator.adjustDeductionsWithEligibility(
        totalDeductions,
        enhancedEligibility,
        grossEmolument
      );

      const netSalary = grossEmolument - totalDeductions;

      return {
        employeeId: employee._key,
        employeeName: employee.name,
        period,
        grossSalary: grossEmolument,
        basicSalary: basicSalary,
        allowances: (employee.housingAllowance || 0) + (employee.transportAllowance || 0) + (employee.otherAllowances || 0),
        statutoryDeductions,
        otherDeductions,
        totalDeductions,
        netSalary,
        eligibilityBreakdown: payeCalculator.getEligibilityBreakdown(enhancedEligibility),
        taxOptimization: payeCalculator.calculateTaxOptimization(enhancedEligibility, grossEmolument),
        adjustments: adjustmentAmounts,
        adjustmentDetails: adjustmentAmounts.details,
        calculatedAt: new Date().toISOString(),
        taxCalculation: payeResult?.taxCalculation || {},
        settingsUsed: {
          taxYear: taxSettings?.taxYear,
          bracketsCount: taxSettings?.taxBrackets?.length,
          calculationMethod: 'NTA 2026 Compliant'
        }
      };
    } catch (error) {
      console.error('Error in calculateEmployeePayroll:', error);
      throw error;
    }
  }

  getEmployeePayslip = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { employeeId, period } = req.params;
      
      const employee = await employeeQueries.findById(employeeId);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      const payslip = await payrollQueries.getEmployeePayslip(employeeId, period, db);
      
      if (!payslip) {
        // Calculate on-the-fly if not found
        const calculatedPayslip = await this.calculateEmployeePayroll(employee, period);
        ResponseHelper.success(res, calculatedPayslip, 'Payslip calculated successfully');
      } else {
        ResponseHelper.success(res, payslip, 'Payslip retrieved successfully');
      }
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate payslip', 500, error.message);
    }
  }

  approvePayroll = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      
      const payrollRun = await payrollQueries.updatePayrollStatus(id, 'approved', {
        approvedBy: req.user?.id,
        approvedAt: new Date().toISOString()
      }, db);

      if (!payrollRun) {
        return ResponseHelper.error(res, 'Payroll run not found', 404);
      }

      ResponseHelper.success(res, payrollRun, 'Payroll approved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to approve payroll', 500, error.message);
    }
  }

  getPayrollSummary = async (req, res) => {
    const { ctx :{ db }} = req
    try {
      const { period } = req.params;
      
      const summary = await payrollQueries.getPayrollSummary(period, db);
      ResponseHelper.success(res, summary, 'Payroll summary retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll summary', 500, error.message);
    }
  }

  validatePayrollCycle(period, cycle) {
    const date = new Date(period + '-01');
    switch (cycle) {
      case PAYROLL_CYCLES.WEEKLY:
        return this.validateWeeklyCycle(date);
      case PAYROLL_CYCLES.BI_WEEKLY:
        return this.validateBiWeeklyCycle(date);
      default:
        return true;
    }
  }

  initiateApprovalWorkflow = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { payrollRunId } = req.params;
      const { approvers } = req.body;

      // Get payroll run
      const payrollRun = await payrollQueries.findById(payrollRunId, db);
      if (!payrollRun) {
        return ResponseHelper.error(res, 'Payroll run not found', 404);
      }

      // Check if workflow already exists
      const existingWorkflow = await payrollQueries.getApprovalWorkflowByPayrollRun(payrollRunId, db);
      if (existingWorkflow) {
        return ResponseHelper.error(res, 'Approval workflow already exists for this payroll run', 400);
      }

      // Create workflow steps
      const steps = approvers.map((approver, index) => ({
        step: index + 1,
        approverId: approver.userId,
        approverName: approver.name,
        role: approver.role,
        status: 'pending',
        required: approver.required !== false,
        approvalLimit: approver.approvalLimit || null
      }));

      const workflowData = {
        payrollRunId,
        currentStep: 1,
        status: 'pending',
        steps,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id || 'system'
      };

      const workflow = await payrollQueries.createApprovalWorkflow(workflowData, db);

      ResponseHelper.success(res, workflow, 'Approval workflow initiated successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to initiate approval workflow', 500, error.message);
    }
  }

  /**
   * Helper method to initiate approval workflow for payroll run
   * Called internally when payroll is processed with approval workflow enabled
   * 
   * @param {string} payrollRunId - The ID of the payroll run
   * @param {object} approvalWorkflowSettings - Workflow settings from payroll settings
   * @param {object} db - Database connection
   * @returns {object|null} Created workflow or null if failed
   */
  initiateApprovalWorkflowForPayroll = async (payrollRunId, approvalWorkflowSettings, db) => {
    try {
      // Check if workflow already exists for this payroll run
      const existingWorkflow = await payrollQueries.getApprovalWorkflowByPayrollRun(payrollRunId, db);
      if (existingWorkflow) {
        console.log(`Approval workflow already exists for payroll run ${payrollRunId}`);
        return existingWorkflow;
      }

      // Get approvers from settings
      const approvers = approvalWorkflowSettings.approvers || [];
      
      if (approvers.length === 0) {
        console.warn('No approvers configured in approval workflow settings');
        return null;
      }

      // Create workflow steps from approvers
      const steps = approvers.map((approver, index) => ({
        step: index + 1,
        approverId: approver.userId || approver.id,
        approverName: approver.name || approver.userName,
        approverEmail: approver.email,
        role: approver.role || 'approver',
        status: 'pending',
        required: approver.required !== false, // Default to required
        approvalLimit: approver.approvalLimit || null,
        department: approver.department || null
      }));

      // Create workflow data
      const workflowData = {
        payrollRunId,
        currentStep: 1,
        status: 'pending',
        steps,
        requiredApprovals: approvalWorkflowSettings.requiredApprovals || steps.length,
        createdAt: new Date().toISOString(),
        createdBy: 'system', // Since this is called internally
        metadata: {
          autoInitiated: true,
          workflowType: 'payroll_processing',
          totalSteps: steps.length
        }
      };

      // Create the workflow
      const workflow = await payrollQueries.createApprovalWorkflow(workflowData, db);
      
      console.log(`Approval workflow initiated for payroll run ${payrollRunId} with ${steps.length} steps`);
      
      // Optional: Send notifications to first approver
      if (workflow && workflow.steps && workflow.steps.length > 0) {
        const firstApprover = workflow.steps[0];
        // TODO: Implement notification service call here
        // Example: await notificationService.sendApprovalRequest(firstApprover);
        console.log(`Approval request pending for: ${firstApprover.approverName} (${firstApprover.approverEmail})`);
      }

      return workflow;
    } catch (error) {
      console.error('Error initiating approval workflow for payroll:', error);
      // Don't throw error - workflow initiation failure shouldn't block payroll processing
      // Just log the error and return null
      return null;
    }
  }


  // Approve a step in the workflow
  approveWorkflowStep = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { workflowId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id;

      const workflow = await payrollQueries.getApprovalWorkflowById(workflowId, db);
      if (!workflow) {
        return ResponseHelper.error(res, 'Approval workflow not found', 404);
      }

      const currentStep = workflow.steps.find(step => step.step === workflow.currentStep);
      if (!currentStep) {
        return ResponseHelper.error(res, 'Current step not found', 400);
      }

      // Check if user is the current approver
      if (currentStep.approverId !== userId) {
        return ResponseHelper.error(res, 'You are not authorized to approve this step', 403);
      }

      // Update step
      currentStep.status = 'approved';
      currentStep.approvedAt = new Date().toISOString();
      currentStep.comments = comments;

      // Check if this is the final step
      const nextStep = workflow.steps.find(step => step.step === workflow.currentStep + 1);
      if (nextStep) {
        workflow.currentStep += 1;
      } else {
        workflow.status = 'approved';
        workflow.completedAt = new Date().toISOString();
        
        // Also update payroll run status
        await payrollQueries.updatePayrollStatus(workflow.payrollRunId, 'approved', {
          approvedBy: userId,
          approvedAt: new Date().toISOString()
        }, db);
      }

      workflow.updatedAt = new Date().toISOString();
      const updatedWorkflow = await payrollQueries.updateApprovalWorkflow(workflowId, workflow, db);

      ResponseHelper.success(res, updatedWorkflow, 'Step approved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to approve workflow step', 500, error.message);
    }
  }

  // Reject a step in the workflow
  rejectWorkflowStep = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { workflowId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id;

      const workflow = await payrollQueries.getApprovalWorkflowById(workflowId, db);
      if (!workflow) {
        return ResponseHelper.error(res, 'Approval workflow not found', 404);
      }

      const currentStep = workflow.steps.find(step => step.step === workflow.currentStep);
      if (!currentStep) {
        return ResponseHelper.error(res, 'Current step not found', 400);
      }

      // Check if user is the current approver
      if (currentStep.approverId !== userId) {
        return ResponseHelper.error(res, 'You are not authorized to reject this step', 403);
      }

      // Update step and workflow
      currentStep.status = 'rejected';
      currentStep.rejectedAt = new Date().toISOString();
      currentStep.comments = comments;

      workflow.status = 'rejected';
      workflow.updatedAt = new Date().toISOString();

      const updatedWorkflow = await payrollQueries.updateApprovalWorkflow(workflowId, workflow, db);

      ResponseHelper.success(res, updatedWorkflow, 'Step rejected successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to reject workflow step', 500, error.message);
    }
  }

  // Get pending approvals for current user
  getPendingApprovals = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const userId = req.user?.id;
      const pendingApprovals = await payrollQueries.getPendingApprovalsForUser(userId, db);

      ResponseHelper.success(res, pendingApprovals, 'Pending approvals retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch pending approvals', 500, error.message);
    }
  }

  // Get workflow by payroll run
  getWorkflowByPayrollRun = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { payrollRunId } = req.params;
      const workflow = await payrollQueries.getApprovalWorkflowByPayrollRun(payrollRunId, db);

      if (!workflow) {
        return ResponseHelper.error(res, 'Approval workflow not found', 404);
      }

      ResponseHelper.success(res, workflow, 'Workflow retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch workflow', 500, error.message);
    }
  }

    
  // Get all adjustments with filtering
  getAdjustments = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { 
        page = 1, 
        limit = 20, 
        employeeId, 
        type, 
        status, 
        period,
        startDate,
        endDate 
      } = req.query;

      const filters = { employeeId, type, status, period, startDate, endDate };
      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      const adjustments = await payrollQueries.findAdjustments(filters, pagination, db);

      ResponseHelper.paginated(res, adjustments, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: adjustments.totalCount || adjustments.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch adjustments', 500, error.message);
    }
  }

  // Create new adjustment
  createAdjustment = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const adjustmentData = req.body;
      
      // Validate required fields
      if (!adjustmentData.employeeId || !adjustmentData.type || !adjustmentData.amount) {
        return ResponseHelper.error(res, 'Missing required fields', 400);
      }

      // Validate adjustment type
      const validTypes = ['bonus', 'overtime', 'loan', 'advance', 'penalty', 'allowance', 'deduction'];
      if (!validTypes.includes(adjustmentData.type)) {
        return ResponseHelper.error(res, 'Invalid adjustment type', 400);
      }

      // Set default status if not provided
      if (!adjustmentData.status) {
        adjustmentData.status = 'pending';
      }

      // Add timestamps and user info
      adjustmentData.createdAt = new Date().toISOString();
      adjustmentData.createdBy = req.user?.id || 'system';
      adjustmentData.updatedAt = new Date().toISOString();

      const adjustment = await payrollQueries.createAdjustment(adjustmentData, db);

      ResponseHelper.success(res, adjustment, 'Adjustment created successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to create adjustment', 500, error.message);
    }
  }

  // Update adjustment
  updateAdjustment = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if adjustment exists
      const existingAdjustment = await payrollQueries.getAdjustmentById(id, db);
      if (!existingAdjustment) {
        return ResponseHelper.error(res, 'Adjustment not found', 404);
      }

      // Update timestamps
      updateData.updatedAt = new Date().toISOString();
      updateData.updatedBy = req.user?.id || 'system';

      const updatedAdjustment = await payrollQueries.updateAdjustment(id, updateData, db);

      ResponseHelper.success(res, updatedAdjustment, 'Adjustment updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update adjustment', 500, error.message);
    }
  }

  // Delete adjustment
  deleteAdjustment = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;

      const adjustment = await payrollQueries.getAdjustmentById(id, db);
      if (!adjustment) {
        return ResponseHelper.error(res, 'Adjustment not found', 404);
      }

      await payrollQueries.deleteAdjustment(id, db);

      ResponseHelper.success(res, null, 'Adjustment deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete adjustment', 500, error.message);
    }
  }

  // Bulk create adjustments for payroll processing
  bulkCreateAdjustments = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { adjustments, payrollRunId } = req.body;

      if (!Array.isArray(adjustments) || adjustments.length === 0) {
        return ResponseHelper.error(res, 'No adjustments provided', 400);
      }

      const results = [];
      for (const adjustmentData of adjustments) {
        try {
          const adjustment = await payrollQueries.createAdjustment({
            ...adjustmentData,
            payrollRunId,
            status: 'approved', // Auto-approve bulk adjustments
            createdAt: new Date().toISOString(),
            createdBy: req.user?.id || 'system',
            updatedAt: new Date().toISOString()
          }, db);
          results.push(adjustment);
        } catch (error) {
          console.error(`Failed to create adjustment for employee ${adjustmentData.employeeId}:`, error);
          results.push({ error: error.message, employeeId: adjustmentData.employeeId });
        }
      }

      ResponseHelper.success(res, results, 'Bulk adjustments created successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to create bulk adjustments', 500, error.message);
    }
  }

  // Get adjustment types and statistics
  getAdjustmentTypes = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const types = await payrollQueries.getAdjustmentTypes(db);
      ResponseHelper.success(res, types, 'Adjustment types retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch adjustment types', 500, error.message);
    }
  }

  getPayrollHistory = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { 
        page = 1, 
        limit = 20, 
        period, 
        status, 
        startDate, 
        endDate,
        sortBy = 'processedAt',
        sortOrder = 'DESC'
      } = req.query;

      // Build filters
      const filters = {};
      if (period) filters.period = period;
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.dateRange = { startDate, endDate };
      }

      // Ensure pagination is properly structured
      const pagination = { 
        page: parseInt(page) || 1, 
        limit: parseInt(limit) || 20 
      };

      // Get payroll runs with enhanced filtering
      const payrollRuns = await payrollQueries.findPayrollHistory(
        filters, 
        pagination, 
        sortBy, 
        sortOrder,
        db
      );

      // Get summary statistics
      const summary = await payrollQueries.getPayrollHistorySummary(filters, db);
      
      // Debug logging
      // console.log('Payroll result:', payrollRuns);
      // console.log('Summary:', summary);

      // Ensure we have a valid payrollResult
      if (!payrollRuns) {
        throw new Error('findPayrollHistory returned undefined');
      }

      ResponseHelper.Ppaginate(res, {
        data: payrollRuns.data,
        summary,
        pagination: {
          page: payrollRuns.page || 1,
          limit: payrollRuns.limit,
          total: payrollRuns.totalCount,
          totalPages: payrollRuns.totalPages
        }
      });
    } catch (error) {
      console.error('Error in getPayrollHistory:', error);
      ResponseHelper.error(res, 'Failed to fetch payroll history', 500, error.message);
    }
  }

  exportPayrollHistory = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { format = 'csv', period } = req.query;
      
      const payrollData = await payrollQueries.exportPayrollHistory(period, format, db);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payroll-history-${period || 'all'}.csv`);
        return res.send(payrollData);
      } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=payroll-history-${period || 'all'}.xlsx`);
        return res.send(payrollData);
      } else {
        ResponseHelper.success(res, payrollData, 'Payroll history exported successfully');
      }
    } catch (error) {
      ResponseHelper.error(res, 'Failed to export payroll history', 500, error.message);
    }
  }
}


module.exports = new PayrollController();