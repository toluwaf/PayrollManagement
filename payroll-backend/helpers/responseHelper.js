class ResponseHelper {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }


  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    });
  }

  // In responseHelper.js
  static Ppaginate(res, { data, summary, pagination }) {
    // Ensure pagination has required properties with defaults
    const safePagination = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      total: pagination?.total || 0,
      totalPages: pagination?.totalPages || 1
    };

    res.status(200).json({
      success: true,
      message: 'Success',
      data: data || [],
      summary: summary || {},
      pagination: safePagination
    });
  }

  
  static validationError(res, errors, message = 'Validation failed') {
    return res.status(400).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHelper; // Export the class, not an instance