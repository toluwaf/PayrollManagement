const ResponseHelper = require('../helpers/responseHelper');
const Joi = require('joi');

// Validation schema for positions
const positionValidation = {
  create: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    department: Joi.string().required(),
    grade: Joi.string().valid('Entry', 'Mid', 'Senior', 'Lead', 'Principal', 'Executive').required(),
    baseSalary: Joi.number().min(100000).max(10000000).required(),
    description: Joi.string().max(1000).allow(''),
    requirements: Joi.array().items(Joi.string()).default([]),
    benefits: Joi.array().items(Joi.string()).default([])
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(100),
    department: Joi.string(),
    grade: Joi.string().valid('Entry', 'Mid', 'Senior', 'Lead', 'Principal', 'Executive'),
    baseSalary: Joi.number().min(100000).max(10000000),
    description: Joi.string().max(1000).allow(''),
    requirements: Joi.array().items(Joi.string()),
    benefits: Joi.array().items(Joi.string())
  }).min(1)
};

class PositionController {
  async getAllPositions(req, res) {
    const { ctx: { db } } = req;
    try {
      const { page = 1, limit = 50, department, grade } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let bindVars = { offset, limit };

      if (department) {
        whereConditions.push('p.department == @department');
        bindVars.department = department;
      }
      if (grade) {
        whereConditions.push('p.grade == @grade');
        bindVars.grade = grade;
      }

      const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

      const query = `
        FOR p IN positions
        ${whereClause}
        LET employeeCount = LENGTH(
          FOR e IN employees 
          FILTER e.position == p.title AND e.status == 'active'
          RETURN e
        )
        SORT p.title
        LIMIT @offset, @limit
        RETURN MERGE(p, {
          employeeCount: employeeCount
        })
      `;

      const positions = await db.QueryAll(query, bindVars);

      ResponseHelper.paginated(res, positions, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: positions.length
      });
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch positions', 500, error.message);
    }
  }

  async getPositionById(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const query = `
        LET position = FIRST(
          FOR p IN positions
          FILTER p._key == @id
          RETURN p
        )
        
        LET employees = (
          FOR e IN employees
          FILTER e.position == position.title AND e.status == 'active'
          RETURN {
            _key: e._key,
            name: e.name,
            employeeId: e.employeeId,
            department: e.department,
            salary: e.salary
          }
        )
        
        RETURN MERGE(position, {
          employees: employees,
          employeeCount: LENGTH(employees)
        })
      `;

      const position = await db.QueryFirst(query, { id });
      if (!position) {
        return ResponseHelper.error(res, 'Position not found', 404);
      }

      ResponseHelper.success(res, position, 'Position retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch position', 500, error.message);
    }
  }

  async createPosition(req, res) {
    const { ctx: { db } } = req;
    try {
      const positionData = req.body;

      // Validate input
      const { error } = positionValidation.create.validate(positionData);
      if (error) {
        return ResponseHelper.error(res, 'Validation error', 400, error.details);
      }

      // Check if position title already exists in department
      const existingPositionQuery = `
        FOR p IN positions
        FILTER p.title == @title AND p.department == @department
        RETURN p._key
      `;
      const existingPosition = await db.QueryFirst(existingPositionQuery, {
        title: positionData.title,
        department: positionData.department
      });

      if (existingPosition) {
        return ResponseHelper.error(res, 'Position with this title already exists in the department', 400);
      }

      // Add system fields
      const completePositionData = {
        ...positionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const result = await db.AddDocument('positions', completePositionData);
      ResponseHelper.success(res, result, 'Position created successfully', 201);
    } catch (error) {
      ResponseHelper.error(res, 'Failed to create position', 500, error.message);
    }
  }

  async updatePosition(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate input
      const { error } = positionValidation.update.validate(updateData);
      if (error) {
        return ResponseHelper.error(res, 'Validation error', 400, error.details);
      }

      // Check if position exists
      const existingPosition = await db.GetDocument('positions', id);
      if (!existingPosition) {
        return ResponseHelper.error(res, 'Position not found', 404);
      }

      // If title or department is being updated, check for duplicates
      if (updateData.title || updateData.department) {
        const title = updateData.title || existingPosition.title;
        const department = updateData.department || existingPosition.department;
        
        const duplicateQuery = `
          FOR p IN positions
          FILTER p.title == @title 
          AND p.department == @department
          AND p._key != @id
          RETURN p._key
        `;
        const duplicate = await db.QueryFirst(duplicateQuery, { title, department, id });
        
        if (duplicate) {
          return ResponseHelper.error(res, 'Position with this title already exists in the department', 400);
        }
      }

      updateData.updatedAt = new Date().toISOString();
      const result = await db.UpdateDocument('positions', id, updateData);
      
      ResponseHelper.success(res, result, 'Position updated successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to update position', 500, error.message);
    }
  }

  async deletePosition(req, res) {
    const { ctx: { db } } = req;
    try {
      const { id } = req.params;

      // Check if position has active employees
      const employeesQuery = `
        FOR e IN employees
        FILTER e.position == (
          FOR p IN positions FILTER p._key == @id RETURN p.title
        )[0]
        AND e.status == 'active'
        LIMIT 1
        RETURN e._key
      `;
      const hasEmployees = await db.QueryFirst(employeesQuery, { id });

      if (hasEmployees) {
        return ResponseHelper.error(res, 'Cannot delete position with active employees', 400);
      }

      const result = await db.RemoveDocument('positions', id);
      if (!result) {
        return ResponseHelper.error(res, 'Position not found', 404);
      }

      ResponseHelper.success(res, null, 'Position deleted successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to delete position', 500, error.message);
    }
  }

  async getPositionGrades(req, res) {
    const { ctx: { db } } = req;
    try {
      const query = `
        RETURN UNIQUE(
          FOR p IN positions
          RETURN p.grade
        )
      `;
      const grades = await db.QueryFirst(query);
      ResponseHelper.success(res, grades, 'Position grades retrieved successfully');
    } catch (error) {
      ResponseHelper.error(res, 'Failed to fetch position grades', 500, error.message);
    }
  }
}

module.exports = new PositionController();