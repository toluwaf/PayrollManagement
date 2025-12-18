const _ =require ('lodash')

const getConfig = async () => {
      staticConfig = {
        environment: process.env.NODE_ENV || 'debug',
        debug: {
          skipSignUpEmails: process.env.debugSkipSignUpEmails || false,
          skipSignUpTexts: process.env.debugskipSignUpTexts || false
        },
        datastore: {
          dbname: process.env.datastoreDBName || 'Payroll',
          dbport: parseInt(process.env.datastoreDBPort) || 8529,
          dbhost: process.env.datastoreDBHost || '18.216.2.5',
          dbuser: process.env.datastoreDBUser || 'root',
          dbpassword: process.env.datastoreDBPassword || '@Test24',
          dbsecure: process.env.datastoreSecure || false
        },
        sqldatastore: {
          user: process.env.sqldatastoreDBName ||'admin',
          password: process.env.sqldatastoreDBPassword ||'HAUgAstInestonswITYPetANd',
          server: process.env.sqldatastoreDBHost ||'hivedata.c1szsvwlgsja.eu-west-2.rds.amazonaws.com',
          database: process.env.sqldatastoreDBName ||'HiveNAPIMSData',
        },
        security: {
          jwtsecret: process.env.securityJWTSecret || 'woiuanldslkfjaiousdflkj',
          pwhashsalt: parseInt(process.env.securityPWHashsalt) || 10,
          ciphersecret: process.env.securityCipherSecret || '4b591d57cdf8472c96b135309ba93b71'
        },
        logger: {
          enabled: process.env.loggerEnabled || true,
          level: process.env.loggerLevel || 'trace',
          serverURL: process.env.loggerServerURL || 'http://35.176.85.23:5341',
          serverAPIKey: process.env.loggerServerAPIKey || '9t4L1VVog1YTLc4RtidX',
          serverAPIURL: process.env.loggerServerAPIURL || 'http://35.176.85.23:8090/api'
        },
        cors: {
          origin: process.env.corsOrigin || 'http://localhost:3001'
        }
      }
    return _.clone(staticConfig)
  }

  module.exports = getConfig
  