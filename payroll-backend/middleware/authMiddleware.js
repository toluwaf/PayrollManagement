const jwt = require('jsonwebtoken');
const ResponseHelper  = require('../helpers/responseHelper.js');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return ResponseHelper.error(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'woiuanldslkfjaiousdflkj');
    req.user = decoded;
    next();
  } catch (error) {
    ResponseHelper.error(res, 'Invalid token', 401);
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return ResponseHelper.error(res, 'Access denied. Insufficient permissions.', 403);
    }
    next();
  };
};

// Role definitions
const ROLES = {
  HR_ADMIN: 'admin',
  PAYROLL_OFFICER: 'payroll', 
  FINANCE_OFFICER: 'finance',
  COMPLIANCE_OFFICER: 'compliance',
  EMPLOYEE: 'employee',
  EXECUTIVE: 'executive'
};

module.exports = { authMiddleware, roleMiddleware, ROLES };