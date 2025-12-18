class SampleDataInitializer {
  constructor(db, config) {
    this.db = db;
    this.config = config;
  }

  async initialize() {
    try {
      console.log('📥 Initializing sample data...');
      
      // await this.initializeCompanies();
      // await this.initializeDepartments();
      // await this.initializeEmployees();
      // await this.initializeUsers();
      // await this.createIndexes();

      await this.initializeBankAndJVCollections(); // Add this line
      // await this.createIndexes();

      
      console.log('✅ Sample data initialized successfully');
    } catch (error) {
      console.error('❌ Sample data initialization failed:', error);
    }
  }

    
  async initializeBankAndJVCollections() {
    const newCollections = [
      // // Bank Disbursement Collections
      // { name: 'banks', type: 'document' },
      // { name: 'payment_batches', type: 'document' },
      // { name: 'payment_transactions', type: 'document' },
      // { name: 'bank_files', type: 'document' },
      
      // // JV Allocations Collections  
      // { name: 'jv_partners', type: 'document' },
      // { name: 'jv_agreements', type: 'document' },
      // { name: 'jv_allocations', type: 'document' },
      // { name: 'allocation_rules', type: 'document' },
      
      // // Edge Collections for Relationships
      // { name: 'payroll_payment_batches', type: 'edge' },
      // { name: 'batch_transactions', type: 'edge' },
      // { name: 'agreement_partners', type: 'edge' },
      // { name: 'payroll_jv_allocations', type: 'edge' }

      // Employee Collections
      // { name: 'employee_addresses', type: 'document' },
      // { name: 'employee_education', type: 'document' },
      // { name: 'employee_employment_history', type: 'document' },
      // { name: 'employee_documents', type: 'document' },
      // { name: 'employee_personal_details', type: 'document' }
      // { name: 'positions', type: 'document' },
      // { name: 'settings', type: 'document' },
      // { name: 'employee_leave', type: 'document' }
      { name: 'payroll_settings', type: 'document' },
      { name: 'approval_workflows', type: 'document' },
      { name: 'payroll_adjustments', type: 'document' },
      { name: 'tax_configurations', type: 'document' },
      { name: 'workflow_approvers', type: 'edge' }
    ];

    for (const col of newCollections) {
      try {
        if (col.type === 'edge') {
          await this.db.CreateEdgeCollection(col.name, this.config.datastore);
        } else {
          await this.db.CreateCollection(col.name, this.config.datastore);
        }
        console.log(`✅ Collection ${col.name} initialized`);
      } catch (error) {
        if (!error.message.includes('duplicate name')) {
          console.error(`❌ Error initializing ${col.name}:`, error.message);
        }
      }
    }

    // Create indexes for better performance
    await this.createBankAndJVIndexes();
  }

  async createBankAndJVIndexes() {
    const indexes = [
      // Bank indexes
      // { collection: 'banks', fields: ['code'], options: { unique: true } },
      // { collection: 'payment_batches', fields: ['payroll_run_id'] },
      // { collection: 'payment_batches', fields: ['period', 'status'] },
      // { collection: 'payment_transactions', fields: ['payment_batch_id', 'status'] },
      // { collection: 'payment_transactions', fields: ['employee_id', 'period'] },
      // { collection: 'bank_files', fields: ['payment_batch_id'] },
      
      // // JV indexes
      // { collection: 'jv_partners', fields: ['code'], options: { unique: true } },
      // { collection: 'jv_agreements', fields: ['status', 'effective_date'] },
      // { collection: 'jv_allocations', fields: ['payroll_run_id', 'partner_id'] },
      // { collection: 'allocation_rules', fields: ['agreement_id', 'department'] }

      // Employee indexes
      // { collection: 'employee_addresses', fields: ['employeeId', 'type'] },
      // { collection: 'employee_addresses', fields: ['employeeId', 'isPrimary'] },
      // { collection: 'employee_education', fields: ['employeeId', 'institution'] },
      // { collection: 'employee_employment_history', fields: ['employeeId', 'startDate'] },
      // { collection: 'employee_documents', fields: ['employeeId', 'type'] },
      // { collection: 'employee_documents', fields: ['employeeId', 'expiryDate'] },
      // { collection: 'employee_personal_details', fields: ['employeeId'] }
      // { collection: 'positions', fields: ['title', 'department'], options: { unique: true } },
      // { collection: 'positions', fields: ['department'] },
      // { collection: 'positions', fields: ['grade'] },
      // { collection: 'settings', fields: ['type'], options: { unique: true } },
      // { collection: 'employee_leave', fields: ['employeeId', 'startDate'] },

      // Add to your database initialization

      // Payroll Settings
      { collection: 'payroll_settings', fields: ['_key'], options: { unique: true } },
      
      // Approval Workflows
      { collection: 'approval_workflows', fields: ['payrollRunId'], options: { unique: true } },
      { collection: 'approval_workflows', fields: ['status'] },
      { collection: 'approval_workflows', fields: ['currentStep'] },
      
      // Payroll Adjustments
      { collection: 'payroll_adjustments', fields: ['employeeId', 'payrollRunId'] },
      { collection: 'payroll_adjustments', fields: ['payrollRunId', 'type'] },
      { collection: 'payroll_adjustments', fields: ['employeeId', 'status'] },
      { collection: 'payroll_adjustments', fields: ['type', 'status'] },
      
      // Tax Configurations
      { collection: 'tax_configurations', fields: ['country', 'state', 'year'], options: { unique: true } },
      { collection: 'tax_configurations', fields: ['active'] },
      
      // Workflow Approvers (Edge)
      { collection: 'workflow_approvers', fields: ['_from', '_to'], options: { unique: true } },
      { collection: 'workflow_approvers', fields: ['role'] }
      
    ];

    for (const index of indexes) {
      try {
        await this.db.CreateCollectionIndex(
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


  // async createIndexes() {
  //   const indexes = [
  //     { collection: 'employees', fields: ['employeeId'], options: { unique: true } },
  //     { collection: 'employees', fields: ['email'], options: { unique: true } },
  //     { collection: 'employees', fields: ['department', 'status'] },
  //     { collection: 'payroll_runs', fields: ['period'], options: { unique: true } },
  //     { collection: 'users', fields: ['email'], options: { unique: true } },
  //     { collection: 'deductions', fields: ['employeeId', 'period'] },
  //     { collection: 'deductions', fields: ['period', 'type'] },
    
  //     { collection: 'deductions', fields: ['type', 'status'] },
  //     { collection: 'deductions', fields: ['remittanceType', 'remittedAt'] }
  //   ];

  //   for (const index of indexes) {
  //     try {
  //       await this.db.CreateCollectionIndex(
  //         index.collection, 
  //         index.fields, 
  //         index.options, 
  //       );
  //       console.log(`✅ Index created for ${index.collection} on ${index.fields.join(', ')}`);
  //     } catch (error) {
  //       console.error(`❌ Error creating index for ${index.collection}:`, error.message);
  //     }
  //   }
  // }

  // async initializeCompanies() {
  //   const companies = [
  //     {
  //       _key: 'company_1',
  //       name: 'NNPC Limited',
  //       address: 'NNPC Towers, Herbert Macaulay Way, Central Business District, Abuja',
  //       taxId: 'TIN-001234567',
  //       phone: '+234-9-460-1000',
  //       email: 'info@nnpcgroup.com',
  //       currency: 'NGN',
  //       createdAt: new Date().toISOString()
  //     }
  //   ];

  //   for (const company of companies) {
  //     await this.db.AddDocument('companies', company);
  //   }
  // }

  // async initializeDepartments() {
  //   const departments = [
  //     { _key: 'dept_eng', name: 'Engineering', description: 'Software Engineering Department' },
  //     { _key: 'dept_fin', name: 'Finance', description: 'Finance and Accounting Department' },
  //     { _key: 'dept_hr', name: 'Human Resources', description: 'Human Resources Department' },
  //     { _key: 'dept_sales', name: 'Sales', description: 'Sales and Marketing Department' },
  //     { _key: 'dept_ops', name: 'Operations', description: 'Operations Department' },
  //     { _key: 'dept_it', name: 'IT', description: 'Information Technology Department' }
  //   ];

  //   for (const dept of departments) {
  //     await this.db.AddDocument('departments', dept);
  //   }
  // }

  // async initializeEmployees() {
  //   const employees = [
  //     {
  //       _key: 'emp_1',
  //       employeeId: 'EMP-001',
  //       name: 'John Doe',
  //       email: 'john.doe@nnpc.com',
  //       department: 'dept_eng',
  //       position: 'Senior Software Engineer',
  //       salary: 850000,
  //       basicSalary: 500000,
  //       housingAllowance: 200000,
  //       transportAllowance: 80000,
  //       otherAllowances: 70000,
  //       status: 'active',
  //       joinDate: '2022-01-15',
  //       bankAccount: '0123456789',
  //       bankName: 'GTBank',
  //       taxId: 'TIN-001234',
  //       pensionId: 'PEN-001234',
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString()
  //     }
  //     // Add more sample employees as needed
  //   ];

  //   for (const emp of employees) {
  //     await this.db.AddDocument('employees', emp);
  //   }
  // }

  // async initializeUsers() {
  //   const users = [
  //     {
  //       _key: 'user_1',
  //       email: 'admin@payroll.com',
  //       password: '$2b$10$ExampleHash', // You'll hash this properly
  //       name: 'System Administrator',
  //       role: 'hr_admin',
  //       department: 'dept_hr',
  //       isActive: true,
  //       createdAt: new Date().toISOString()
  //     }
  //   ];

  //   for (const user of users) {
  //     await this.db.AddDocument('users', user);
  //   }
  // }
}


module.exports = SampleDataInitializer;