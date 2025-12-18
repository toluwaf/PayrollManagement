const DataStorage = require('../helpers/DataStorage');
const SQLDataStorage = require('../helpers/DataSqlHelper');
const getConfig = require('../helpers/Setting');


let dbInstance = null;
let SQLdbInstance = null;

async function initializeDB() {
  try {
    const config = await getConfig();
    dbInstance = new DataStorage(config.datastore);
    await dbInstance.QueryNoReturn('RETURN 1'); // Test connection
    return dbInstance;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

function getDB() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDB first');
  }
  return dbInstance;
}


/**
 * Initialize a datastore connection (Arango or SQL).
 * Chooses backend based on config.type
 */
async function initializeSQLDB() {
  try {
    const config = await getConfig();
    SQLdbInstance = new SQLDataStorage(config.sqldatastore);
    // await testSQLConnection(dbInstance);

    console.log(`✅ Database initialized`);
    return SQLdbInstance;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}



function getSQLDB() {
  if (!SQLdbInstance) {
    throw new Error('Database not initialized. Call initializeDB first.');
  }
  return SQLdbInstance;
}

async function ensureDBInitialized() {
  if (!dbInstance) {
    await initializeDB();
  }
  return dbInstance;
}
module.exports = { initializeDB, initializeSQLDB, getDB, getSQLDB, ensureDBInitialized };




// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('✅ MongoDB connected successfully:', mongoose.connection.db.databaseName);
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { connectDB};