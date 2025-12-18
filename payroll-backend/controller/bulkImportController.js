// backend/controllers/bulkImportController.js
const csv = require('csv-parser');
const ResponseHelper  = require('../helpers/responseHelper');
const employeeQueries = require('../queries/employeeQueries');

class BulkImportController {
  async importEmployees(req, res) {
    try {
      if (!req.file) {
        return ResponseHelper.error(res, 'No file uploaded', 400);
      }

      const results = [];
      const errors = [];
      
      // Process CSV file
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      
      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          // Process each employee
          for (const [index, employeeData] of results.entries()) {
            try {
              await employeeQueries.create(employeeData);
            } catch (error) {
              errors.push(`Row ${index + 2}: ${error.message}`);
            }
          }

          ResponseHelper.success(res, {
            imported: results.length - errors.length,
            failed: errors.length,
            errors: errors
          }, 'Bulk import completed');
        });
    } catch (error) {
      ResponseHelper.error(res, 'Import failed', 500, error.message);
    }
  }
}

module.exports = new BulkImportController();