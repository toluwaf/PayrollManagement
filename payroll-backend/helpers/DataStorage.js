const { Database } =require ('arangojs')
// const { MessageBuilder } =require ('./FunctionResult')
const _ =require ('lodash')

class DataStorage {
  constructor (config) {
    this.Config = config
    this.Conn = null
  }

  Connection (config) {
    if (config instanceof Database) {
      return config
    }
    if (this.Conn instanceof Database) {
      return this.Conn
    }
    const lconfig = config || this.Config

    this.Conn = this.BuildConnection(lconfig)
    return this.Conn
  }

  GetConfig () {
    return _.clone(this.Config)
  }

  NewConnection (dbname) {
    if (this.Conn instanceof Database) {
      return this.Conn.database(dbname)
    } else {
      throw new Error('Can not create new connection because there is no initial connection establish.')
    }
  }

  BuildConnection ({ dbhost, dbport, dbuser, dbpassword, dbname, dbsecure }) {
    const ret = new Database({
      url: `http${dbsecure ? 's' : ''}://${dbhost}:${dbport}`,
      databaseName: dbname
    })
    ret.useBasicAuth(dbuser, dbpassword)
    return ret
  }

  async QueryNoReturn (query, args, config) {
    try {
      let conn = this.Connection(config)

      if (args) {
        if (_.isArray(args)) {
          await conn.query({ query: query, bindVars: _.merge({}, ...args) })
        } else {
          await conn.query({ query: query, bindVars: args })
        }
      } else {
        await conn.query(query)
      }
    } catch (err) {
      throw new Error(`Query No Return command failed with error: ${err.Message || err.message}`)
    }
  }

  async QueryFirst (query, args, config) {
    try {
      let conn = this.Connection(config)

      if (args) {
        if (_.isArray(args)) {
          const cursor = await conn.query({ query: query, bindVars: _.merge({}, ...args) })
          return cursor.next()
        } else {
          const cursor = await conn.query({ query: query, bindVars: args })
          return cursor.next()
        }
      } else {
        const cursor = await conn.query(query)
        return cursor.next()
      }
    } catch (err) {
      throw new Error(`Query First command failed with error: ${err.Message || err.message}`)
    }
  }

  async QueryAll (query, args, config) {
    try {
      let conn = this.Connection(config)

      if (args) {
        if (_.isArray(args)) {
          const cursor = await conn.query({ query: query, bindVars: _.merge({}, ...args) })
          return cursor.all()
        } else {
          const cursor = await conn.query({ query: query, bindVars: args })
          return cursor.all()
        }
      } else {
        const cursor = await conn.query(query)
        return cursor.all()
      }
    } catch (err) {
      throw new Error(`Query All command failed with error: ${err.Message ?? err.message}`)
    }
  }

  BuildQueryField (name, value, operator, group, parameterName) {
    return {
      Name: name,
      Value: value,
      Operator: operator || 'EQUALS',
      Group: group || 'AND',
      ParameterName: parameterName
    }
  }

  BuildQueryLimitClause (limit, skip) {
    const Limit = _.isInteger(limit) ? limit : 25
    const Skip = _.isInteger(skip) ? skip : 0
    if (Skip === 0) {
      return `LIMIT ${Limit}`
    } else {
      return `LIMIT ${Skip * Limit}, ${Limit}`
    }
  }

  BuildQuerySortClause (identifier, field, desc) {
    if (!field) {
      return ''
    }

    if (_.includes(field, ':') === false) {
      return `SORT ${identifier}.${field}`
    }

    const fieldParts = _.split(field, ';')
    const fieldStatements = _.map(fieldParts, (fp) => {
      if (_.includes(fp, ':')) {
        const fpParts = _.split(fp, ':')
        return `${identifier}.${fpParts[0]} ${fpParts[1]}`
      } else {
        return fp
      }
    })
    return `SORT ${_.join(fieldStatements, ',')}`
  }

