const  DataStorage  = require('./helpers/DataStorage');
const getConfig = require('./helpers/Setting');

class DatabaseManager {
  constructor() {
    this.config = null;
    this.dataStorage = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      // Load your existing configuration
      this.config = await getConfig();
      
      // Initialize DataStorage with your config
      this.dataStorage = new DataStorage(this.config.datastore);
      
      // Test connection
      await this.testConnection();
      await this.initializeCollections();
      
      this.isConnected = true;
      console.log('✅ Database connected successfully');
      return this.dataStorage;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      // Simple query to test connection
      const result = await this.dataStorage.QueryFirst('RETURN "Connection successful"');
      console.log('📊 Database connection test:', result);
    } catch (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  async initializeCollections() {
    const collections = [
      // Document collections
      { name: 'employees', type: 'document' },
      { name: 'payroll_runs', type: 'document' },
      { name: 'deductions', type: 'document' },
      { name: 'users', type: 'document' },
      { name: 'companies', type: 'document' },
      { name: 'departments', type: 'document' },
      
      // Edge collections for relationships
      { name: 'employee_department', type: 'edge' },
      { name: 'payroll_employees', type: 'edge' },
      { name: 'user_roles', type: 'edge' }
    ];

    for (const col of collections) {
      try {
        if (col.type === 'edge') {
          await this.dataStorage.CreateEdgeCollection(col.name, this.config.datastore);
        } else {
          await this.dataStorage.CreateCollection(col.name, this.config.datastore);
        }
        console.log(`✅ Collection ${col.name} initialized`);
      } catch (error) {
        if (!error.message.includes('duplicate name')) {
          console.error(`❌ Error initializing ${col.name}:`, error.message);
        }
      }
    }

    // Create indexes for better performance
    await this.createIndexes();
  }

  async createIndexes() {
    const indexes = [
      // { collection: 'employees', fields: ['employeeId'], options: { unique: true } },
      // { collection: 'employees', fields: ['email'], options: { unique: true } },
      // { collection: 'employees', fields: ['department', 'status'] },
      // { collection: 'payroll_runs', fields: ['period'], options: { unique: true } },
      // { collection: 'users', fields: ['email'], options: { unique: true } },
      // { collection: 'deductions', fields: ['employeeId', 'period'] },
      { collection: 'deductions', fields: ['period', 'type'] },
    
      { collection: 'deductions', fields: ['type', 'status'] },
      { collection: 'deductions', fields: ['remittanceType', 'remittedAt'] }
    ];

    for (const index of indexes) {
      try {
        await this.dataStorage.CreateCollectionIndex(
          index.collection, 
          index.fields, 
          index.options, 
          this.config.datastore
        );
        console.log(`✅ Index created for ${index.collection} on ${index.fields.join(', ')}`);
      } catch (error) {
        console.error(`❌ Error creating index for ${index.collection}:`, error.message);
      }
    }
  }

  getDataStorage() {
    if (!this.isConnected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.dataStorage;
  }

  getConfig() {
    return this.config;
  }
}


module.exports = DatabaseManager;


// class SampleDataInitializer {
//   constructor() {
//     this.db = databaseManager.getDataStorage();
//   }

//   async initialize() {
//     try {
//       console.log('📥 Initializing sample data...');
      
//       await this.initializeCompanies();
//       await this.initializeDepartments();
//       await this.initializeEmployees();
//       await this.initializeUsers();
      
//       console.log('✅ Sample data initialized successfully');
//     } catch (error) {
//       console.error('❌ Sample data initialization failed:', error);
//     }
//   }

//   async initializeCompanies() {
//     const companies = [
//       {
//         _key: 'company_1',
//         name: 'NNPC Limited',
//         address: 'NNPC Towers, Herbert Macaulay Way, Central Business District, Abuja',
//         taxId: 'TIN-001234567',
//         phone: '+234-9-460-1000',
//         email: 'info@nnpcgroup.com',
//         currency: 'NGN',
//         createdAt: new Date().toISOString()
//       }
//     ];

//     for (const company of companies) {
//       await this.db.AddDocument('companies', company);
//     }
//   }

//   async initializeDepartments() {
//     const departments = [
//       { _key: 'dept_eng', name: 'Engineering', description: 'Software Engineering Department' },
//       { _key: 'dept_fin', name: 'Finance', description: 'Finance and Accounting Department' },
//       { _key: 'dept_hr', name: 'Human Resources', description: 'Human Resources Department' },
//       { _key: 'dept_sales', name: 'Sales', description: 'Sales and Marketing Department' },
//       { _key: 'dept_ops', name: 'Operations', description: 'Operations Department' },
//       { _key: 'dept_it', name: 'IT', description: 'Information Technology Department' }
//     ];

//     for (const dept of departments) {
//       await this.db.AddDocument('departments', dept);
//     }
//   }

//   async initializeEmployees() {
//     const employees = [
//       {
//         _key: 'emp_1',
//         employeeId: 'EMP-001',
//         name: 'John Doe',
//         email: 'john.doe@nnpc.com',
//         department: 'dept_eng',
//         position: 'Senior Software Engineer',
//         salary: 850000,
//         basicSalary: 500000,
//         housingAllowance: 200000,
//         transportAllowance: 80000,
//         otherAllowances: 70000,
//         status: 'active',
//         joinDate: '2022-01-15',
//         bankAccount: '0123456789',
//         bankName: 'GTBank',
//         taxId: 'TIN-001234',
//         pensionId: 'PEN-001234',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       }
//       // Add more sample employees as needed
//     ];

//     for (const emp of employees) {
//       await this.db.AddDocument('employees', emp);
//     }
//   }

//   async initializeUsers() {
//     const users = [
//       {
//         _key: 'user_1',
//         email: 'admin@payroll.com',
//         password: '$2b$10$ExampleHash', // You'll hash this properly
//         name: 'System Administrator',
//         role: 'hr_admin',
//         department: 'dept_hr',
//         isActive: true,
//         createdAt: new Date().toISOString()
//       }
//     ];

//     for (const user of users) {
//       await this.db.AddDocument('users', user);
//     }
//   }
// }