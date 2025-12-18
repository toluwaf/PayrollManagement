const employeeQueries = require('../queries/employeeQueries');
const ResponseHelper  = require('../helpers/responseHelper');
const { PAYECalculator } = require('../helpers/payeCalculator');

class EmployeeController {
  async getAllEmployees(req, res) {
    const { ctx :{ db }} = req
    // console.log(req.ctx)
    try {
      const { page = 1, limit = 50, department, status, search, jvPartner } = req.query;
      const employees = await employeeQueries.findAll(
        { department, status, search, jvPartner },
        { page: parseInt(page), limit: parseInt(limit) },
        db
      );

      ResponseHelper.paginated(res, employees, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: employees.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employees', 500, error.message);
    }
  }

  async getEmployeeById(req, res) {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      const employee = await employeeQueries.findById(id, db);

      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, employee, 'Employee retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employee', 500, error.message);
    }
  }

  async createEmployee(req, res) {
    const { ctx :{ db }} = req
    try {
      const employeeData = req.body;
       
      // Validate required fields
      if (!employeeData.name || !employeeData.email || !employeeData.department) {
        return ResponseHelper.error(res, 'Missing required fields: name, email, department', 400);
      }

      // Check if email already exists
      const emailExists = await employeeQueries.checkEmailExists(employeeData.email, null, db);
      if (emailExists) {
        return ResponseHelper.error(res, 'Email already exists', 400);
      }
      
      // Generate employee ID
      employeeData.employeeId = `EMP-${Date.now()}`;
      employeeData.createdAt = new Date().toISOString();
      employeeData.updatedAt = new Date().toISOString();
      //employeeData._lastModifiedBy = user?.email || 'system';
      employeeData.status = employeeData.status || 'active';
      
      // Calculate total salary if not provided
      if (!employeeData.salary && employeeData.basicSalary) {
        employeeData.salary = this.calculateTotalSalary(employeeData);
      }

      const result = await employeeQueries.create(employeeData, db);
      ResponseHelper.success(res, result, 'Employee created successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to create employee', 500, error.message);
    }
  }

  calculateTotalSalary(employeeData) {
    return (
      (employeeData.basicSalary || 0) +
      (employeeData.housingAllowance || 0) +
      (employeeData.transportAllowance || 0) +
      (employeeData.mealAllowance || 0) +
      (employeeData.utilityAllowance || 0) +
      (employeeData.entertainmentAllowance || 0) +
      (employeeData.otherAllowances || 0)
    );
  }

  async updateEmployee(req, res) {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      const updateData = req.body;
            
      // Check if employee exists
      const existingEmployee = await employeeQueries.findById(id, db);
      if (!existingEmployee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingEmployee.email) {
        const emailExists = await employeeQueries.checkEmailExists(updateData.email, id, db);
        if (emailExists) {
          return ResponseHelper.error(res, 'Email already exists', 400);
        }
      }

      updateData.updatedAt = new Date().toISOString();
      //updateData._lastModifiedBy = user?.email || 'system';

      const result = await employeeQueries.update(id, updateData, db);
      
      if (!result) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, result, 'Employee updated successfully');
    } catch (error) {
      console.error('Employee update failed:', error);
      
      if (error.name === 'VERSION_CONFLICT') {
        return ResponseHelper.error(res, 
          'Data was modified by another user. Please refresh and try again.', 
          409, 
          error.conflicts
        );
      }

      ResponseHelper.error(res, 'Failed to update employee', 500, error.message);
    }
  }

  async getEmployeeContracts(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const contracts = await employeeQueries.getEmployeeContracts(id, db);
      ResponseHelper.success(res, contracts, 'Employee contracts retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch contracts', 500, error.message);
    }
  }
  
  async addEmployeeContract(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const contractData = req.body;
      
      contractData.employeeId = id;
      contractData.createdAt = new Date().toISOString();
      contractData.updatedAt = new Date().toISOString();

      const result = await employeeQueries.addContract(contractData, db);
      ResponseHelper.success(res, result, 'Contract added successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to add contract', 500, error.message);
    }
  }

  async getJVAllocations(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const allocations = await employeeQueries.getEmployeeJVAllocations(id, db);
      ResponseHelper.success(res, allocations, 'JV allocations retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV allocations', 500, error.message);
    }
  }

  async updateJVAllocation(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const allocationData = req.body;
      
      const result = await employeeQueries.updateJVAllocation(id, allocationData, db);
      ResponseHelper.success(res, result, 'JV allocation updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update JV allocation', 500, error.message);
    }
  }

  async deleteEmployee(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      
      const result = await employeeQueries.delete(id, db);
      if (!result) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, null, 'Employee deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete employee', 500, error.message);
    }
  }
  async calculateEmployeePayroll(req, res) {
    const { ctx :{ db }} = req
    try {
      const { id } = req.params;
      const { period, adjustments = {} } = req.body;

      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      const grossSalary = employee.salary + (adjustments.bonus || 0) + (adjustments.overtime || 0);
      const calculations = PAYECalculator.calculate(grossSalary, {
        basicSalary: employee.basicSalary,
        housing: employee.housingAllowance,
        transport: employee.transportAllowance
      });

      const payrollData = {
        employeeId: employee._key,
        period,
        grossSalary,
        ...calculations,
        adjustments,
        calculatedAt: new Date().toISOString()
      };

      ResponseHelper.success(res, payrollData, 'Payroll calculated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to calculate payroll', 500, error.message);
    }
  }

  async getEmployeeFullProfile(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const employee = await employeeQueries.findEmployee(id, { 
        includeDetails: true,        // Should be true for full profile!
        includeContracts: true,      // Include contracts
        includeJV: true,            // Include JV allocations
        includePayroll: false,      // Optional for basic profile
        includeCompliance: false    // Optional for basic profile
      }, db);

      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, employee, 'Employee profile retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employee profile', 500, error.message);
    }
  }

  // Address Management
  async getEmployeeAddresses(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const addresses = await employeeQueries.getEmployeeAddresses(id, db);
      ResponseHelper.success(res, addresses, 'Employee addresses retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employee addresses', 500, error.message);
    }
  }

  async addEmployeeAddress(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const addressData = req.body;
      
      // Validate employee exists
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      addressData.employeeId = id;
      const result = await employeeQueries.addEmployeeAddress(addressData, db);
      ResponseHelper.success(res, result, 'Address added successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to add address', 500, error.message);
    }
  }

  async updateEmployeeAddress(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, addressId } = req.params;
      const updateData = req.body;

      const result = await employeeQueries.updateEmployeeAddress(addressId, updateData, db);
      if (!result) {
        return ResponseHelper.error(res, 'Address not found', 404);
      }

      ResponseHelper.success(res, result, 'Address updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update address', 500, error.message);
    }
  }

  async deleteEmployeeAddress(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, addressId } = req.params;
      
      const result = await employeeQueries.deleteEmployeeAddress(addressId, db);
      if (!result) {
        return ResponseHelper.error(res, 'Address not found', 404);
      }

      ResponseHelper.success(res, null, 'Address deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete address', 500, error.message);
    }
  }

  // Education Management
  async getEmployeeEducation(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const education = await employeeQueries.getEmployeeEducation(id, db);
      ResponseHelper.success(res, education, 'Employee education retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employee education', 500, error.message);
    }
  }

  async addEmployeeEducation(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const educationData = req.body;
      
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      educationData.employeeId = id;
      const result = await employeeQueries.addEmployeeEducation(educationData, db);
      ResponseHelper.success(res, result, 'Education record added successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to add education record', 500, error.message);
    }
  }

  async updateEmployeeEducation(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, educationId } = req.params;
      const updateData = req.body;

      const result = await employeeQueries.updateEmployeeEducation(educationId, updateData, db);
      if (!result) {
        return ResponseHelper.error(res, 'Education record not found', 404);
      }

      ResponseHelper.success(res, result, 'Education record updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update education record', 500, error.message);
    }
  }

  async deleteEmployeeEducation(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, educationId } = req.params;
      
      const result = await employeeQueries.deleteEmployeeEducation(educationId, db);
      if (!result) {
        return ResponseHelper.error(res, 'Education record not found', 404);
      }

      ResponseHelper.success(res, null, 'Education record deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete education record', 500, error.message);
    }
  }

  // Employment History Management
  async getEmployeeEmploymentHistory(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const employmentHistory = await employeeQueries.getEmployeeEmploymentHistory(id, db);
      ResponseHelper.success(res, employmentHistory, 'Employment history retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employment history', 500, error.message);
    }
  }

  async addEmployeeEmploymentHistory(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const employmentData = req.body;
      
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      employmentData.employeeId = id;
      const result = await employeeQueries.addEmployeeEmploymentHistory(employmentData, db);
      ResponseHelper.success(res, result, 'Employment history record added successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to add employment history record', 500, error.message);
    }
  }

  async updateEmployeeEmploymentHistory(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, historyId } = req.params;
      const updateData = req.body;

      const result = await employeeQueries.updateEmployeeEmploymentHistory(historyId, updateData, db);
      if (!result) {
        return ResponseHelper.error(res, 'Employment history record not found', 404);
      }

      ResponseHelper.success(res, result, 'Employment history record updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update employment history record', 500, error.message);
    }
  }

  async deleteEmployeeEmploymentHistory(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, historyId } = req.params;
      
      const result = await employeeQueries.deleteEmployeeEmploymentHistory(historyId, db);
      if (!result) {
        return ResponseHelper.error(res, 'Employment history record not found', 404);
      }

      ResponseHelper.success(res, null, 'Employment history record deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete employment history record', 500, error.message);
    }
  }

  // Document Management
  async getEmployeeDocuments(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const documents = await employeeQueries.getEmployeeDocuments(id, db);
      ResponseHelper.success(res, documents, 'Employee documents retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch employee documents', 500, error.message);
    }
  }

  async addEmployeeDocument(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const documentData = req.body;
      
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      documentData.employeeId = id;
      const result = await employeeQueries.addEmployeeDocument(documentData, db);
      ResponseHelper.success(res, result, 'Document added successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to add document', 500, error.message);
    }
  }

  async updateEmployeeDocument(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, documentId } = req.params;
      const updateData = req.body;

      const result = await employeeQueries.updateEmployeeDocument(documentId, updateData, db);
      if (!result) {
        return ResponseHelper.error(res, 'Document not found', 404);
      }

      ResponseHelper.success(res, result, 'Document updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update document', 500, error.message);
    }
  }

  async deleteEmployeeDocument(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id, documentId } = req.params;
      
      const result = await employeeQueries.deleteEmployeeDocument(documentId, db);
      if (!result) {
        return ResponseHelper.error(res, 'Document not found', 404);
      }

      ResponseHelper.success(res, null, 'Document deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete document', 500, error.message);
    }
  }

  // Personal Details Management
  async getEmployeePersonalDetails(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const personalDetails = await employeeQueries.getEmployeePersonalDetails(id, db);
      ResponseHelper.success(res, personalDetails, 'Personal details retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch personal details', 500, error.message);
    }
  }

  async updateEmployeePersonalDetails(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const personalDetailsData = req.body;
      
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      personalDetailsData.employeeId = id;
      const result = await employeeQueries.upsertEmployeePersonalDetails(personalDetailsData, db);
      ResponseHelper.success(res, result, 'Personal details updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update personal details', 500, error.message);
    }
  }

  // Add new endpoint to employeeController.js
  async updateEmployeeWithConflictResolution(req, res) {
    const { ctx: { db, user } } = req;
    try {
      const { id } = req.params;
      const { data, resolutionStrategy = 'auto' } = req.body;

      // First, detect conflicts
      const conflictCheck = await employeeQueries.detectConflicts(id, data, db);
      
      if (conflictCheck.hasConflicts && resolutionStrategy === 'manual') {
        // Return conflicts to client for manual resolution
        return ResponseHelper.success(res, {
          conflicts: conflictCheck.conflicts,
          serverVersion: conflictCheck.serverVersion,
          message: 'Conflicts detected. Please resolve them before proceeding.'
        }, 'Conflicts detected', 409);
      }

      // Auto-resolve: client wins for all conflicts
      if (conflictCheck.hasConflicts && resolutionStrategy === 'auto') {
        const resolutions = conflictCheck.conflicts.map(conflict => ({
          ...conflict,
          useServerValue: false // Always use client value in auto mode
        }));
        
        const result = await employeeQueries.resolveConflicts(id, resolutions, db);
        return ResponseHelper.success(res, result, 
          'Employee updated with auto-resolved conflicts');
      }

      // No conflicts or client doesn't care about conflicts
      const updateData = {
        ...data,
        _lastModifiedBy: user?.email || 'unknown',
        _expectedVersion: data._expectedVersion
      };

      const result = await employeeQueries.update(id, updateData, db);
      ResponseHelper.success(res, result, 'Employee updated successfully');
      
    } catch (error) {
      if (error.message === 'VERSION_CONFLICT') {
        return ResponseHelper.error(res, 
          'Data was modified by another user. Please refresh and try again.', 
          409
        );
      }
      ResponseHelper.error(res, 'Failed to update employee', 500, error.message);
    }
  }
  
  async executeMultiOperation(operations, db) {
    const executedOperations = [];
    const rollbackSteps = [];

    try {
      for (const operation of operations) {
        const { type, collection, data, employeeId, operationId } = operation;
        
        // Store current state for rollback
        if (type === 'update' || type === 'delete') {
          const currentState = await db.GetDocument(collection, data._key || operationId);
          if (currentState) {
            rollbackSteps.push({
              type: 'restore',
              collection,
              data: currentState,
              operationId: `backup_${operationId}`
            });
          }
        }

        // Execute operation
        let result;
        switch (type) {
          case 'create':
            result = await db.AddDocument(collection, data);
            executedOperations.push({ type: 'create', collection, data: result });
            rollbackSteps.push({
              type: 'delete',
              collection,
              data: { _key: result._key },
              operationId
            });
            break;

          case 'update':
            result = await this.updateWithVersion(
              data._key, 
              data, 
              data._expectedVersion, 
              db
            );
            executedOperations.push({ type: 'update', collection, data: result });
            break;

          case 'delete':
            result = await db.RemoveDocument(collection, operationId);
            executedOperations.push({ type: 'delete', collection, data: { _key: operationId } });
            break;
        }
      }

      return {
        success: true,
        executedOperations,
        rollbackData: rollbackSteps
      };

    } catch (error) {
      // Rollback executed operations
      console.error('Multi-operation failed, rolling back:', error);
      
      for (const rollbackStep of rollbackSteps.reverse()) {
        try {
          switch (rollbackStep.type) {
            case 'restore':
              await db.UpdateDocument(rollbackStep.collection, rollbackStep.data._key, rollbackStep.data);
              break;
            case 'delete':
              await db.RemoveDocument(rollbackStep.collection, rollbackStep.data._key);
              break;
          }
        } catch (rollbackError) {
          console.error('Rollback failed for step:', rollbackStep, rollbackError);
          // Continue with other rollbacks even if one fails
        }
      }

      throw new Error(`MULTI_OPERATION_FAILED: ${error.message}`);
    }
  }

  // Add new endpoint to employeeController.js
  async updateEmployeeProfileSections(req, res) {
    const { ctx: { db, user } } = req;
    try {
      const { id } = req.params;
      const { sections, transactionId = `tx_${Date.now()}` } = req.body;

      // Validate employee exists
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      const operations = [];

      // Convert section updates to operations
      for (const [section, data] of Object.entries(sections)) {
        const operationId = `${transactionId}_${section}`;
        
        switch (section) {
          case 'details':
            operations.push({
              type: 'update',
              collection: 'employees',
              data: {
                ...data,
                _key: id,
                _expectedVersion: data._expectedVersion,
                _lastModifiedBy: user?.email || 'unknown'
              },
              operationId
            });
            break;

          case 'personalDetails':
            const personalDetailsData = {
              ...data,
              employeeId: id,
              _lastModifiedBy: user?.email || 'unknown'
            };
            operations.push({
              type: 'update', // This will be upserted by your existing logic
              collection: 'employee_personal_details',
              data: personalDetailsData,
              operationId: `personal_${id}`
            });
            break;

          case 'addresses':
            // Handle address updates (you might want separate logic for address CRUD)
            for (const address of data.updates || []) {
              operations.push({
                type: address._key ? 'update' : 'create',
                collection: 'employee_addresses',
                data: {
                  ...address,
                  employeeId: id,
                  _lastModifiedBy: user?.email || 'unknown'
                },
                operationId: address._key || operationId
              });
            }
            break;

          // Add other sections as needed
        }
      }

      const result = await this.executeMultiOperation(operations, db);
      
      ResponseHelper.success(res, {
        transactionId,
        success: true,
        message: 'All profile sections updated successfully',
        details: result.executedOperations
      }, 'Profile sections updated successfully');

    } catch (error) {
      if (error.message.includes('MULTI_OPERATION_FAILED')) {
        return ResponseHelper.error(res, 
          'Failed to update some profile sections. Changes have been rolled back.', 
          500, 
          error.message
        );
      }
      if (error.message === 'VERSION_CONFLICT') {
        return ResponseHelper.error(res, 
          'Data was modified by another user. Please refresh and try again.', 
          409
        );
      }
      ResponseHelper.error(res, 'Failed to update profile sections', 500, error.message);
    }
  }

  async getEmployeeCompleteProfile(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const employee = await employeeQueries.findByIdWithCompleteProfile(id, db);

      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, employee, 'Complete employee profile retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch complete profile', 500, error.message);
    }
  }

  async getEmployeeJVAllocationsWithRules(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const jvData = await employeeQueries.getEmployeeJVAllocationsWithRules(id, db);

      if (!jvData.employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, jvData, 'JV allocations with rules retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch JV allocations', 500, error.message);
    }
  }

  async getEmployeePayrollSummary(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const payrollData = await employeeQueries.getEmployeePayrollSummary(id, db);

      if (!payrollData.employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, payrollData, 'Payroll summary retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll summary', 500, error.message);
    }
  }

  async getEmployeeComplianceData(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const { period } = req.query;
      
      const complianceData = await employeeQueries.getEmployeeComplianceData(id, period, db);

      if (!complianceData.employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      ResponseHelper.success(res, complianceData, 'Compliance data retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch compliance data', 500, error.message);
    }
  }

  async searchEmployeesAdvanced(req, res) {
    const { ctx: { db } } = req;
    try {
      const { 
        search, department, status, employmentType, 
        minSalary, maxSalary, jvPartner, joinDateFrom, joinDateTo,
        page = 1, limit = 50 
      } = req.query;

      const filters = {
        search,
        department,
        status,
        employmentType,
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
        jvPartner,
        joinDateFrom,
        joinDateTo
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const employees = await employeeQueries.searchEmployeesAdvanced(filters, pagination, db);

      ResponseHelper.paginated(res, employees, {
        page: pagination.page,
        limit: pagination.limit,
        total: employees.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to search employees', 500, error.message);
    }
  }

  async assignEmployeeToJV(req, res) {
    const { ctx: { db, user } } = req;
    try {
      const { id } = req.params;
      const allocationData = req.body;

      // Validate employee exists
      const employee = await employeeQueries.findById(id, db);
      if (!employee) {
        return ResponseHelper.error(res, 'Employee not found', 404);
      }

      // Add audit fields
      allocationData.employeeId = id;
      allocationData.createdBy = user.userId;
      allocationData.createdAt = new Date().toISOString();
      allocationData.updatedAt = new Date().toISOString();

      const result = await employeeQueries.createJVAllocation(allocationData, db);
      ResponseHelper.success(res, result, 'Employee assigned to JV partner successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to assign employee to JV', 500, error.message);
    }
  }

  async getEmployeePayrollHistory(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const { limit = 12, offset = 0 } = req.query;

      const query = `
        FOR edge IN payroll_employees
        FILTER edge._from == @employeeId
        SORT edge.period DESC
        LIMIT @offset, @limit
        LET payroll = DOCUMENT(edge._to)
        RETURN {
          period: edge.period,
          grossSalary: edge.grossSalary,
          basicSalary: edge.basicSalary,
          allowances: edge.allowances,
          paye: edge.paye,
          pension: edge.pension,
          nhf: edge.nhf,
          nsitf: edge.nsitf,
          totalDeductions: edge.totalDeductions,
          netSalary: edge.netSalary,
          status: payroll.status,
          processedAt: payroll.processedAt,
          payrollRunId: payroll._key
        }
      `;

      const payrollHistory = await db.QueryAll(query, {
        employeeId: `employees/${id}`,
        offset: parseInt(offset),
        limit: parseInt(limit)
      });

      ResponseHelper.success(res, payrollHistory, 'Payroll history retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch payroll history', 500, error.message);
    }
  }
}

module.exports = new EmployeeController();