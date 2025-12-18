// controllers/dashboardController.js
const ResponseHelper = require('../helpers/responseHelper');

class DashboardController {
  async getHRStatistics(req, res) {
    const { ctx: { db } } = req;
    try {
      // Get total employees count
      const totalEmployeesQuery = `
        RETURN LENGTH(
          FOR e IN employees 
          FILTER e.status == 'active' 
          RETURN e
        )
      `;
      const totalEmployees = await db.QueryFirst(totalEmployeesQuery);

      // Get employees on leave (this month) - you'll need a leave collection
      const onLeaveQuery = `
        RETURN LENGTH(
          FOR l IN employee_leave
          FILTER l.status == 'approved' 
          AND DATE_MONTH(l.startDate) == DATE_MONTH(DATE_NOW())
          AND DATE_YEAR(l.startDate) == DATE_YEAR(DATE_NOW())
          RETURN l
        )
      `;
      const onLeave = await db.QueryFirst(onLeaveQuery) || 0;

      // Get new hires (this quarter)
      const currentQuarter = Math.floor((new Date().getMonth() / 3));
      const newHiresQuery = `
        RETURN LENGTH(
          FOR e IN employees
          FILTER e.status == 'active'
          AND DATE_QUARTER(e.joinDate) == @quarter
          AND DATE_YEAR(e.joinDate) == DATE_YEAR(DATE_NOW())
          RETURN e
        )
      `;
      const newHires = await db.QueryFirst(newHiresQuery, { quarter: currentQuarter + 1 });

      // Get departments count
      const departmentsQuery = `RETURN LENGTH(departments)`;
      const departments = await db.QueryFirst(departmentsQuery);

      // Get department breakdown
      const departmentBreakdownQuery = `
        FOR d IN departments
        LET employeeCount = LENGTH(
          FOR e IN employees 
          FILTER e.department == d._key AND e.status == 'active'
          RETURN e
        )
        RETURN {
          name: d.name,
          count: employeeCount
        }
      `;
      const departmentBreakdown = await db.QueryAll(departmentBreakdownQuery);

      ResponseHelper.success(res, {
        totalEmployees,
        onLeave,
        newHires,
        departments,
        departmentBreakdown
      }, 'HR statistics retrieved successfully');

    } catch (error) {
      console.error('HR statistics error:', error);
      ResponseHelper.error(res, 'Failed to fetch HR statistics', 500, error.message);
    }
  }

  async getRecentHires(req, res) {
    const { ctx: { db } } = req;
    try {
      const query = `
        FOR e IN employees
        FILTER e.status == 'active'
        SORT e.joinDate DESC
        LIMIT 10
        RETURN {
          _key: e._key,
          name: e.name,
          position: e.position,
          department: e.department,
          joinDate: e.joinDate,
          employeeId: e.employeeId
        }
      `;

      const recentHires = await db.QueryAll(query);
      ResponseHelper.success(res, recentHires, 'Recent hires retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch recent hires', 500, error.message);
    }
  }
}

module.exports = new DashboardController();