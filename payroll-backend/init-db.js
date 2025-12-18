const  DataStorage  = require('./helpers/DataStorage');
const getConfig = require('./helpers/Setting');

const SampleDataInitializer  = require('./mockData copy');


(async () => {
    const config = await getConfig();
      
    // Validate datastore config
    if (!config.datastore) {
        throw new Error('Missing datastore configuration');
    }
  
    const db = new DataStorage(config.datastore);
    const dbManager = new SampleDataInitializer (db, config);
    await dbManager.initialize();
})();
