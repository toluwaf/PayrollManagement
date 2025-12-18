const bunyan = require ('bunyan')
const seq = require ('bunyan-seq')
const _ = require ('lodash')
const getConfig = require("./Setting")

const LogClasses = {
  Debug: 'Debug',
  Trace: 'Trace',
  Account: 'Account',
  Patient: 'Patient',
  Agency: 'Agency',
  Error: 'Error'
}

const ApplyAccountInfo = (message, account) => {
  if (account) {
    message.account = _.pick(account, ['_key', 'FirstName', 'LastName', 'LoginName'])
  }
  return message
}

const ApplyUserInfo = (message, user) => {
  if (user) {
    message.user = _.pick(user, ['_key', 'CodeID', 'Email'])
  }
  return message
}

 const GetDefaultLogger = async () => {
  const config = await getConfig()
  return new Logger(config.logger || {})
}

class Logger {
  constructor ({
    enabled = true,
    level = 'trace',
    serverURL = 'http://35.176.85.23:5341',
    serverAPIKey = '9t4L1VVog1YTLc4RtidX',
    serverAPIURL = 'http://35.176.85.23:8090/api'
  }) {
    const streams = []

    if (enabled) {
      streams.push(seq.createStream( { level: 'info', stream: process.stdout }))
      streams.push(seq.createStream({
        type: 'raw',
        stream: seq.createStream({
         serverUrl: serverURL,
        apiKey: serverAPIKey,
          })
        }))
       streams.push(seq.createStream({
        serverUrl: serverURL,
        apiKey: serverAPIKey,
        level: level || 'trace'
      }))
    }

    this._log = bunyan.createLogger({
      name: 'KeyInventory',
      
      streams: streams
    })

    this._account = null
    this._user = null
    this._apiurl = serverAPIURL
  }

  SetUser (user) {
    this._user = user
  }

  SetAccount (account) {
    this._account = account
  }

  Error (message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Debug,
      tag: tag,
      data: data
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.error(messageProps, message)
  }

  Trace (message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Trace,
      tag: tag,
      data: data
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.trace(messageProps, message)
  }

  Debug (message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Debug,
      tag: tag,
      data: data
    }
    //ApplyAccountInfo(messageProps, this._account)
    //ApplyUserInfo(messageProps, this._user)

    this._log.debug(messageProps, message)
  }

  Warn(message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Warn,  // Using the new Warn class
      tag: tag,
      data: data
    };
    
    ApplyAccountInfo(messageProps, this._account);
    ApplyUserInfo(messageProps, this._user);

    this._log.warn(messageProps, message);
  }

  AccountEvent (accountKey, message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Account,
      tag: tag,
      data: data,
      classKey: accountKey
    }
    ApplyAccountInfo(messageProps, this._account)

    this._log.info(messageProps, message)
  }

  PatientEvent (patientKey, message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Patient,
      tag: tag,
      data: data,
      classKey: patientKey
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.info(messageProps, message)
  }

  PhysicianEvent (PhysicianKey, message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Patient,
      tag: tag,
      data: data,
      classKey: PhysicianKey
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.info(messageProps, message)
  }

  AgencyEvent (agencyKey, message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Agency,
      tag: tag,
      data: data,
      classKey: agencyKey
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.info(messageProps, message)
  }

  ReportEvent (agencyKey, message, data = {}, tag = 'Any') {
    const messageProps = {
      class: LogClasses.Agency,
      tag: tag,
      data: data,
      classKey: agencyKey
    }
    ApplyAccountInfo(messageProps, this._account)
    ApplyUserInfo(messageProps, this._user)

    this._log.info(messageProps, message)
  }

  GetApiUrl () {
    return this._apiurl || 'http://localhost:7002/api'
  }
}

module.exports = {GetDefaultLogger,Logger, ApplyUserInfo, ApplyAccountInfo, LogClasses}