// backend/controllers/jvController.js
const jvQueries = require('../queries/jvQueries');
const payrollQueries = require('../queries/payrollQueries');
const ResponseHelper = require('../helpers/responseHelper');

class JVController {
  // ========== JV PARTNERS ==========
  
  // Get all JV partners
  getAllPartners = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, status, type } = req.query;
      
      const partners = await jvQueries.findAllPartners(
        { status, type },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, partners, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: partners.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV partners', 500, error.message);
    }
  };

  // Get JV partner by ID
  getPartnerById = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const partner = await jvQueries.findPartnerById(id, db);

      if (!partner) {
        return ResponseHelper.error(res, 'JV partner not found', 404);
      }

      ResponseHelper.success(res, partner, 'JV partner retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV partner', 500, error.message);
    }
  };

  // ========== JV AGREEMENTS ==========

  // Get all JV agreements
  getAllAgreements = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, status } = req.query;
      
      const agreements = await jvQueries.findAllAgreements(
        { status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, agreements, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: agreements.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV agreements', 500, error.message);
    }
  };

  // Get JV agreement by ID with partners
  getAgreementById = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const agreement = await jvQueries.findAgreementWithPartners(id, db);

      if (!agreement) {
        return ResponseHelper.error(res, 'JV agreement not found', 404);
      }

      ResponseHelper.success(res, agreement, 'JV agreement retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV agreement', 500, error.message);
    }
  };

  // ========== ALLOCATION RULES ==========

  // Get all allocation rules
  getAllocationRules = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, agreementId, partnerId, status } = req.query;
      
      const rules = await jvQueries.findAllocationRules(
        { agreementId, partnerId, status },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, rules, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: rules.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch allocation rules', 500, error.message);
    }
  };

  // ========== ALLOCATION CALCULATIONS ==========

  // Calculate JV allocations for payroll run
  calculateAllocations = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { payrollRunId } = req.body;

      if (!payrollRunId) {
        return ResponseHelper.error(res, 'Payroll run ID is required', 400);
      }

      // Get payroll run details
      const payrollRun = await payrollQueries.findById(payrollRunId, db);
      if (!payrollRun) {
        return ResponseHelper.error(res, 'Payroll run not found', 404);
      }

      // Calculate allocations
      const allocations = await jvQueries.calculateJVAllocations(payrollRunId, db);

      ResponseHelper.success(res, {
        payrollRun: payrollRun.period,
        allocations,
        summary: {
          totalAllocated: allocations.reduce((sum, alloc) => sum + alloc.totalAmount, 0),
          partnerCount: new Set(allocations.map(a => a.partnerId)).size,
          agreementCount: new Set(allocations.map(a => a.agreementId)).size
        }
      }, 'JV allocations calculated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to calculate JV allocations', 500, error.message);
    }
  };

  // Get allocation results for payroll run
  getAllocationResults = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { payrollRunId } = req.params;

      const allocations = await jvQueries.getAllocationResults(payrollRunId, db);

      ResponseHelper.success(res, allocations, 'Allocation results retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch allocation results', 500, error.message);
    }
  };

  // ========== REPORTS ==========

  // Generate JV allocation report
  generateAllocationReport = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period } = req.params;
      const { partnerId, agreementId } = req.query;

      const report = await jvQueries.generateAllocationReport(period, { partnerId, agreementId }, db);

      ResponseHelper.success(res, report, 'Allocation report generated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate allocation report', 500, error.message);
    }
  };

  // Get JV allocation statistics
  getAllocationStatistics = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { period } = req.params;

      const statistics = await jvQueries.getAllocationStatistics(period, db);

      ResponseHelper.success(res, statistics, 'Allocation statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch allocation statistics', 500, error.message);
    }
  };

  // ========== VALIDATION ==========

  // Validate allocation rules
  validateAllocationRules = async (req, res) => {
    const { ctx: { db } } = req;
    try {
      const { agreementId } = req.params;

      const validation = await jvQueries.validateAllocationRules(agreementId, db);

      ResponseHelper.success(res, validation, 'Allocation rules validated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to validate allocation rules', 500, error.message);
    }
  };
}

module.exports = new JVController();