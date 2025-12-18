const sql = require('mssql');

class QueryResult {
    constructor(data) {
        this.rows = data;
    }
    FirstOrDefault() {
        return this.rows.length > 0 ? this.rows[0] : null;
    }
}
class SQLDataStorage{
    constructor (config) {
        config = {...config, options: {
            encrypt: true, 
            trustServerCertificate: true,
        } }
      this.config = config
    }

 async queryDatabase(query, params = {}) {
    let pool;
    try {
        pool = await sql.connect(this.config);
        const request = pool.request();
        Object.keys(params).forEach((key) => {
            request.input(key, params[key]);
        });
        const result = await request.query(query);
        return  new QueryResult(result.recordset)
    } catch (err) {
        console.error('Database query error:', err);
        // 
        //NEED TO ADD LOGGER
        //
    } finally {
        if (pool) {
            pool.close(); 
        }
    }
}
}
module.exports = SQLDataStorage;