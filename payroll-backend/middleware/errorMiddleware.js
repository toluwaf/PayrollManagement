const errorMiddleware = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Joi validation error
  if (err.isJoi) {
    return ResponseHelper.validationError(res, err.details);
  }

  // Database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return ResponseHelper.error(res, 'Duplicate entry found', 409);
  }

  // Version conflict
  if (err.name === 'VERSION_CONFLICT') {
    return ResponseHelper.error(res, err.message, 409, err.conflicts);
  }

  // Default error
  ResponseHelper.error(res, 'Internal server error', 500);
};

module.exports = errorMiddleware;