  BuildQueryFilterClause (identifier, fieldList, bodyOnly = false) {
    if (!_.isArray(fieldList)) {
      throw new Error('field list must be an array')
    }
    if (_.isEmpty(fieldList)) {
      return {
        Text: '',
        Params: {}
      }
    }
    try {
      let filterGroups = new Map()
      filterGroups.set('OR', [])
      filterGroups.set('MUST', [])
      filterGroups.set('AND', [])
      let queryData = {}
      let paramPostNumber = 1
      for (var f of fieldList) {
        if (f.Value === f.DefaultValue) {
          // don't render if default value
          return
        }

        let paramName = f.ParameterName || f.Name

        if (_.has(queryData, paramName)) {
          paramName = `${paramName}${paramPostNumber}`
          paramPostNumber++
        }
        const valueIsString = _.isString(f.Value)
        queryData[paramName] = valueIsString ? _.toLower(f.Value) : f.Value
        const leftSideString = `LOWER(${identifier}.${f.Name})`
        const leftSideRaw = `${identifier}.${f.Name}`
        let currentFilter = null
        switch (f.Group) {
          case 'AND':
            currentFilter = filterGroups.get('AND')
            break
          case 'OR':
            currentFilter = filterGroups.get('OR')
            break
          case 'MUST':
            currentFilter = filterGroups.get('MUST')
            break
          default:
            if (filterGroups.has(f.Group) === false) {
              filterGroups.set(f.Group, [])
            }
            currentFilter = filterGroups.get(f.Group)
            break
        }
        switch (f.Operator) {
          case 'EQUALS':
            currentFilter.push(`${valueIsString ? leftSideString : leftSideRaw} == @${paramName}`)
            break
          case 'NOTEQUALS':
            currentFilter.push(`${valueIsString ? leftSideString : leftSideRaw} != @${paramName}`)
            break
          case 'LESSTHAN':
            currentFilter.push(`${leftSideRaw} < @${paramName}`)
            break
          case 'LESSTHANEQUAL':
            currentFilter.push(`${leftSideRaw} <= @${paramName}`)
            break
          case 'GREATERTHAN':
            currentFilter.push(`${leftSideRaw} > @${paramName}`)
            break
          case 'GREATERTHANEQUAL':
            currentFilter.push(`${leftSideRaw} >= @${paramName}`)
            break
          case 'IN':
            currentFilter.push(`${valueIsString ? leftSideString : leftSideRaw} IN @${paramName}`)
            queryData[paramName] = _.map(f.Value, (v) => { return _.toLower(v) })
            break
          case 'NOTIN':
            currentFilter.push(`${valueIsString ? leftSideString : leftSideRaw} NOT IN @${paramName}`)
            queryData[paramName] = _.map(f.Value, (v) => { return _.toLower(v) })
            break
          case 'CONTAINS':
            currentFilter.push(`${valueIsString ? leftSideString : leftSideRaw} LIKE @${paramName}`)
            queryData[paramName] = `%${_.toLower(f.Value)}%`
            break
          case 'STARTSWITH':
            currentFilter.push(`${leftSideString} LIKE @${paramName}`)
            queryData[paramName] = `${_.toLower(f.Value)}%`
            break
          case 'ENDSWITH':
            currentFilter.push(`${leftSideString} LIKE @${paramName}`)
            queryData[paramName] = `%${_.toLower(f.Value)}`
            break
          case 'MATCHES':
            currentFilter.push(`${identifier}.${f.Name} =~ @${paramName}`)
            break
          case 'NOTMATCHES':
            currentFilter.push(`${identifier}.${f.Name} !~ @${paramName}`)
            break
          case 'ANYIN':
            currentFilter.push(`${identifier}.${f.Name} ANY IN @${paramName}`)
            queryData[paramName] = _.map(f.Value, (v) => { return _.toLower(v) })
            break
        }
      }

      let filterText = []
      const groupKeys = filterGroups.keys()

      for (var groupKey of groupKeys) {
        const keyParts = _.split(groupKey, '_')
        const keyOperator = keyParts[0]
        const groupFilter = filterGroups.get(groupKey) || []

        if (groupFilter.length > 0) {
          if (keyOperator === 'OR') {
            filterText.push(' (' + _.join(groupFilter, ' || ') + ') ')
          } else if (keyOperator === 'AND') {
            filterText.push(' (' + _.join(groupFilter, ' && ') + ') ')
          } else {
            throw Error('Invalid Query Group Key Operator!')
          }
        }
      }

      let ret = {
        Text: '',
        Params: queryData
      }

      if (filterText.length > 0) {
        if (bodyOnly) {
          ret.Text = '&& ' + _.join(filterText, ' && ') + ' '
        } else {
          ret.Text = 'Filter ' + _.join(filterText, ' && ') + ' '
        }
      }

      return ret
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async Reset (config) {
    try {
      let conn = this.Connection(config)
      const collections = await conn.listCollections()

      _.forEach(collections, async (c) => {
        const collection = conn.collection(c.name)
        await collection.drop()
      })
    } catch (err) {
      throw new Error(`Reset Database command failed with error: ${err.Message || err.message}`)
    }
  }

  async CreateDatabase (dbName, dbUser = 'root', dbPassword = '@Test24', config) {
    try {
      let conn = this.Connection(config)
      const names = await conn.listDatabases()

      if (_.indexOf(names, dbName) === -1) {
        await conn.createDatabase(dbName, [{ username: 'root', passwd: dbPassword, active: true, extra: { grant: 'rw' } }])
      }
    } catch (err) {
      throw new Error(`Create Database '${dbName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async CreateCollection (colName, config) {
    try {
      let conn = this.Connection(config)
      const collection = conn.collection(colName)
      await collection.create()
    } catch (err) {
      if (err.message !== 'duplicate name') {
        throw new Error(`Create Collection '${colName}' command failed with error: ${err.Message || err.message}`)
      }
    }
  }

  async CreateCollectionIndex (colName, fields, options, config) {
    try {
      let conn = this.Connection(config)
      const collection = conn.collection(colName)
      const results = await collection.ensureIndex({ type: 'hash', fields: fields, ...options })

      if (results.errors > 0) {
        const messages = _.join(results.details, '; ')
        throw new Error(`Create Collection index '${colName}' command failed with error: ${messages}`)
      }
    } catch (err) {
      throw new Error(`Create Collection index '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async CreateEdgeCollection (colName, config) {
    try {
      let conn = this.Connection(config)
      const collection = conn.collection(colName)
      await collection.create({ type: 3 }) // EDGE_COLLECTION
    } catch (err) {
      if (err.message !== 'duplicate name') {
        throw new Error(`Create Edge Collection '${colName}' command failed with error: ${err.Message || err.message}`)
      }
    }
  }

  async AddToCollection (colName, values, forceReplace = false, config) {
    try {
      let conn = this.Connection(config)
      let data = []

      if (_.isArray(values)) {
        data = _.concat(values)
      } else {
        data.push(values)
      }

      const collection = conn.collection(colName)

      let info = await collection.count()

      if (forceReplace === true && info.count > 0) {
        await collection.truncate()
      }

      const results = await collection.import(data, { details: true })

      if (results.errors > 0) {
        const messages = _.join(results.details, '; ')
        throw new Error(`Add To Collection '${colName}' command failed with error: ${messages}`)
      }
    } catch (err) {
      throw new Error(`Add To Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async AddToEdgeCollection (colName, values, forceReplace = false, config) {
    try {
      let conn = this.Connection(config)
      let data = []

      if (_.isArray(values)) {
        data = _.concat(values)
      } else {
        data.push(values)
      }

      const collection = conn.collection(colName)

      let info = await collection.count()

      if (forceReplace === true && info.count > 0) {
        await collection.truncate()
      }

      const results = await collection.import(data, { details: true })

      if (results.errors > 0) {
        const messages = _.join(results.details, '; ')
        throw new Error(`Add To Edge Collection '${colName}' command failed with error: ${messages}`)
      }
    } catch (err) {
      throw new Error(`Add To Edge Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async listCollections(config) {
    try {
      const conn = this.Connection(config);
      return await conn.listCollections();
    } catch (err) {
      throw new Error(`List collections failed: ${err.message}`);
    }
  }

  async getCollection(collectionName) {
    try {
      const conn = this.Connection();
      return conn.collection(collectionName);
    } catch (err) {
      throw new Error(`Collection retrieval failed: ${err.message}`);
    }
  }

  async getSampleDocument(collectionName) {
    try {
      const query = `
        FOR doc IN @@collection
        LIMIT 1
        RETURN doc
      `;
      return await this.QueryFirst(query, { '@collection': collectionName });
    } catch (err) {
      if (err.message.includes('not found')) return null;
      throw new Error(`Sample document retrieval failed: ${err.message}`);
    }
  }
  
  async getCollectionFields(collectionName) {
    try {
      const conn = this.Connection();
      const collection = conn.collection(collectionName);
      const cursor = await collection.all({ limit: 1 });
      const sampleDoc = await cursor.next();
      
      if (!sampleDoc) return [];
      
      return Object.keys(sampleDoc).map(key => ({
        name: key,
        type: this.getFieldType(sampleDoc[key])
      }));
    } catch (err) {
      throw new Error(`Field retrieval failed: ${err.message}`);
    }
  }

  getFieldType(value) {
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  async GetDocument (colName, key, opts, config) {
    try {
      let conn = this.Connection(config)

      const collection = conn.collection(colName)
      const fopts = _.merge({ graceful: true }, opts)
      const doc = await collection.document(key, fopts)
      return doc
    } catch (err) {
      throw new Error(`Get Document in Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async AddDocument (colName, document, opts, config) {
    try {
      let conn = this.Connection(config)
      let newDocument = document
      if (_.isArray(document)) {
        newDocument = _.merge({}, ...document)
      }

      const collection = conn.collection(colName)
      const fopts = _.merge({ waitForSync: true, returnNew: true }, opts)
      const doc = await collection.save(newDocument, fopts)
      return doc.new
    } catch (err) {
      throw new Error(`Get Document in Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async UpdateDocument (colName, keyId, document, opts, config) {
    try {
      let conn = this.Connection(config)

      const collection = conn.collection(colName)
      const fopts = _.merge({ waitForSync: true, returnNew: true }, opts)
      const results = await collection.update(keyId, document, fopts)

      if (results.errors > 0) {
        const messages = _.join(results.details, '; ')
        throw new Error(`Update document in Collection '${colName}' command failed with error: ${messages}`)
      }
      return results.new
    } catch (err) {
      throw new Error(`Update Document in Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }

  async RemoveDocument (colName, key, opts, config) {
    try {
      let conn = this.Connection(config)

      const collection = conn.collection(colName)
      const fopts = _.merge({ waitForSync: true }, opts)
      const doc = await collection.remove(key, fopts)
      return doc
    } catch (err) {
      throw new Error(`Remove Document in Collection '${colName}' command failed with error: ${err.Message || err.message}`)
    }
  }
  
  // ========== TRANSACTION SUPPORT ==========
  
  async beginTransaction(config) {
    try {
      let conn = this.Connection(config);
      // ArangoDB transactions are handled per query, but we can simulate transaction blocks
      // For true transactions, we'll use AQL transactions
      return { 
        _id: `tx_${Date.now()}`,
        startedAt: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Begin transaction failed: ${err.message}`);
    }
  }

  async commitTransaction(transactionId, config) {
    // In ArangoDB, transactions are auto-committed unless using AQL transactions
    // This is mainly for interface consistency
    return { success: true, transactionId };
  }

  async rollbackTransaction(transactionId, config) {
    // ArangoDB doesn't support rollback for individual operations outside AQL transactions
    // This is for interface consistency
    console.warn(`Transaction ${transactionId} rollback requested - ArangoDB auto-commits individual operations`);
    return { success: true, transactionId };
  }

  async executeTransaction(operations, config) {
    try {
      let conn = this.Connection(config);
      
      // Build transaction AQL
      const action = `
        function (params) {
          const db = require('@arangodb').db;
          ${operations.map((op, index) => this.buildOperationAQL(op, index)).join('\n')}
          return { success: true, operations: ${operations.length} };
        }
      `;

      const result = await conn.transaction({
        collections: {
          write: [...new Set(operations.map(op => op.collection))]
        },
        action: action,
        params: { operations }
      });

      return result;
    } catch (err) {
      throw new Error(`Transaction execution failed: ${err.message}`);
    }
  }

  buildOperationAQL(operation, index) {
    const { type, collection, data, key } = operation;
    
    switch (type) {
      case 'insert':
        return `db.${collection}.save(params.operations[${index}].data);`;
      case 'update':
        return `db.${collection}.update(params.operations[${index}].key, params.operations[${index}].data);`;
      case 'remove':
        return `db.${collection}.remove(params.operations[${index}].key);`;
      case 'upsert':
        return `
          var existing = db.${collection}.firstExample({ _key: params.operations[${index}].key });
          if (existing) {
            db.${collection}.update(params.operations[${index}].key, params.operations[${index}].data);
          } else {
            db.${collection}.save(params.operations[${index}].data);
          }
        `;
      default:
        return '';
    }
  }

  // ========== BATCH OPERATIONS ==========

  async BatchInsert(colName, documents, opts = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      
      const results = await collection.saveAll(documents, {
        waitForSync: true,
        returnNew: true,
        ...opts
      });

      return results.map(result => result.new || result);
    } catch (err) {
      throw new Error(`Batch insert to '${colName}' failed: ${err.message}`);
    }
  }

  async BatchUpdate(colName, updates, opts = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      
      const results = await collection.updateAll(updates, {
        waitForSync: true,
        returnNew: true,
        ...opts
      });

      return results.map(result => result.new || result);
    } catch (err) {
      throw new Error(`Batch update in '${colName}' failed: ${err.message}`);
    }
  }

  async BatchRemove(colName, keys, opts = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      
      const results = await collection.removeAll(keys, {
        waitForSync: true,
        ...opts
      });

      return results;
    } catch (err) {
      throw new Error(`Batch remove from '${colName}' failed: ${err.message}`);
    }
  }

  // ========== ADVANCED QUERY OPERATIONS ==========

  async FindByExample(colName, example, options = {}, config) {
    try {
      const { limit = 50, offset = 0, sort = {} } = options;
      
      let query = `FOR doc IN ${colName}`;
      const bindVars = {};
      
      // Build filter from example
      const filterConditions = [];
      Object.keys(example).forEach((key, index) => {
        const paramName = `param${index}`;
        filterConditions.push(`doc.${key} == @${paramName}`);
        bindVars[paramName] = example[key];
      });
      
      if (filterConditions.length > 0) {
        query += ` FILTER ${filterConditions.join(' && ')}`;
      }
      
      // Add sorting
      if (Object.keys(sort).length > 0) {
        const sortClauses = Object.keys(sort).map(field => 
          `doc.${field} ${sort[field] === -1 ? 'DESC' : 'ASC'}`
        );
        query += ` SORT ${sortClauses.join(', ')}`;
      }
      
      // Add pagination
      query += ` LIMIT @offset, @limit RETURN doc`;
      bindVars.offset = offset;
      bindVars.limit = limit;

      return await this.QueryAll(query, bindVars, config);
    } catch (err) {
      throw new Error(`Find by example in '${colName}' failed: ${err.message}`);
    }
  }

  async FindOneByExample(colName, example, config) {
    try {
      const results = await this.FindByExample(colName, example, { limit: 1 }, config);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      throw new Error(`Find one by example in '${colName}' failed: ${err.message}`);
    }
  }

  async Count(colName, filter = {}, config) {
    try {
      let query = `RETURN LENGTH(${colName})`;
      
      if (Object.keys(filter).length > 0) {
        query = `FOR doc IN ${colName}`;
        const conditions = [];
        const bindVars = {};
        
        Object.keys(filter).forEach((key, index) => {
          const paramName = `param${index}`;
          conditions.push(`doc.${key} == @${paramName}`);
          bindVars[paramName] = filter[key];
        });
        
        query += ` FILTER ${conditions.join(' && ')} COLLECT WITH COUNT INTO length RETURN length`;
        return await this.QueryFirst(query, bindVars, config);
      }
      
      return await this.QueryFirst(query, {}, config);
    } catch (err) {
      throw new Error(`Count documents in '${colName}' failed: ${err.message}`);
    }
  }

  async Aggregate(colName, pipeline, config) {
    try {
      // Convert MongoDB-like aggregation pipeline to AQL
      const aqlQuery = this.buildAQLFromPipeline(colName, pipeline);
      return await this.QueryAll(aqlQuery.query, aqlQuery.bindVars, config);
    } catch (err) {
      throw new Error(`Aggregation in '${colName}' failed: ${err.message}`);
    }
  }

  buildAQLFromPipeline(collectionName, pipeline) {
    let query = `FOR doc IN ${collectionName}`;
    const bindVars = {};
    let bindVarCounter = 0;

    pipeline.forEach((stage, index) => {
      const stageType = Object.keys(stage)[0];
      const stageValue = stage[stageType];

      switch (stageType) {
        case '$match':
          const conditions = this.buildMatchConditions(stageValue, bindVars, bindVarCounter);
          query += ` FILTER ${conditions.condition}`;
          Object.assign(bindVars, conditions.bindVars);
          bindVarCounter = conditions.bindVarCounter;
          break;

        case '$group':
          query += this.buildGroupStage(stageValue, bindVars, bindVarCounter);
          break;

        case '$sort':
          const sortClauses = Object.keys(stageValue).map(field => 
            `doc.${field} ${stageValue[field] === -1 ? 'DESC' : 'ASC'}`
          );
          query += ` SORT ${sortClauses.join(', ')}`;
          break;

        case '$limit':
          query += ` LIMIT ${stageValue}`;
          break;

        case '$skip':
          query += ` LIMIT ${stageValue}, 1000000`; // Large number to effectively skip
          break;

        case '$project':
          query += this.buildProjectStage(stageValue);
          break;
      }
    });

    query += ` RETURN doc`;
    return { query, bindVars };
  }

  buildMatchConditions(match, bindVars, counter) {
    const conditions = [];
    
    Object.keys(match).forEach(key => {
      const value = match[key];
      const paramName = `match${counter}`;
      
      if (typeof value === 'object' && value !== null) {
        // Handle operators like $eq, $gt, etc.
        Object.keys(value).forEach(operator => {
          const operatorParam = `match${counter}_${operator}`;
          bindVars[operatorParam] = value[operator];
          
          switch (operator) {
            case '$eq':
              conditions.push(`doc.${key} == @${operatorParam}`);
              break;
            case '$ne':
              conditions.push(`doc.${key} != @${operatorParam}`);
              break;
            case '$gt':
              conditions.push(`doc.${key} > @${operatorParam}`);
              break;
            case '$gte':
              conditions.push(`doc.${key} >= @${operatorParam}`);
              break;
            case '$lt':
              conditions.push(`doc.${key} < @${operatorParam}`);
              break;
            case '$lte':
              conditions.push(`doc.${key} <= @${operatorParam}`);
              break;
            case '$in':
              conditions.push(`doc.${key} IN @${operatorParam}`);
              break;
            case '$nin':
              conditions.push(`doc.${key} NOT IN @${operatorParam}`);
              break;
          }
        });
      } else {
        // Simple equality
        bindVars[paramName] = value;
        conditions.push(`doc.${key} == @${paramName}`);
      }
      counter++;
    });

    return {
      condition: conditions.join(' && '),
      bindVars,
      bindVarCounter: counter
    };
  }

  // ========== HR MODULE SPECIFIC QUERIES ==========

  async FindEmployeesByDepartment(departmentId, options = {}, config) {
    try {
      const { page = 1, limit = 50, status = 'active' } = options;
      const offset = (page - 1) * limit;

      const query = `
        FOR employee IN employees
        FILTER employee.department == @departmentId
        FILTER employee.status == @status
        LIMIT @offset, @limit
        RETURN MERGE(employee, {
          departmentName: (
            FOR dept IN departments FILTER dept._key == employee.department 
            RETURN dept.name
          )[0]
        })
      `;

      return await this.QueryAll(query, {
        departmentId,
        status,
        offset,
        limit
      }, config);
    } catch (err) {
      throw new Error(`Find employees by department failed: ${err.message}`);
    }
  }

  async FindEmployeesWithSalaryRange(minSalary, maxSalary, options = {}, config) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      const query = `
        FOR employee IN employees
        FILTER employee.salary >= @minSalary
        FILTER employee.salary <= @maxSalary
        FILTER employee.status == 'active'
        SORT employee.salary DESC
        LIMIT @offset, @limit
        RETURN {
          _key: employee._key,
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department,
          position: employee.position,
          salary: employee.salary,
          employmentType: employee.employmentType
        }
      `;

      return await this.QueryAll(query, {
        minSalary,
        maxSalary,
        offset,
        limit
      }, config);
    } catch (err) {
      throw new Error(`Find employees by salary range failed: ${err.message}`);
    }
  }

  async GetEmployeeFullProfile(employeeId, config) {
    try {
      const query = `
        LET employee = FIRST(
          FOR e IN employees
          FILTER e._key == @employeeId OR e.employeeId == @employeeId
          RETURN e
        )
        
        LET department = FIRST(
          FOR d IN departments
          FILTER d._key == employee.department
          RETURN d
        )
        
        LET addresses = (
          FOR a IN employee_addresses
          FILTER a.employeeId == employee._key
          SORT a.isPrimary DESC, a.startDate DESC
          RETURN a
        )
        
        LET education = (
          FOR edu IN employee_education
          FILTER edu.employeeId == employee._key
          SORT edu.startDate DESC
          RETURN edu
        )
        
        LET employmentHistory = (
          FOR eh IN employee_employment_history
          FILTER eh.employeeId == employee._key
          SORT eh.startDate DESC
          RETURN eh
        )
        
        LET documents = (
          FOR doc IN employee_documents
          FILTER doc.employeeId == employee._key
          SORT doc.uploadDate DESC
          RETURN doc
        )
        
        LET personalDetails = FIRST(
          FOR pd IN employee_personal_details
          FILTER pd.employeeId == employee._key
          RETURN pd
        )
        
        LET contracts = (
          FOR c IN employee_contracts
          FILTER c.employeeId == employee._key
          SORT c.startDate DESC
          RETURN c
        )
        
        LET jvAllocations = (
          FOR j IN employee_jv_allocations
          FILTER j.employeeId == employee._key
          RETURN j
        )
        
        RETURN MERGE(employee, {
          departmentDetail: department,
          addresses: addresses,
          education: education,
          employmentHistory: employmentHistory,
          documents: documents,
          personalDetails: personalDetails,
          contracts: contracts,
          jvAllocations: jvAllocations
        })
      `;

      return await this.QueryFirst(query, { employeeId }, config);
    } catch (err) {
      throw new Error(`Get employee full profile failed: ${err.message}`);
    }
  }

  async SearchEmployees(searchTerm, filters = {}, options = {}, config) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      let query = `
        FOR employee IN employees
        FILTER (
          employee.name LIKE @searchTerm OR 
          employee.employeeId LIKE @searchTerm OR 
          employee.email LIKE @searchTerm OR
          employee.position LIKE @searchTerm
        )
      `;

      const bindVars = {
        searchTerm: `%${searchTerm}%`,
        offset,
        limit
      };

      // Add additional filters
      if (filters.department) {
        query += ` AND employee.department == @department`;
        bindVars.department = filters.department;
      }

      if (filters.status) {
        query += ` AND employee.status == @status`;
        bindVars.status = filters.status;
      }

      if (filters.employmentType) {
        query += ` AND employee.employmentType == @employmentType`;
        bindVars.employmentType = filters.employmentType;
      }

      query += `
        LIMIT @offset, @limit
        RETURN MERGE(employee, {
          departmentName: (
            FOR dept IN departments FILTER dept._key == employee.department 
            RETURN dept.name
          )[0]
        })
      `;

      return await this.QueryAll(query, bindVars, config);
    } catch (err) {
      throw new Error(`Employee search failed: ${err.message}`);
    }
  }

  async GetDepartmentStatistics(departmentId = null, config) {
    try {
      const query = `
        LET allEmployees = (
          FOR employee IN employees
          ${departmentId ? 'FILTER employee.department == @departmentId' : ''}
          RETURN employee
        )
        
        LET activeEmployees = (
          FOR employee IN allEmployees
          FILTER employee.status == 'active'
          RETURN employee
        )
        
        LET totalSalary = SUM(
          FOR employee IN activeEmployees
          RETURN employee.salary
        )
        
        LET avgSalary = totalSalary / LENGTH(activeEmployees)
        
        LET employmentTypes = (
          FOR employee IN activeEmployees
          COLLECT type = employee.employmentType WITH COUNT INTO count
          RETURN { type: type, count: count }
        )
        
        RETURN {
          totalEmployees: LENGTH(allEmployees),
          activeEmployees: LENGTH(activeEmployees),
          inactiveEmployees: LENGTH(allEmployees) - LENGTH(activeEmployees),
          totalSalary: totalSalary,
          averageSalary: avgSalary,
          employmentTypeBreakdown: employmentTypes
        }
      `;

      const bindVars = departmentId ? { departmentId } : {};
      return await this.QueryFirst(query, bindVars, config);
    } catch (err) {
      throw new Error(`Get department statistics failed: ${err.message}`);
    }
  }

  async UpsertDocument(colName, matchCriteria, updateData, opts = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);

      // First try to find existing document
      const existingQuery = `
        FOR doc IN ${colName}
        ${this.buildFilterClauseFromCriteria(matchCriteria)}
        LIMIT 1
        RETURN doc
      `;

      const existing = await this.QueryFirst(existingQuery, matchCriteria, config);

      if (existing) {
        // Update existing
        return await this.UpdateDocument(colName, existing._key, updateData, opts, config);
      } else {
        // Insert new
        const newDocument = { ...matchCriteria, ...updateData };
        return await this.AddDocument(colName, newDocument, opts, config);
      }
    } catch (err) {
      throw new Error(`Upsert document in '${colName}' failed: ${err.message}`);
    }
  }

  buildFilterClauseFromCriteria(criteria) {
    const conditions = Object.keys(criteria).map(key => 
      `doc.${key} == @${key}`
    );
    return conditions.length > 0 ? `FILTER ${conditions.join(' && ')}` : '';
  }

  // ========== INDEX MANAGEMENT ==========

  async ListIndexes(colName, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      return await collection.indexes();
    } catch (err) {
      throw new Error(`List indexes for '${colName}' failed: ${err.message}`);
    }
  }

  async CreateUniqueIndex(colName, fields, options = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      
      const results = await collection.ensureIndex({
        type: 'hash',
        fields: fields,
        unique: true,
        ...options
      });

      if (results.errors > 0) {
        const messages = results.details ? _.join(results.details, '; ') : 'Unknown error';
        throw new Error(`Create unique index '${colName}' failed: ${messages}`);
      }
      
      return results;
    } catch (err) {
      throw new Error(`Create unique index '${colName}' failed: ${err.message}`);
    }
  }

