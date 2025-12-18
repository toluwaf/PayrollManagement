const DataStorage  = require('./DataStorage')
const SQLDataStorage = require('./DataSqlHelper')
const { Logger } = require('./Logger')
const jwt = require('jsonwebtoken')

const SetupRequestVariables = (app, getConfig) => {
  app.use(async (req, res, next) => {
    const cfg = await getConfig()
    if (cfg) {
      const ctx = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        agentstring: req.headers['user-agent'],
        user: null
      }
      
      // Extract and verify JWT token if present
      const token = req.header('Authorization')?.replace('Bearer ', '')
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
          ctx.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
          }
        } catch (error) {
          // Token is invalid, but we don't throw error here
          // Let individual routes handle authentication requirements
          console.warn('Invalid JWT token:', error.message)
        }
      }
      
      if (cfg.datastore) {
        ctx.db = new DataStorage(cfg.datastore)
      }

      if (cfg.sqldatastore) {
        ctx.sqldb = new SQLDataStorage(cfg.sqldatastore)
      }

      if (cfg.security) {
        ctx.jwtsecret = cfg.security.jwtsecret
        ctx.pwhashsalt = cfg.security.pwhashsalt
        ctx.ciphersecret = cfg.security.ciphersecret
      }

      // if (cfg.logger) {
      //   ctx.log = await new Logger(cfg.logger)
      //   ctx.log.Debug('Logger Created');
      //   // console.log('Logger Created')
      //   // console.log('Logger Config', cfg.logger)
      //   // console.log('Logger', ctx.log)
      // }
      
      req.ctx = ctx
    } else {
      req.ctx = {}
    }
    next()
  })
}

module.exports = SetupRequestVariables
