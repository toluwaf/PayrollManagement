const reportsQueries  = require('../queries/reportsQueries');
const ResponseHelper = require('../helpers/responseHelper');

class ReportsController {
  async getPayrollSummary(req, res) {
    const { ctx :{ db }} = req
    try {
      const { startDate, endDate, department } = req.query;
      
      const summary = await reportsQueries.getPayrollSummary({ startDate, endDate, department }, db);
      ResponseHelper.success(res, summary, 'Payroll summary report generated');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate payroll summary', 500, error.message);
    }
  }

  async getDepartmentBreakdown(req, res) {
    const { ctx :{ db }} = req
    try {
      const { period } = req.params;
      
      const breakdown = await reportsQueries.getDepartmentBreakdown(period, db);
      ResponseHelper.success(res, breakdown, 'Department breakdown report generated');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate department breakdown', 500, error.message);
    }
  }

  async getDeductionAnalysis(req, res) {
    const { ctx :{ db }} = req
    try {
      const { period, type } = req.query;
      
      const analysis = await reportsQueries.getDeductionAnalysis(period, type, db);
      ResponseHelper.success(res, analysis, 'Deduction analysis report generated');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate deduction analysis', 500, error.message);
    }
  }

  async getComplianceStatus(req, res) {
    const { ctx :{ db }} = req
    try {
      const { period } = req.params;
      
      const compliance = await reportsQueries.getComplianceStatus(period, db);
      ResponseHelper.success(res, compliance, 'Compliance status report generated');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to generate compliance report', 500, error.message);
    }
  }

  async exportReport(req, res) {
    const { ctx :{ db }} = req
    try {
      const { format, reportType } = req.params;
      const filters = req.query;

      const reportData = await reportsQueries.exportReportData(reportType, filters, db);
      
      // Set appropriate headers for download
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      switch (format) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.json(reportData);
          break;
          
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          // In a real implementation, you'd convert to CSV
          res.send(this.convertToCSV(reportData));
          break;
          
        default:
          ResponseHelper.error(res, 'Unsupported export format', 400);
      }
    } catch (error) {
      ResponseHelper.error(res, 'Failed to export report', 500, error.message);
    }
  }

  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  async getDashboardMetrics(req, res) {
    const { ctx :{ db }} = req
    try {
      const metrics = await reportsQueries.getDashboardMetrics(db);
      ResponseHelper.success(res, metrics, 'Dashboard metrics retrieved');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch dashboard metrics', 500, error.message);
    }
  }
}

module.exports = new ReportsController();