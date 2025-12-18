const  DataStorage  = require('./helpers/DataStorage');
const getConfig = require('./helpers/Setting');
class DataPopulator {
  constructor(db) {
    this.db = db;
  }
    async populateAllData() {
    try {
      console.log('🚀 Starting data population...');

      // // Existing data population
      // await this.populateCompanies();
      // await this.populateUsers();
      // await this.populateEmployees();
      // await this.populatePayrollRuns();
      // await this.populateDeductions();
      
      // // New bank and JV data
      // await this.populateBankData();
      // await this.populateJVPartners();
      // await this.populateJVAgreements();
      // await this.populateAllocationRules();
      
      // // Edge relationships
      // // await this.createEdgeRelationships();
      // await this.createBankAndJVEdgeRelationships();
      // await this.populateEnhancedEmployeeData();
      // await this.populatePayrollSettings();
      await this.populatePAYESettings();
      await this.populateAllSettings();
      // await this.populateApprovalWorkflows();
      // await this.populatePayrollAdjustments();
      // await this.populateTaxConfigurations();
      // await this.createWorkflowApproverEdges();

      console.log('✅ All data populated successfully!');
    } catch (error) {
      console.error('❌ Error populating data:', error);
      throw error;
    }
  }

  async populatePayrollSettings() {
    console.log('⚙️ Populating payroll settings...');

    const payrollSettings = {
      _key: 'current_settings',
      payrollCycle: 'monthly',
      approvalWorkflow: {
        enabled: true,
        requiredApprovals: 2,
        approvers: ['user_2', 'user_3']
      },
      taxSettings: {
        taxYear: 2026,
        effectiveDate: '2026-01-01',
        taxBrackets: [
          { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
          { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
          { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
          { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
          { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
          { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
        ],
        statutoryRates: {
          employeePension: 0.08,
          employerPension: 0.10,
          nhf: 0.025,
          nhis: 0.05,
          nsitf: 0.01,
          itf: 0.01
        },
        reliefs: {
          rentRelief: 0.20,
          rentReliefCap: 500000
        }
      },
      paymentSettings: {
        defaultBank: 'bank_1',
        paymentMethods: ['bank_transfer'],
        processingDays: 3,
        autoGeneratePaymentFiles: true
      },
      notificationSettings: {
        onPayrollProcess: true,
        onApprovalRequired: true,
        onPaymentProcessed: true,
        recipients: ['user_1', 'user_2']
      },
      systemSettings: {
        autoBackup: true,
        backupFrequency: 'weekly',
        dataRetentionMonths: 36
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    await this.db.AddDocument('payroll_settings', payrollSettings);
    console.log('✅ Added payroll settings with NTA 2026 structure');
  }

  async populatePAYESettings() {
    console.log('⚙️ Populating PAYE settings...');

    const payeSettings = {
      _key: 'current_paye_settings',
      taxYear: 2026,
      effectiveDate: '2026-01-01',
      taxBrackets: [
        { min: 0, max: 800000, rate: 0.00, description: 'Tax Free Threshold' },
        { min: 800001, max: 3000000, rate: 0.15, description: 'First Bracket' },
        { min: 3000001, max: 12000000, rate: 0.18, description: 'Second Bracket' },
        { min: 12000001, max: 25000000, rate: 0.21, description: 'Third Bracket' },
        { min: 25000001, max: 50000000, rate: 0.23, description: 'Fourth Bracket' },
        { min: 50000001, max: Infinity, rate: 0.25, description: 'Top Bracket' }
      ],
      statutoryRates: {
        employeePension: 0.08,
        employerPension: 0.10,
        nhf: 0.025,
        nhis: 0.05,
        nsitf: 0.01,
        itf: 0.01
      },
      reliefs: {
        rentRelief: 0.20,
        rentReliefCap: 500000
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    await this.db.AddDocument('paye_settings', payeSettings);
    console.log('✅ Added PAYE settings with NTA 2026 structure');
  }

  // Add a method to run both population functions
  async populateAllSettings() {
    try {
      // Check if settings already exist to avoid duplicates
      const existingPayrollSettings = await this.db.QueryFirst(`
        FOR settings IN payroll_settings
        LIMIT 1
        RETURN settings
      `);

      const existingPAYESettings = await this.db.QueryFirst(`
        FOR settings IN paye_settings
        LIMIT 1
        RETURN settings
      `);

      if (!existingPayrollSettings) {
        await this.populatePayrollSettings();
      } else {
        console.log('ℹ️ Payroll settings already exist, skipping...');
      }

      if (!existingPAYESettings) {
        await this.populatePAYESettings();
      } else {
        console.log('ℹ️ PAYE settings already exist, skipping...');
      }

      console.log('✅ All settings populated successfully');
    } catch (error) {
      console.error('❌ Error populating settings:', error);
      throw error;
    }
  }

  async populateApprovalWorkflows() {
    console.log('📋 Populating approval workflows...');

    const workflows = [
      {
        _key: 'wf_2023_11',
        payrollRunId: 'pr_2023_11',
        currentStep: 2,
        status: 'approved',
        steps: [
          {
            step: 1,
            approverId: 'user_2',
            status: 'approved',
            approvedAt: new Date('2023-11-30').toISOString(),
            comments: 'Payroll calculations verified'
          },
          {
            step: 2,
            approverId: 'user_3',
            status: 'approved',
            approvedAt: new Date('2023-12-01').toISOString(),
            comments: 'Final approval granted'
          }
        ],
        createdAt: new Date('2023-11-30').toISOString(),
        updatedAt: new Date('2023-12-01').toISOString()
      },
      {
        _key: 'wf_2023_12',
        payrollRunId: 'pr_2023_12',
        currentStep: 1,
        status: 'pending',
        steps: [
          {
            step: 1,
            approverId: 'user_2',
            status: 'pending',
            required: true
          },
          {
            step: 2,
            approverId: 'user_3',
            status: 'pending',
            required: true
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const workflow of workflows) {
      await this.db.AddDocument('approval_workflows', workflow);
      console.log(`✅ Added approval workflow: ${workflow._key}`);
    }
  }

  async populatePayrollAdjustments() {
    console.log('💰 Populating payroll adjustments...');

    const adjustments = [
      {
        _key: 'adj_1_2023_11',
        employeeId: 'emp_1',
        payrollRunId: 'pr_2023_11',
        type: 'bonus',
        amount: 50000,
        description: 'Q4 Performance Bonus',
        effectiveDate: '2023-11-30',
        status: 'approved',
        approvedBy: 'user_2',
        taxTreatment: 'taxable',
        createdAt: new Date('2023-11-25').toISOString(),
        updatedAt: new Date('2023-11-25').toISOString()
      },
      {
        _key: 'adj_2_2023_11',
        employeeId: 'emp_2',
        payrollRunId: 'pr_2023_11',
        type: 'overtime',
        amount: 25000,
        description: 'Weekend overtime - Project deadline',
        effectiveDate: '2023-11-30',
        status: 'approved',
        approvedBy: 'user_2',
        taxTreatment: 'taxable',
        createdAt: new Date('2023-11-20').toISOString(),
        updatedAt: new Date('2023-11-20').toISOString()
      },
      {
        _key: 'adj_3_2023_11',
        employeeId: 'emp_3',
        payrollRunId: 'pr_2023_11',
        type: 'loan',
        amount: -15000,
        description: 'Staff loan repayment',
        effectiveDate: '2023-11-30',
        status: 'approved',
        approvedBy: 'user_2',
        taxTreatment: 'non-taxable',
        createdAt: new Date('2023-11-15').toISOString(),
        updatedAt: new Date('2023-11-15').toISOString()
      }
    ];

    for (const adjustment of adjustments) {
      await this.db.AddDocument('payroll_adjustments', adjustment);
      console.log(`✅ Added payroll adjustment: ${adjustment._key}`);
    }
  }

  async populateTaxConfigurations() {
    console.log('🧾 Populating tax configurations...');

    const taxConfigs = [
      {
        _key: 'tax_ng_lagos_2024',
        country: 'Nigeria',
        state: 'Lagos',
        year: 2024,
        active: true,
        payeBands: [
          { min: 0, max: 300000, rate: 7 },
          { min: 300001, max: 600000, rate: 11 },
          { min: 600001, max: 1100000, rate: 15 },
          { min: 1100001, max: 1600000, rate: 19 },
          { min: 1600001, max: 3200000, rate: 21 },
          { min: 3200001, max: Infinity, rate: 24 }
        ],
        pension: {
          employeeRate: 8,
          employerRate: 10
        },
        nhfRate: 2.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'tax_ng_abuja_2024',
        country: 'Nigeria',
        state: 'Abuja',
        year: 2024,
        active: true,
        payeBands: [
          { min: 0, max: 300000, rate: 7 },
          { min: 300001, max: 600000, rate: 11 },
          { min: 600001, max: 1100000, rate: 15 },
          { min: 1100001, max: 1600000, rate: 19 },
          { min: 1600001, max: 3200000, rate: 21 },
          { min: 3200001, max: Infinity, rate: 24 }
        ],
        pension: {
          employeeRate: 8,
          employerRate: 10
        },
        nhfRate: 2.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const taxConfig of taxConfigs) {
      await this.db.AddDocument('tax_configurations', taxConfig);
      console.log(`✅ Added tax configuration: ${taxConfig._key}`);
    }
  }

  async createWorkflowApproverEdges() {
    console.log('🔗 Creating workflow approver edges...');

    const approverEdges = [
      {
        _from: 'users/user_2',
        _to: 'approval_workflows/wf_2023_11',
        role: 'payroll_manager',
        approvalLimit: 5000000,
        department: 'dept_fin',
        createdAt: new Date().toISOString()
      },
      {
        _from: 'users/user_3',
        _to: 'approval_workflows/wf_2023_11',
        role: 'finance_director',
        approvalLimit: 10000000,
        department: 'dept_fin',
        createdAt: new Date().toISOString()
      },
      {
        _from: 'users/user_2',
        _to: 'approval_workflows/wf_2023_12',
        role: 'payroll_manager',
        approvalLimit: 5000000,
        department: 'dept_fin',
        createdAt: new Date().toISOString()
      },
      {
        _from: 'users/user_3',
        _to: 'approval_workflows/wf_2023_12',
        role: 'finance_director',
        approvalLimit: 10000000,
        department: 'dept_fin',
        createdAt: new Date().toISOString()
      }
    ];

    for (const edge of approverEdges) {
      await this.db.AddDocument('workflow_approvers', edge);
    }

    console.log('✅ Workflow approver edges created');
  }

  async populateEnhancedEmployeeData() {
    console.log('👤 Populating enhanced employee data...');

    // Addresses
    const addresses = [
      {
        _key: 'addr_1',
        employeeId: 'emp_1',
        type: 'current',
        address: '123 Main Street, Garki, Abuja',
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
        postalCode: '900001',
        isPrimary: true,
        startDate: '2022-01-15',
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'addr_2',
        employeeId: 'emp_1',
        type: 'permanent',
        address: '456 Home Avenue, Victoria Island, Lagos',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postalCode: '101241',
        isPrimary: false,
        startDate: '2020-03-01',
        endDate: '2022-01-14',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Education
    const education = [
      {
        _key: 'edu_1',
        employeeId: 'emp_1',
        institution: 'University of Lagos',
        qualification: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-06-30',
        grade: 'Second Class Upper',
        certificateUrl: '/certificates/degree.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Employment History
    const employmentHistory = [
      {
        _key: 'hist_1',
        employeeId: 'emp_1',
        position: 'Software Developer',
        department: 'IT Department',
        startDate: '2021-03-01',
        endDate: '2022-01-14',
        salary: 1800000,
        employmentType: 'full-time',
        location: 'Lagos Branch',
        supervisor: 'Sarah Techlead',
        reasonForChange: 'Promotion to current position',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Personal Details
    const personalDetails = [
      {
        _key: 'pd_1',
        employeeId: 'emp_1',
        nationality: 'Nigerian',
        stateOfOrigin: 'Lagos',
        lga: 'Lagos Island',
        nextOfKin: {
          name: 'Mary Doe',
          relationship: 'Spouse',
          phone: '+234-801-234-5678',
          address: '123 Main Street, Garki, Abuja'
        },
        emergencyContact: {
          name: 'James Doe',
          relationship: 'Brother',
          phone: '+234-802-345-6789',
          address: '789 Emergency Lane, Abuja'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Populate all data
    const collections = [
      { name: 'employee_addresses', data: addresses },
      { name: 'employee_education', data: education },
      { name: 'employee_employment_history', data: employmentHistory },
      { name: 'employee_personal_details', data: personalDetails }
    ];

    for (const collection of collections) {
      for (const item of collection.data) {
        await this.db.AddDocument(collection.name, item);
        console.log(`✅ Added ${collection.name}: ${item._key}`);
      }
    }
  }

  async populateCompanies() {
    const companies = [
      {
        _key: 'company_1',
        name: 'NNPC Limited',
        address: 'NNPC Towers, Herbert Macaulay Way, Central Business District, Abuja',
        taxId: 'TIN-001234567',
        phone: '+234-9-460-1000',
        email: 'info@nnpcgroup.com',
        currency: 'NGN',
        createdAt: new Date().toISOString()
      },
      {
        _key: 'company_2', 
        name: 'Shell Nigeria',
        address: 'Shell Industrial Area, Rumubiakani, Port Harcourt',
        taxId: 'TIN-001234568',
        phone: '+234-84-500000',
        email: 'info@shell.com.ng',
        currency: 'NGN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const company of companies) {
      await this.db.AddDocument('companies', company);
      console.log(`✅ Added company: ${company.name}`);
    }
  }

  async populateDepartments() {
    const departments = [
      { _key: 'dept_eng', name: 'Engineering', description: 'Software Engineering Department' },
      { _key: 'dept_fin', name: 'Finance', description: 'Finance and Accounting Department' },
      { _key: 'dept_hr', name: 'Human Resources', description: 'Human Resources Department' },
      { _key: 'dept_sales', name: 'Sales', description: 'Sales and Marketing Department' },
      { _key: 'dept_ops', name: 'Operations', description: 'Operations Department' },
      { _key: 'dept_it', name: 'IT', description: 'Information Technology Department' }
    ];

    for (const dept of departments) {
      await this.db.AddDocument('departments', dept);
      console.log(`✅ Added department: ${dept.name}`);
    }
  }

  async populateUsers() {
    const bcrypt = require('bcryptjs');
    
    const users = [
     {
        _key: 'user_1',
        email: 'admin@payroll.com',
        password: '$2b$10$ExampleHash', // You'll hash this properly
        name: 'System Administrator',
        role: 'hr_admin',
        department: 'dept_hr',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _key: 'user_2',
        email: 'payroll@company.com',
        password: await bcrypt.hash('payroll123', 10),
        name: 'Payroll Manager',
        role: 'payroll_officer',
        department: 'dept_fin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'user_3',
        email: 'finance@company.com',
        password: await bcrypt.hash('finance123', 10),
        name: 'Finance Director',
        role: 'finance_officer',
        department: 'dept_fin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const user of users) {
      await this.db.AddDocument('users', user);
      console.log(`✅ Added user: ${user.name} (${user.role})`);
    }
  }

  async populateEmployees() {
    const employees = [
      {
        _key: 'emp_1',
        employeeId: 'EMP-001',
        name: 'John Doe',
        email: 'john.doe@nnpc.com',
        department: 'dept_eng',
        position: 'Senior Software Engineer',
        salary: 850000,
        basicSalary: 500000,
        housingAllowance: 200000,
        transportAllowance: 80000,
        otherAllowances: 70000,
        status: 'active',
        joinDate: '2022-01-15',
        bankAccount: '0123456789',
        bankName: 'GTBank',
        taxId: 'TIN-001234',
        pensionId: 'PEN-001234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'emp_2',
        employeeId: 'EMP-002',
        name: 'Jane Smith',
        email: 'jane.smith@nnpc.com',
        department: 'dept_fin',
        position: 'Financial Analyst',
        salary: 750000,
        basicSalary: 450000,
        housingAllowance: 180000,
        transportAllowance: 70000,
        otherAllowances: 50000,
        status: 'active',
        joinDate: '2021-03-20',
        bankAccount: '0234567890',
        bankName: 'First Bank',
        taxId: 'TIN-001235',
        pensionId: 'PEN-001235',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'emp_3',
        employeeId: 'EMP-003',
        name: 'Mike Johnson',
        email: 'mike.johnson@nnpc.com',
        department: 'dept_hr',
        position: 'HR Manager',
        salary: 950000,
        basicSalary: 550000,
        housingAllowance: 250000,
        transportAllowance: 90000,
        otherAllowances: 60000,
        status: 'active',
        joinDate: '2020-11-05',
        bankAccount: '0345678901',
        bankName: 'Zenith Bank',
        taxId: 'TIN-001236',
        pensionId: 'PEN-001236',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'emp_4',
        employeeId: 'EMP-004',
        name: 'Sarah Williams',
        email: 'sarah.williams@nnpc.com',
        department: 'dept_sales',
        position: 'Sales Manager',
        salary: 820000,
        basicSalary: 480000,
        housingAllowance: 190000,
        transportAllowance: 85000,
        otherAllowances: 65000,
        status: 'active',
        joinDate: '2022-06-10',
        bankAccount: '0456789012',
        bankName: 'Access Bank',
        taxId: 'TIN-001237',
        pensionId: 'PEN-001237',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'emp_5',
        employeeId: 'EMP-005',
        name: 'David Brown',
        email: 'david.brown@nnpc.com',
        department: 'dept_ops',
        position: 'Operations Manager',
        salary: 880000,
        basicSalary: 520000,
        housingAllowance: 210000,
        transportAllowance: 95000,
        otherAllowances: 55000,
        status: 'active',
        joinDate: '2021-09-15',
        bankAccount: '0567890123',
        bankName: 'Union Bank',
        taxId: 'TIN-001238',
        pensionId: 'PEN-001238',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const emp of employees) {
      await this.db.AddDocument('employees', emp);
      console.log(`✅ Added employee: ${emp.name} (${emp.employeeId})`);
    }
  }

  async populatePayrollRuns() {
    const payrollRuns = [
      {
        _key: 'pr_2023_11',
        period: '2023-11',
        status: 'completed',
        totalEmployees: 5,
        totalGross: 4250000,
        totalDeductions: 850000,
        totalNet: 3400000,
        processedBy: 'user_2',
        processedAt: new Date('2023-11-30').toISOString(),
        breakdown: {
          basicSalary: 2500000,
          allowances: 1250000,
          deductions: 850000,
          netPay: 3400000
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'pr_2023_12',
        period: '2023-12',
        status: 'pending_approval',
        totalEmployees: 5,
        totalGross: 4250000,
        totalDeductions: 850000,
        totalNet: 3400000,
        processedBy: 'user_2',
        processedAt: new Date().toISOString(),
        breakdown: {
          basicSalary: 2500000,
          allowances: 1250000,
          deductions: 850000,
          netPay: 3400000
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const payroll of payrollRuns) {
      await this.db.AddDocument('payroll_runs', payroll);
      console.log(`✅ Added payroll run: ${payroll.period}`);
    }
  }

  async populateDeductions() {
    const deductions = [
      // Employee deductions for November 2023
      {
        _key: 'ded_1_2023_11',
        employeeId: 'emp_1',
        employeeName: 'John Doe',
        period: '2023-11',
        type: 'employee',
        grossSalary: 850000,
        paye: 127500,
        pension: 68000,
        nhf: 12500,
        nsitf: 5000,
        total: 211000,
        status: 'calculated',
        calculatedAt: new Date('2023-11-30').toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _key: 'ded_2_2023_11',
        employeeId: 'emp_2',
        employeeName: 'Jane Smith',
        period: '2023-11',
        type: 'employee',
        grossSalary: 750000,
        paye: 112500,
        pension: 60000,
        nhf: 11250,
        nsitf: 4500,
        total: 188250,
        status: 'calculated',
        calculatedAt: new Date('2023-11-30').toISOString(),
        createdAt: new Date().toISOString()
      },
      // Deduction batch
      {
        _key: 'batch_2023_11',
        period: '2023-11',
        type: 'batch',
        status: 'remitted',
        totalEmployees: 5,
        totals: {
          PAYE: 637500,
          Pension: 340000,
          NHF: 62500,
          NSITF: 25000,
          total: 1065000
        },
        calculatedAt: new Date('2023-11-30').toISOString(),
        remittedAt: new Date('2023-12-10').toISOString(),
        remittedBy: 'user_3',
        remittanceReference: 'REM-2023-11-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const deduction of deductions) {
      await this.db.AddDocument('deductions', deduction);
      console.log(`✅ Added deduction: ${deduction._key}`);
    }
  }

  async createEdgeRelationships() {
    console.log('🔗 Creating edge relationships...');

    // Employee-Department edges
    const empDeptEdges = [
      { _from: 'employees/emp_1', _to: 'departments/dept_eng' },
      { _from: 'employees/emp_2', _to: 'departments/dept_fin' },
      { _from: 'employees/emp_3', _to: 'departments/dept_hr' },
      { _from: 'employees/emp_4', _to: 'departments/dept_sales' },
      { _from: 'employees/emp_5', _to: 'departments/dept_ops' }
    ];

    for (const edge of empDeptEdges) {
      await this.db.AddDocument('employee_department', edge);
    }

    // Payroll-Employee edges for November 2023
    const payrollEmpEdges = [
      {
        _from: 'employees/emp_1',
        _to: 'payroll_runs/pr_2023_11',
        period: '2023-11',
        grossSalary: 850000,
        basicSalary: 500000,
        allowances: 350000,
        paye: 127500,
        pension: 68000,
        nhf: 12500,
        nsitf: 5000,
        totalDeductions: 211000,
        netSalary: 639000,
        linkedAt: new Date().toISOString()
      },
      {
        _from: 'employees/emp_2',
        _to: 'payroll_runs/pr_2023_11',
        period: '2023-11',
        grossSalary: 750000,
        basicSalary: 450000,
        allowances: 300000,
        paye: 112500,
        pension: 60000,
        nhf: 11250,
        nsitf: 4500,
        totalDeductions: 188250,
        netSalary: 561750,
        linkedAt: new Date().toISOString()
      }
    ];

    for (const edge of payrollEmpEdges) {
      await this.db.AddDocument('payroll_employees', edge);
    }

    console.log('✅ Edge relationships created successfully');
  }

  async verifyData() {
    console.log('\n📊 Verifying populated data...');
    
    const collections = ['employees', 'payroll_runs', 'deductions', 'users', 'companies', 'departments'];
    
    for (const collection of collections) {
      try {
        const countQuery = `RETURN LENGTH(${collection})`;
        const count = await this.db.QueryFirst(countQuery);
        console.log(`   ${collection}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collection}: Error - ${error.message}`);
      }
    }

    // Verify edge collections
    const edgeCollections = ['employee_department', 'payroll_employees'];
    for (const edgeCollection of edgeCollections) {
      try {
        const countQuery = `RETURN LENGTH(${edgeCollection})`;
        const count = await this.db.QueryFirst(countQuery);
        console.log(`   ${edgeCollection}: ${count} edges`);
      } catch (error) {
        console.log(`   ${edgeCollection}: Error - ${error.message}`);
      }
    }
  }


  async populateBankData() {
    console.log('🏦 Populating bank data...');

    const banks = [
      {
        _key: 'bank_1',
        name: 'First Bank of Nigeria',
        code: 'FBN',
        swiftCode: 'FBNINGLA',
        fileFormats: ['nibss', 'aba', 'csv'],
        apiEndpoint: 'https://api.firstbank.com/payments',
        status: 'active',
        transferLimit: 5000000,
        processingFee: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'bank_2',
        name: 'Zenith Bank',
        code: 'ZENITH',
        swiftCode: 'ZEIBNGLA',
        fileFormats: ['nibss', 'aba', 'csv'],
        apiEndpoint: 'https://api.zenithbank.com/payments',
        status: 'active',
        transferLimit: 10000000,
        processingFee: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'bank_3',
        name: 'Guaranty Trust Bank',
        code: 'GTB',
        swiftCode: 'GTBINGLA',
        fileFormats: ['nibss', 'aba', 'csv'],
        apiEndpoint: 'https://api.gtbank.com/payments',
        status: 'active',
        transferLimit: 5000000,
        processingFee: 52,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'bank_4',
        name: 'Access Bank',
        code: 'ACCESS',
        swiftCode: 'ACCNGLA',
        fileFormats: ['nibss', 'aba', 'csv'],
        apiEndpoint: 'https://api.accessbank.com/payments',
        status: 'active',
        transferLimit: 5000000,
        processingFee: 48,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'bank_5',
        name: 'United Bank for Africa',
        code: 'UBA',
        swiftCode: 'UBNINGLA',
        fileFormats: ['nibss', 'aba', 'csv'],
        apiEndpoint: 'https://api.ubagroup.com/payments',
        status: 'active',
        transferLimit: 5000000,
        processingFee: 55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const bank of banks) {
      await this.db.AddDocument('banks', bank);
      console.log(`✅ Added bank: ${bank.name}`);
    }
  }

  async populateJVPartners() {
    console.log('🤝 Populating JV partners...');

    const jvPartners = [
      {
        _key: 'jv_nnpc',
        name: 'Nigerian National Petroleum Corporation',
        code: 'NNPC',
        type: 'government',
        allocationPercentage: 60,
        contact: {
          name: 'NNPC Headquarters',
          email: 'accounts@nnpc.gov.ng',
          phone: '+234-9-2340000',
          address: 'NNPC Towers, Herbert Macaulay Way, Central Business District, Abuja'
        },
        taxId: 'TIN-NNPC-001',
        paymentTerms: 'net_30',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'jv_shell',
        name: 'Shell Petroleum Development Company',
        code: 'SHELL',
        type: 'international',
        allocationPercentage: 30,
        contact: {
          name: 'Shell Nigeria Office',
          email: 'finance.shell@shell.com',
          phone: '+234-1-2700000',
          address: 'Shell Industrial Area, Rumubiakani, Port Harcourt'
        },
        taxId: 'TIN-SHELL-001',
        paymentTerms: 'net_45',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'jv_chevron',
        name: 'Chevron Nigeria Limited',
        code: 'CHEVRON',
        type: 'international',
        allocationPercentage: 40,
        contact: {
          name: 'Chevron Nigeria Finance',
          email: 'payments.ng@chevron.com',
          phone: '+234-1-2770000',
          address: 'Chevron Drive, Lekki Peninsula, Lagos'
        },
        taxId: 'TIN-CHEVRON-001',
        paymentTerms: 'net_30',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'jv_total',
        name: 'Total Energies Nigeria',
        code: 'TOTAL',
        type: 'international',
        allocationPercentage: 15,
        contact: {
          name: 'Total Nigeria Finance Department',
          email: 'accounts.ng@totalenergies.com',
          phone: '+234-1-4610000',
          address: 'Total House, Victoria Island, Lagos'
        },
        taxId: 'TIN-TOTAL-001',
        paymentTerms: 'net_30',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'jv_agip',
        name: 'Agip Energy & Natural Resources',
        code: 'AGIP',
        type: 'international',
        allocationPercentage: 20,
        contact: {
          name: 'Agip Nigeria Accounts',
          email: 'finance.agip@agip.com',
          phone: '+234-1-2600000',
          address: 'Agip House, Adeola Odeku Street, Victoria Island, Lagos'
        },
        taxId: 'TIN-AGIP-001',
        paymentTerms: 'net_45',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const partner of jvPartners) {
      await this.db.AddDocument('jv_partners', partner);
      console.log(`✅ Added JV partner: ${partner.name}`);
    }
  }

  async populateJVAgreements() {
    console.log('📝 Populating JV agreements...');

    const agreements = [
      {
        _key: 'agreement_1',
        name: 'NNPC-Shell Joint Venture Agreement',
        description: 'Main joint venture agreement for oil exploration and production',
        effectiveDate: '2023-01-01',
        expirationDate: '2030-12-31',
        status: 'active',
        terms: {
          costRecovery: true,
          profitSharing: true,
          auditRights: true,
          terminationClause: '12_months_notice'
        },
        totalAllocationPercentage: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _key: 'agreement_2',
        name: 'NNPC-Chevron Production Sharing Contract',
        description: 'Production sharing contract for offshore operations',
        effectiveDate: '2023-01-01',
        expirationDate: '2028-12-31',
        status: 'active',
        terms: {
          costRecovery: true,
          profitSharing: true,
          auditRights: true,
          terminationClause: '6_months_notice'
        },
        totalAllocationPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const agreement of agreements) {
      await this.db.AddDocument('jv_agreements', agreement);
      console.log(`✅ Added JV agreement: ${agreement.name}`);
    }
  }

  async populateAllocationRules() {
    console.log('⚖️ Populating allocation rules...');

    const allocationRules = [
      // NNPC-Shell Agreement Rules
      {
        _key: 'rule_1',
        agreementId: 'agreement_1',
        partnerId: 'jv_nnpc',
        department: 'Exploration',
        employeeType: 'all',
        allocationPercentage: 60,
        costCenter: 'NNPC-EXP',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        _key: 'rule_2',
        agreementId: 'agreement_1',
        partnerId: 'jv_shell',
        department: 'Exploration',
        employeeType: 'all',
        allocationPercentage: 30,
        costCenter: 'SHELL-EXP',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        _key: 'rule_3',
        agreementId: 'agreement_1',
        partnerId: 'jv_nnpc',
        department: 'Production',
        employeeType: 'all',
        allocationPercentage: 55,
        costCenter: 'NNPC-PROD',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        _key: 'rule_4',
        agreementId: 'agreement_1',
        partnerId: 'jv_shell',
        department: 'Production',
        employeeType: 'all',
        allocationPercentage: 35,
        costCenter: 'SHELL-PROD',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      
      // NNPC-Chevron Agreement Rules
      {
        _key: 'rule_5',
        agreementId: 'agreement_2',
        partnerId: 'jv_nnpc',
        department: 'Offshore Operations',
        employeeType: 'all',
        allocationPercentage: 60,
        costCenter: 'NNPC-OFF',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        _key: 'rule_6',
        agreementId: 'agreement_2',
        partnerId: 'jv_chevron',
        department: 'Offshore Operations',
        employeeType: 'all',
        allocationPercentage: 40,
        costCenter: 'CHEVRON-OFF',
        effectiveDate: '2023-01-01',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    for (const rule of allocationRules) {
      await this.db.AddDocument('allocation_rules', rule);
      console.log(`✅ Added allocation rule: ${rule.costCenter}`);
    }
  }

  async createBankAndJVEdgeRelationships() {
    console.log('🔗 Creating bank and JV edge relationships...');

    // Agreement-Partner edges
    const agreementPartnerEdges = [
      { _from: 'jv_agreements/agreement_1', _to: 'jv_partners/jv_nnpc' },
      { _from: 'jv_agreements/agreement_1', _to: 'jv_partners/jv_shell' },
      { _from: 'jv_agreements/agreement_2', _to: 'jv_partners/jv_nnpc' },
      { _from: 'jv_agreements/agreement_2', _to: 'jv_partners/jv_chevron' }
    ];

    for (const edge of agreementPartnerEdges) {
      await this.db.AddDocument('agreement_partners', edge);
    }

    console.log('✅ Bank and JV edge relationships created');
  }


  async verifyBankAndJVData() {
    console.log('\n📊 Verifying bank and JV data...');
    
    const newCollections = ['banks', 'jv_partners', 'jv_agreements', 'allocation_rules'];
    
    for (const collection of newCollections) {
      try {
        const countQuery = `RETURN LENGTH(${collection})`;
        const count = await this.db.QueryFirst(countQuery);
        console.log(`   ${collection}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collection}: Error - ${error.message}`);
      }
    }

    // Verify edge collections
    const edgeCollections = ['agreement_partners'];
    for (const edgeCollection of edgeCollections) {
      try {
        const countQuery = `RETURN LENGTH(${edgeCollection})`;
        const count = await this.db.QueryFirst(countQuery);
        console.log(`   ${edgeCollection}: ${count} edges`);
      } catch (error) {
        console.log(`   ${edgeCollection}: Error - ${error.message}`);
      }
    }
  }


}



// Run the population script
async function main() {
  const config = await getConfig();
      
  // Validate datastore config
  if (!config.datastore) {
    throw new Error('Missing datastore configuration');
  }
  
  const db = new DataStorage(config.datastore);
  const populator = new DataPopulator(db);
  
  try {
    await populator.populateAllData();
    await populator.verifyData();
    await populator.verifyBankAndJVData()
    console.log('\n🎉 Data population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Data population failed:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
}

module.exports = DataPopulator;