  async CreateTextIndex(colName, fields, options = {}, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      
      const results = await collection.ensureIndex({
        type: 'fulltext',
        fields: fields,
        ...options
      });

      if (results.errors > 0) {
        const messages = results.details ? _.join(results.details, '; ') : 'Unknown error';
        throw new Error(`Create text index '${colName}' failed: ${messages}`);
      }
      
      return results;
    } catch (err) {
      throw new Error(`Create text index '${colName}' failed: ${err.message}`);
    }
  }

  // ========== UTILITY METHODS ==========

  async CollectionExists(colName, config) {
    try {
      let conn = this.Connection(config);
      const collections = await conn.listCollections();
      return collections.some(c => c.name === colName);
    } catch (err) {
      throw new Error(`Check collection existence failed: ${err.message}`);
    }
  }

  async GetCollectionStats(colName, config) {
    try {
      let conn = this.Connection(config);
      const collection = conn.collection(colName);
      const count = await collection.count();
      const figures = await collection.figures();
      
      return {
        count: count.count,
        figures: figures
      };
    } catch (err) {
      throw new Error(`Get collection stats for '${colName}' failed: ${err.message}`);
    }
  }

  async BackupCollection(colName, backupName = null, config) {
    try {
      const backupCollectionName = backupName || `${colName}_backup_${Date.now()}`;
      
      // Create backup collection
      await this.CreateCollection(backupCollectionName, config);
      
      // Copy data to backup
      const query = `
        FOR doc IN ${colName}
        INSERT doc INTO ${backupCollectionName}
      `;
      
      await this.QueryNoReturn(query, {}, config);
      
      return {
        backupCollection: backupCollectionName,
        message: `Backup created successfully`
      };
    } catch (err) {
      throw new Error(`Backup collection '${colName}' failed: ${err.message}`);
    }
  }
}

module.exports = DataStorage;
