// queries/positionQueries.js
class PositionQueries {
  async findAll(filters = {}, pagination = {}, db) {
    const { department, grade, search } = filters;
    const { page = 1, limit = 50 } = pagination;
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
    if (search) {
      whereConditions.push('p.title LIKE @search OR p.description LIKE @search');
      bindVars.search = `%${search}%`;
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

    return await db.QueryAll(query, bindVars);
  }

  async findById(positionId, db) {
    const query = `
      FOR p IN positions
      FILTER p._key == @positionId
      RETURN p
    `;
    return await db.QueryFirst(query, { positionId });
  }

  async findByTitleAndDepartment(title, department, db) {
    const query = `
      FOR p IN positions
      FILTER p.title == @title AND p.department == @department
      RETURN p
    `;
    return await db.QueryFirst(query, { title, department });
  }

  async getPositionsWithEmployeeCount(db) {
    const query = `
      FOR p IN positions
      LET employeeCount = LENGTH(
        FOR e IN employees 
        FILTER e.position == p.title AND e.status == 'active'
        RETURN e
      )
      SORT employeeCount DESC
      RETURN {
        _key: p._key,
        title: p.title,
        department: p.department,
        grade: p.grade,
        baseSalary: p.baseSalary,
        employeeCount: employeeCount
      }
    `;
    return await db.QueryAll(query);
  }
}

module.exports = new PositionQueries();