class EmployeeQueries {
  async findAll(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { department, status, search, jvPartner } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let bindVars = { offset, limit };

    if (department) {
      whereConditions.push('e.department == @department');
      bindVars.department = department;
    }
    if (status) {
      whereConditions.push('e.status == @status');
      bindVars.status = status;
    }
    if (jvPartner) {
      whereConditions.push('@jvPartner IN e.jvPartners');
      bindVars.jvPartner = jvPartner;
    }
    if (search) {
      whereConditions.push('(e.name LIKE @search OR e.employeeId LIKE @search OR e.email LIKE @search)');
      bindVars.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0 ? `FILTER ${whereConditions.join(' AND ')}` : '';

    const query = `
      FOR e IN employees
      ${whereClause}
      LIMIT @offset, @limit
      RETURN {
        _key: e._key,
        employeeId: e.employeeId,
        name: e.name,
        email: e.email,
        department: e.department,
        position: e.position,
        salary: e.salary,
        basicSalary: e.basicSalary,
        housingAllowance: e.housingAllowance,
        transportAllowance: e.transportAllowance,
        status: e.status,
        joinDate: e.joinDate,
        bankAccount: e.bankAccount,
        bankName: e.bankName,
        taxId: e.taxId,
        pensionId: e.pensionId,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      }
    `;

    // const query = `
    //   FOR e IN employees
    //   ${whereClause}
    //   LIMIT @offset, @limit
    //   RETURN MERGE(e, {
    //     departmentName: (
    //       FOR d IN departments FILTER d._key == e.department RETURN d.name
    //     )[0]
    //   })
    // `;

    return await db.QueryAll(query, bindVars);
  }

  async findById(employeeId, db) {
    const query = `
      FOR e IN employees
      FILTER e._key == @employeeId OR e.employeeId == @employeeId
      RETURN e
    `;

    const result = await db.QueryFirst(query, { employeeId });
    return result || null;
  }

  
  // New: Get employee WITH eligibility assessment data
  async findByIdWithEligibility(employeeId, db) {
    const query = `
      FOR e IN employees
      FILTER e._key == @employeeId OR e.employeeId == @employeeId
      LET eligibility = e.eligibilityAssessment ? {
        success: e.eligibilityAssessment.success,
        assessment: e.eligibilityAssessment.assessment,
        summary: e.eligibilityAssessment.summary,
        optimalDeductions: e.eligibilityAssessment.optimalDeductions,
        complianceWarnings: e.eligibilityAssessment.complianceWarnings || [],
        requiredDocs: e.eligibilityAssessment.requiredDocs || []
      } : null
      
      RETURN MERGE(e, {
        eligibilityAssessment: eligibility,
        // Ensure exemptions object is properly structured
        exemptions: e.exemptions ? e.exemptions : {},
        // Parse date strings to Date objects for calculations
        dateOfBirth: IS_DATESTRING(e.dateOfBirth) ? DATE(e.dateOfBirth) : e.dateOfBirth,
        joinDate: IS_DATESTRING(e.joinDate) ? DATE(e.joinDate) : e.joinDate
      })
    `;
    
    const result = await db.QueryFirst(query, { employeeId });
    
    if (result) {
      // Calculate age for eligibility checks
      if (result.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(result.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        result.age = age;
        
        // Set age-based exemption flags
        if (!result.exemptions) result.exemptions = {};
        result.exemptions.isAboveSixty = age >= 60;
        result.exemptions.isAboveSixtyFive = age >= 65;
      }
      
      // Map housing situation to legacy exemptions for compatibility
      if (result.housingSituation && !result.exemptions.receivesCompanyProvidedHousing) {
        if (result.housingSituation === 'renting') {
          result.exemptions.rentsPrimaryResidence = true;
          result.exemptions.isHomeOwner = false;
        } else if (result.housingSituation === 'owner') {
          result.exemptions.rentsPrimaryResidence = false;
          result.exemptions.isHomeOwner = true;
        } else if (result.housingSituation === 'company') {
          result.exemptions.receivesCompanyProvidedHousing = true;
        }
      }
      
      // Map disability status
      if (result.hasDisability) {
        result.exemptions.isPersonWithDisability = true;
        result.exemptions.disabilityCategory = result.disabilityCategory;
      }
      
      // Map NHF exemption
      if (result.exemptFromNHF) {
        result.exemptions.nhfExempt = true;
        result.exemptions.nhfExemptionReason = result.nhfExemptionReason;
      }
    }
    
    return result || null;
  }

  // New: Get all active employees WITH eligibility data
  async findAllActiveWithEligibility(db, filters = {}) {
    let filterConditions = 'FILTER e.status == "active"';
    const bindVars = {};
    
    // Add additional filters if provided
    if (filters.department) {
      filterConditions += ' AND e.department == @department';
      bindVars.department = filters.department;
    }
    
    if (filters.employmentType) {
      filterConditions += ' AND e.employmentType == @employmentType';
      bindVars.employmentType = filters.employmentType;
    }
    
    const query = `
      FOR e IN employees
      ${filterConditions}
      LET eligibility = e.eligibilityAssessment ? {
        success: e.eligibilityAssessment.success,
        assessment: e.eligibilityAssessment.assessment,
        summary: e.eligibilityAssessment.summary,
        optimalDeductions: e.eligibilityAssessment.optimalDeductions,
        complianceWarnings: e.eligibilityAssessment.complianceWarnings || [],
        requiredDocs: e.eligibilityAssessment.requiredDocs || []
      } : null
      
      LET processedEmployee = MERGE(e, {
        eligibilityAssessment: eligibility,
        exemptions: e.exemptions ? e.exemptions : {}
      })
      
      RETURN processedEmployee
    `;
    
    const results = await db.QueryAll(query, bindVars);
    
    // Post-process results
    return results.map(emp => {
      // Calculate age
      if (emp.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(emp.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        emp.age = age;
        
        // Set age-based exemption flags
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isAboveSixty = age >= 60;
        emp.exemptions.isAboveSixtyFive = age >= 65;
      }
      
      // Map housing situation to legacy exemptions
      if (emp.housingSituation) {
        if (!emp.exemptions) emp.exemptions = {};
        if (emp.housingSituation === 'renting') {
          emp.exemptions.rentsPrimaryResidence = true;
          emp.exemptions.isHomeOwner = false;
        } else if (emp.housingSituation === 'owner') {
          emp.exemptions.rentsPrimaryResidence = false;
          emp.exemptions.isHomeOwner = true;
        } else if (emp.housingSituation === 'company') {
          emp.exemptions.receivesCompanyProvidedHousing = true;
        }
      }
      
      // Map disability status
      if (emp.hasDisability) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isPersonWithDisability = true;
        emp.exemptions.disabilityCategory = emp.disabilityCategory;
      }
      
      // Map NHF exemption
      if (emp.exemptFromNHF) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.nhfExempt = true;
        emp.exemptions.nhfExemptionReason = emp.nhfExemptionReason;
      }
      
      return emp;
    });
  }

  // New: Get employees by IDs with eligibility data (for payroll processing)
  async findByIdsWithEligibility(employeeIds, db) {
    const query = `
      FOR e IN employees
      FILTER e._key IN @employeeIds OR e.employeeId IN @employeeIds
      LET eligibility = e.eligibilityAssessment ? {
        success: e.eligibilityAssessment.success,
        assessment: e.eligibilityAssessment.assessment,
        summary: e.eligibilityAssessment.summary,
        optimalDeductions: e.eligibilityAssessment.optimalDeductions,
        complianceWarnings: e.eligibilityAssessment.complianceWarnings || [],
        requiredDocs: e.eligibilityAssessment.requiredDocs || []
      } : null
      
      RETURN MERGE(e, {
        eligibilityAssessment: eligibility,
        exemptions: e.exemptions ? e.exemptions : {}
      })
    `;
    
    const results = await db.QueryAll(query, { employeeIds });
    
    // Post-process results
    return results.map(emp => {
      // Calculate age
      if (emp.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(emp.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        emp.age = age;
        
        // Set age-based exemption flags
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isAboveSixty = age >= 60;
        emp.exemptions.isAboveSixtyFive = age >= 65;
      }
      
      // Map housing situation to legacy exemptions
      if (emp.housingSituation) {
        if (!emp.exemptions) emp.exemptions = {};
        if (emp.housingSituation === 'renting') {
          emp.exemptions.rentsPrimaryResidence = true;
          emp.exemptions.isHomeOwner = false;
        } else if (emp.housingSituation === 'owner') {
          emp.exemptions.rentsPrimaryResidence = false;
          emp.exemptions.isHomeOwner = true;
        } else if (emp.housingSituation === 'company') {
          emp.exemptions.receivesCompanyProvidedHousing = true;
        }
      }
      
      // Map disability status
      if (emp.hasDisability) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isPersonWithDisability = true;
        emp.exemptions.disabilityCategory = emp.disabilityCategory;
      }
      
      // Map NHF exemption
      if (emp.exemptFromNHF) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.nhfExempt = true;
        emp.exemptions.nhfExemptionReason = emp.nhfExemptionReason;
      }
      
      return emp;
    });
  }

  // New: Get employees for payroll run with eligibility optimization
  async findEmployeesForPayrollRun(employeeIds = [], db, includeInactive = false) {
    let filterConditions = 'FILTER e.status == "active"';
    const bindVars = {};
    
    if (includeInactive) {
      filterConditions = 'FILTER e.status IN ["active", "suspended"]';
    }
    
    if (employeeIds && employeeIds.length > 0) {
      filterConditions += ' AND (e._key IN @employeeIds OR e.employeeId IN @employeeIds)';
      bindVars.employeeIds = employeeIds;
    }
    
    const query = `
      FOR e IN employees
      ${filterConditions}
      // Include eligibility assessment
      LET eligibility = e.eligibilityAssessment ? {
        success: e.eligibilityAssessment.success,
        assessment: e.eligibilityAssessment.assessment,
        summary: e.eligibilityAssessment.summary,
        optimalDeductions: e.eligibilityAssessment.optimalDeductions,
        complianceWarnings: e.eligibilityAssessment.complianceWarnings || [],
        requiredDocs: e.eligibilityAssessment.requiredDocs || []
      } : null
      
      // Calculate total allowances
      LET totalAllowances = (
        (e.housingAllowance || 0) +
        (e.transportAllowance || 0) +
        (e.mealAllowance || 0) +
        (e.utilityAllowance || 0) +
        (e.uniformAllowance || 0) +
        (e.hardshipAllowance || 0) +
        (e.entertainmentAllowance || 0) +
        (e.otherAllowances || 0)
      )
      
      // Calculate pensionable emoluments (for pension calculations)
      LET pensionableEmoluments = (
        (e.basicSalary || 0) +
        (e.housingAllowance || 0) +
        (e.transportAllowance || 0)
      )
      
      // Calculate total monthly compensation
      LET totalMonthly = (e.salary || 0) + totalAllowances
      
      RETURN {
        // Core employee data
        _key: e._key,
        employeeId: e.employeeId,
        name: e.name,
        department: e.department,
        position: e.position,
        employmentType: e.employmentType,
        employmentStatus: e.status,
        
        // Compensation data
        salary: e.salary,
        basicSalary: e.basicSalary,
        totalAllowances: totalAllowances,
        totalMonthly: totalMonthly,
        pensionableEmoluments: pensionableEmoluments,
        
        // Allowances breakdown
        housingAllowance: e.housingAllowance || 0,
        transportAllowance: e.transportAllowance || 0,
        mealAllowance: e.mealAllowance || 0,
        utilityAllowance: e.utilityAllowance || 0,
        uniformAllowance: e.uniformAllowance || 0,
        hardshipAllowance: e.hardshipAllowance || 0,
        entertainmentAllowance: e.entertainmentAllowance || 0,
        otherAllowances: e.otherAllowances || 0,
        
        // Eligibility & Exemptions data
        housingSituation: e.housingSituation,
        annualRent: e.annualRent || 0,
        exemptFromNHF: e.exemptFromNHF || false,
        nhfExemptionReason: e.nhfExemptionReason,
        additionalPension: e.additionalPension || 0,
        hasLifeAssurance: e.hasLifeAssurance || false,
        lifeAssurancePremium: e.lifeAssurancePremium || 0,
        hasDisability: e.hasDisability || false,
        disabilityCategory: e.disabilityCategory,
        
        // Legacy exemptions (mapped for compatibility)
        exemptions: e.exemptions ? e.exemptions : {},
        
        // Eligibility assessment
        eligibilityAssessment: eligibility,
        lastAssessmentDate: e.lastAssessmentDate,
        assessmentVersion: e.assessmentVersion,
        
        // Compliance IDs
        taxId: e.taxId,
        pensionId: e.pensionId,
        nhfId: e.nhfId,
        
        // Personal data for eligibility calculations
        dateOfBirth: e.dateOfBirth,
        nationality: e.nationality,
        
        // Metadata
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      }
    `;
    
    const results = await db.QueryAll(query, bindVars);
    
    // Post-process: Calculate age and enhance exemptions
    return results.map(emp => {
      // Calculate age
      if (emp.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(emp.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        emp.age = age;
        
        // Set age-based exemption flags
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isAboveSixty = age >= 60;
        emp.exemptions.isAboveSixtyFive = age >= 65;
      }
      
      // Map housing situation to legacy exemptions
      if (emp.housingSituation) {
        if (!emp.exemptions) emp.exemptions = {};
        if (emp.housingSituation === 'renting') {
          emp.exemptions.rentsPrimaryResidence = true;
          emp.exemptions.isHomeOwner = false;
        } else if (emp.housingSituation === 'owner') {
          emp.exemptions.rentsPrimaryResidence = false;
          emp.exemptions.isHomeOwner = true;
        } else if (emp.housingSituation === 'company') {
          emp.exemptions.receivesCompanyProvidedHousing = true;
        }
      }
      
      // Map disability status
      if (emp.hasDisability) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.isPersonWithDisability = true;
        emp.exemptions.disabilityCategory = emp.disabilityCategory;
      }
      
      // Map NHF exemption
      if (emp.exemptFromNHF) {
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.nhfExempt = true;
        emp.exemptions.nhfExemptionReason = emp.nhfExemptionReason;
      }
      
      // Calculate service duration for pension eligibility
      if (emp.createdAt) {
        const joinDate = new Date(emp.createdAt);
        const today = new Date();
        const serviceMonths = (today.getFullYear() - joinDate.getFullYear()) * 12 + 
                             (today.getMonth() - joinDate.getMonth());
        emp.serviceMonths = serviceMonths;
        
        // Set pension exemption if less than 3 months service
        if (!emp.exemptions) emp.exemptions = {};
        emp.exemptions.underProbation = serviceMonths < 3;
      }
      
      // Calculate eligibility-based potential savings
      emp.eligibilitySavings = this.calculateEligibilitySavings(emp);
      
      return emp;
    });
  }

  // Helper: Calculate eligibility savings for an employee
  calculateEligibilitySavings(employee) {
    let annualSavings = 0;
    
    // Rent relief (20% of annual rent, max ₦500,000)
    if (employee.housingSituation === 'renting' && employee.annualRent > 0) {
      const rentRelief = Math.min(employee.annualRent * 0.20, 500000);
      annualSavings += rentRelief * 0.20; // Assuming 20% tax rate on relief
    }
    
    // NHF exemption savings (2.5% of basic salary)
    if (employee.exemptFromNHF) {
      const nhfSavings = (employee.basicSalary || 0) * 0.025 * 12;
      annualSavings += nhfSavings;
    }
    
    // Disability relief (₦20,000 monthly)
    if (employee.hasDisability) {
      annualSavings += 20000 * 12 * 0.20; // 20% tax on relief
    }
    
    // Additional pension tax savings (20% tax on contribution)
    if (employee.additionalPension > 0) {
      annualSavings += employee.additionalPension * 0.20 * 12;
    }
    
    // Life assurance tax deduction (up to 10% of income)
    if (employee.hasLifeAssurance && employee.lifeAssurancePremium > 0) {
      const maxDeductible = (employee.totalMonthly || 0) * 12 * 0.10;
      const deductibleAmount = Math.min(employee.lifeAssurancePremium, maxDeductible);
      annualSavings += deductibleAmount * 0.20; // 20% tax savings
    }
    
    // Age-based relief (5% of income for 65+)
    if (employee.age >= 65) {
      const ageRelief = (employee.totalMonthly || 0) * 12 * 0.05 * 0.20;
      annualSavings += ageRelief;
    }
    
    return {
      annual: annualSavings,
      monthly: annualSavings / 12,
      breakdown: {
        rentRelief: employee.housingSituation === 'renting' ? Math.min(employee.annualRent * 0.20, 500000) : 0,
        nhfExemption: employee.exemptFromNHF ? (employee.basicSalary || 0) * 0.025 * 12 : 0,
        disabilityRelief: employee.hasDisability ? 20000 * 12 : 0,
        additionalPension: employee.additionalPension * 0.20 * 12,
        lifeAssurance: employee.hasLifeAssurance ? 
          Math.min(employee.lifeAssurancePremium, (employee.totalMonthly || 0) * 12 * 0.10) * 0.20 : 0,
        ageRelief: employee.age >= 65 ? (employee.totalMonthly || 0) * 12 * 0.05 * 0.20 : 0
      }
    };
  }
  
  async findEmployee(employeeId, options = {}, db) {
    const {
      includeDetails = false,
      includeContracts = false,
      includeJV = false,
      includePayroll = false,
      includeCompliance = false
    } = options;

    let query = `
      LET employee = FIRST(
        FOR e IN employees
        FILTER e._key == @employeeId OR e.employeeId == @employeeId
        RETURN e
      )
    `;

    const bindVars = { employeeId };

    // Department
    query += `
      LET department = FIRST(
        FOR d IN departments
        FILTER d._key == employee.department
        RETURN d
      )
    `;

    // Conditional includes
    if (includeDetails || includeContracts) {
      query += `
        LET contracts = (
          FOR c IN employee_contracts
          FILTER c.employeeId == employee._key
          SORT c.startDate DESC
          RETURN c
        )
      `;
    }

    if (includeDetails || includeJV) {
      query += `
        LET jvAllocations = (
          FOR j IN employee_jv_allocations
          FILTER j.employeeId == employee._key
          RETURN j
        )
      `;
    }

    if (includeDetails) {
      query += `
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
      `;
    }

    if (includePayroll) {
      query += `
        LET payrollHistory = (
          FOR edge IN payroll_employees
          FILTER edge._from == CONCAT('employees/', employee._key)
          LET payroll = DOCUMENT(edge._to)
          RETURN MERGE(payroll, {
            grossSalary: edge.grossSalary,
            netSalary: edge.netSalary,
            deductions: edge.totalDeductions,
            period: edge.period
          })
        )
      `;
    }

    // Build return object based on includes
    let returnClause = `RETURN MERGE(employee, {
      departmentDetail: department
    `;

    if (includeDetails || includeContracts) {
      returnClause += `, contracts: contracts`;
    }
    if (includeDetails || includeJV) {
      returnClause += `, jvAllocations: jvAllocations`;
    }
    if (includeDetails) {
      returnClause += `, 
        addresses: addresses,
        education: education,
        employmentHistory: employmentHistory,
        documents: documents,
        personalDetails: personalDetails
      `;
    }
    if (includePayroll) {
      returnClause += `, payrollHistory: payrollHistory`;
    }

    returnClause += `})`;

    query += returnClause;

    const result = await db.QueryFirst(query, bindVars);
    return result || null;
  }
  
  async create(employeeData, db) {
    // Set default values for comprehensive employee record
    const completeEmployeeData = {
      // Personal/Bio Information
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone || '',
      address: employeeData.address || '',
      dateOfBirth: employeeData.dateOfBirth || '',
      gender: employeeData.gender || '',
      maritalStatus: employeeData.maritalStatus || '',
      nationality: employeeData.nationality || 'Nigerian',
      
      // Employment Information
      employeeId: employeeData.employeeId,
      department: employeeData.department,
      position: employeeData.position,
      jobGrade: employeeData.jobGrade || '',
      employmentType: employeeData.employmentType || 'full-time',
      employmentStatus: employeeData.employmentStatus || 'active',
      joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0],
      probationEndDate: employeeData.probationEndDate || '',
      
      // Salary Structure
      salary: employeeData.salary || 0,
      basicSalary: employeeData.basicSalary || 0,
      housingAllowance: employeeData.housingAllowance || 0,
      transportAllowance: employeeData.transportAllowance || 0,
      mealAllowance: employeeData.mealAllowance || 0,
      utilityAllowance: employeeData.utilityAllowance || 0,
      uniformAllowance: employeeData.uniformAllowance || 0,
      hardshipAllowance: employeeData.hardshipAllowance || 0,
      entertainmentAllowance: employeeData.entertainmentAllowance || 0,
      otherAllowances: employeeData.otherAllowances || 0,
      
      // Eligibility & Exemptions (NEW FIELDS)
      housingSituation: employeeData.housingSituation || '',
      annualRent: employeeData.annualRent || 0,
      exemptFromNHF: employeeData.exemptFromNHF || false,
      nhfExemptionReason: employeeData.nhfExemptionReason || '',
      nhfExemptionDetails: employeeData.nhfExemptionDetails || '',
      additionalPension: employeeData.additionalPension || 0,
      hasLifeAssurance: employeeData.hasLifeAssurance || false,
      lifeAssurancePremium: employeeData.lifeAssurancePremium || 0,
      lifeAssuranceProvider: employeeData.lifeAssuranceProvider || '',
      lifeAssurancePolicyNo: employeeData.lifeAssurancePolicyNo || '',
      hasDisability: employeeData.hasDisability || false,
      disabilityCategory: employeeData.disabilityCategory || '',
      disabilityRegNo: employeeData.disabilityRegNo || '',
      
      // Legacy exemptions structure
      exemptions: employeeData.exemptions || {
        rentsPrimaryResidence: false,
        hasTenancyAgreement: false,
        hasRentReceipts: false,
        isPersonWithDisability: false,
        isAboveSixty: false,
        isAboveSixtyFive: false,
        isArmedForcesPersonnel: false,
        isPolicePersonnel: false,
        receivesCompanyProvidedHousing: false,
        isHomeOwner: false,
        transportAllowanceForOfficialDuties: false,
        mealAllowanceForOfficialDuties: false,
        utilityAllowanceForOfficialDuties: false,
        uniformAllowanceForOfficialDuties: false,
        hardshipAllowanceForOfficialDuties: false
      },
      
      // Compliance Information (UPDATED)
      taxId: employeeData.taxId || '',
      pensionId: employeeData.pensionId || '',
      nhfId: employeeData.nhfId || '',
      nhisId: employeeData.nhisId || '', // NEW
      itfId: employeeData.itfId || '', // NEW
      
      // Bank Information (UPDATED)
      bankName: employeeData.bankName || '',
      bankAccount: employeeData.bankAccount || '',
      bankCode: employeeData.bankCode || '',
      accountType: employeeData.accountType || 'savings', // NEW
      
      // Documents (NEW)
      documents: employeeData.documents || {
        tenancyAgreement: '',
        rentReceipts: [],
        disabilityCertificate: '',
        lifeAssurancePolicy: '',
        nhfExemptionDoc: '',
        ageProof: ''
      },
      
      // JV Information
      jvPartners: employeeData.jvPartners || [],
      
      // Assessment Results (NEW)
      eligibilityAssessment: employeeData.eligibilityAssessment || null,
      lastAssessmentDate: employeeData.lastAssessmentDate || null,
      assessmentVersion: employeeData.assessmentVersion || '1.0',
      
      // System Fields
      createdAt: employeeData.createdAt,
      updatedAt: employeeData.updatedAt,
      status: employeeData.status || 'active',

      _version: 1, // Add version tracking
      _lastModifiedBy: employeeData._lastModifiedBy || 'system', // Track who made changes
      _modifiedAt: new Date().toISOString(),
    };

    return await db.AddDocument('employees', completeEmployeeData);
  }

  async getEmployeeContracts(employeeId, db) {
    const query = `
      FOR c IN employee_contracts
      FILTER c.employeeId == @employeeId
      SORT c.startDate DESC
      RETURN c
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async addContract(contractData, db) {
    const completeContractData = {
      employeeId: contractData.employeeId,
      contractType: contractData.contractType, // permanent, contract, temporary
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      salary: contractData.salary,
      noticePeriod: contractData.noticePeriod || '30 days',
      probationPeriod: contractData.probationPeriod || '3 months',
      documentRef: contractData.documentRef || '',
      status: contractData.status || 'active',
      createdAt: contractData.createdAt,
      updatedAt: contractData.updatedAt
    };

    return await db.AddDocument('employee_contracts', completeContractData);
  }

  async getEmployeeJVAllocations(employeeId, db) {
    const query = `
      FOR j IN employee_jv_allocations
      FILTER j.employeeId == @employeeId
      RETURN j
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async updateJVAllocation(employeeId, allocationData, db) {
    const query = `
      UPSERT { employeeId: @employeeId, jvPartner: @jvPartner }
      INSERT MERGE(@allocationData, {
        employeeId: @employeeId,
        createdAt: @now
      })
      UPDATE MERGE(@allocationData, {
        updatedAt: @now
      })
      IN employee_jv_allocations
      RETURN NEW
    `;

    const now = new Date().toISOString();
    return await db.QueryFirst(query, {
      employeeId,
      jvPartner: allocationData.jvPartner,
      allocationData: allocationData,
      now
    });
  }

  async updateWithVersion(employeeId, updateData, expectedVersion, db) {
    const currentEmployee = await this.findById(employeeId, db);
    
    if (!currentEmployee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    // Check if data was modified since the client last fetched it
    if (currentEmployee._version !== expectedVersion) {
      const conflicts = await this.detectFieldConflicts(currentEmployee, updateData);
      throw { 
        name: 'VERSION_CONFLICT', 
        message: 'Data was modified by another user',
        conflicts,
        serverVersion: currentEmployee._version 
      };
    }

    const updatePayload = {
      ...updateData,
      _version: currentEmployee._version + 1,
      _lastModifiedBy: updateData._lastModifiedBy || 'system',
      _modifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.UpdateDocument('employees', employeeId, updatePayload);
  }

  // Update your main update method to use versioning
  async update(employeeId, updateData, db) {
    const { _expectedVersion, _lastModifiedBy, ...cleanUpdateData } = updateData;
    
    // If version is provided, use optimistic locking
    if (_expectedVersion !== undefined) {
      return await this.updateWithVersion(employeeId, 
        { ...cleanUpdateData, _lastModifiedBy }, 
        _expectedVersion, 
        db
      );
    }

    // Fallback to non-versioned update (for backward compatibility)
    cleanUpdateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('employees', employeeId, cleanUpdateData);
  }

  async delete(employeeId, db) {
    return await db.RemoveDocument('employees', employeeId);
  }

  async getByDepartment(departmentId, db) {
    const query = `
      FOR e IN employees
      FILTER e.department == @departmentId
      SORT e.name
      RETURN e
    `;

    return await db.QueryAll(query, { departmentId });
  }

  async checkEmailExists(email, excludeEmployeeId = null, db) {
    let query = `
      FOR e IN employees
      FILTER e.email == @email
    `;

    const bindVars = { email };

    if (excludeEmployeeId) {
      query += ` AND e._key != @excludeEmployeeId`;
      bindVars.excludeEmployeeId = excludeEmployeeId;
    }

    query += ` RETURN e._key`;

    const result = await db.QueryFirst(query, bindVars);
     // Check for null, undefined, or empty array
    return !!(result && (Array.isArray(result) ? result.length > 0 : true));
  }


  // Address Management
  async getEmployeeAddresses(employeeId, db) {
    const query = `
      FOR a IN employee_addresses
      FILTER a.employeeId == @employeeId
      SORT a.isPrimary DESC, a.startDate DESC
      RETURN a
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async addEmployeeAddress(addressData, db) {
    // If setting as primary, unset other primary addresses
    if (addressData.isPrimary) {
      await this.unsetPrimaryAddresses(addressData.employeeId, db);
    }

    const completeAddressData = {
      employeeId: addressData.employeeId,
      type: addressData.type,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country || 'Nigeria',
      postalCode: addressData.postalCode || '',
      isPrimary: addressData.isPrimary || false,
      startDate: addressData.startDate,
      endDate: addressData.endDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.AddDocument('employee_addresses', completeAddressData);
  }

  async updateEmployeeAddress(addressId, updateData, db) {
    const existingAddress = await db.GetDocument('employee_addresses', addressId);
    if (!existingAddress) {
      return null;
    }

    // If setting as primary, unset other primary addresses
    if (updateData.isPrimary) {
      await this.unsetPrimaryAddresses(existingAddress.employeeId, db);
    }

    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('employee_addresses', addressId, updateData);
  }

  async deleteEmployeeAddress(addressId, db) {
    return await db.RemoveDocument('employee_addresses', addressId);
  }

  async unsetPrimaryAddresses(employeeId, db) {
    const query = `
      FOR a IN employee_addresses
      FILTER a.employeeId == @employeeId AND a.isPrimary == true
      UPDATE a WITH { isPrimary: false, updatedAt: @now } IN employee_addresses
    `;

    await db.QueryAll(query, { 
      employeeId, 
      now: new Date().toISOString() 
    });
  }

  // Education Management
  async getEmployeeEducation(employeeId, db) {
    const query = `
      FOR edu IN employee_education
      FILTER edu.employeeId == @employeeId
      SORT edu.startDate DESC
      RETURN edu
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async addEmployeeEducation(educationData, db) {
    const completeEducationData = {
      employeeId: educationData.employeeId,
      institution: educationData.institution,
      qualification: educationData.qualification,
      fieldOfStudy: educationData.fieldOfStudy,
      startDate: educationData.startDate,
      endDate: educationData.endDate,
      grade: educationData.grade || '',
      certificateUrl: educationData.certificateUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.AddDocument('employee_education', completeEducationData);
  }

  async updateEmployeeEducation(educationId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('employee_education', educationId, updateData);
  }

  async deleteEmployeeEducation(educationId, db) {
    return await db.RemoveDocument('employee_education', educationId);
  }

  // Employment History Management (Internal)
  async getEmployeeEmploymentHistory(employeeId, db) {
    const query = `
      FOR eh IN employee_employment_history
      FILTER eh.employeeId == @employeeId
      SORT eh.startDate DESC
      RETURN eh
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async addEmployeeEmploymentHistory(employmentData, db) {
    const completeEmploymentData = {
      employeeId: employmentData.employeeId,
      position: employmentData.position,
      department: employmentData.department,
      startDate: employmentData.startDate,
      endDate: employmentData.endDate || null,
      salary: employmentData.salary,
      employmentType: employmentData.employmentType,
      location: employmentData.location || '',
      supervisor: employmentData.supervisor || '',
      reasonForChange: employmentData.reasonForChange || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.AddDocument('employee_employment_history', completeEmploymentData);
  }

  async updateEmployeeEmploymentHistory(historyId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('employee_employment_history', historyId, updateData);
  }

  async deleteEmployeeEmploymentHistory(historyId, db) {
    return await db.RemoveDocument('employee_employment_history', historyId);
  }

  // Document Management
  async getEmployeeDocuments(employeeId, db) {
    const query = `
      FOR doc IN employee_documents
      FILTER doc.employeeId == @employeeId
      SORT doc.uploadDate DESC
      RETURN doc
    `;

    return await db.QueryAll(query, { employeeId });
  }

  async addEmployeeDocument(documentData, db) {
    const completeDocumentData = {
      employeeId: documentData.employeeId,
      type: documentData.type,
      name: documentData.name,
      url: documentData.url,
      uploadDate: documentData.uploadDate || new Date().toISOString(),
      expiryDate: documentData.expiryDate || null,
      status: documentData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.AddDocument('employee_documents', completeDocumentData);
  }

  async updateEmployeeDocument(documentId, updateData, db) {
    updateData.updatedAt = new Date().toISOString();
    return await db.UpdateDocument('employee_documents', documentId, updateData);
  }

  async deleteEmployeeDocument(documentId, db) {
    return await db.RemoveDocument('employee_documents', documentId);
  }

  // Personal Details Management
  async getEmployeePersonalDetails(employeeId, db) {
    const query = `
      FOR pd IN employee_personal_details
      FILTER pd.employeeId == @employeeId
      RETURN pd
    `;

    return await db.QueryFirst(query, { employeeId });
  }

  async createWithTransaction(employeeData, db) {
    let result;
    
    try {
      // Start transaction
      await db.beginTransaction();
      
      // Generate employee ID
      const employeeId = `EMP-${Date.now()}`;
      employeeData.employeeId = employeeId;
      
      // Create main employee record
      result = await this.create(employeeData, db);
      
      // Create initial contract record
      if (result) {
        const contractData = {
          employeeId: result._key,
          contractType: employeeData.employmentType || 'full-time',
          startDate: employeeData.joinDate,
          salary: employeeData.salary,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await this.addContract(contractData, db);
      }
      
      // Commit transaction
      await db.commitTransaction();
      return result;
      
    } catch (error) {
      // Rollback on error
      await db.rollbackTransaction();
      throw error;
    }
  }

  async upsertEmployeePersonalDetails(personalDetailsData, db) {
    const existingDetails = await this.getEmployeePersonalDetails(personalDetailsData.employeeId, db);
    
    const completePersonalDetails = {
      employeeId: personalDetailsData.employeeId,
      nationality: personalDetailsData.nationality || '',
      stateOfOrigin: personalDetailsData.stateOfOrigin || '',
      lga: personalDetailsData.lga || '',
      nextOfKin: personalDetailsData.nextOfKin || {},
      emergencyContact: personalDetailsData.emergencyContact || {},
      updatedAt: new Date().toISOString()
    };

    if (existingDetails) {
      // Update existing
      return await db.UpdateDocument('employee_personal_details', existingDetails._key, completePersonalDetails);
    } else {
      // Create new
      completePersonalDetails.createdAt = new Date().toISOString();
      return await db.AddDocument('employee_personal_details', completePersonalDetails);
    }
  }

  
  async detectConflicts(employeeId, clientData, db) {
    const serverData = await this.findById(employeeId, db);
    const conflicts = [];

    // Define critical fields that should trigger conflicts
    const criticalFields = [
      'salary', 'basicSalary', 'bankAccount', 'taxId', 'pensionId',
      'department', 'position', 'status'
    ];

    for (const field of criticalFields) {
      if (clientData[field] !== undefined && 
          serverData[field] !== clientData[field] &&
          field !== '_version') { // Skip version field
        conflicts.push({
          field,
          clientValue: clientData[field],
          serverValue: serverData[field],
          resolved: false
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      serverVersion: serverData._version
    };
  }

  async resolveConflicts(employeeId, resolutions, db) {
    const updateData = {};
    
    for (const resolution of resolutions) {
      if (resolution.useServerValue === false) {
        updateData[resolution.field] = resolution.clientValue;
      }
      // If useServerValue is true, we don't include the field (keeps server value)
    }

    if (Object.keys(updateData).length > 0) {
      return await this.update(employeeId, updateData, db);
    }

    return await this.findById(employeeId, db); // No changes needed
  }

  async detectFieldConflicts(serverData, clientData) {
    const criticalFields = [
      'salary', 'basicSalary', 'bankAccount', 'taxId', 'pensionId',
      'department', 'position', 'status', 'employmentType'
    ];
    
    const conflicts = [];
    
    criticalFields.forEach(field => {
      if (clientData[field] !== undefined && 
          serverData[field] !== clientData[field]) {
        conflicts.push({
          field,
          clientValue: clientData[field],
          serverValue: serverData[field],
          timestamp: serverData._modifiedAt,
          modifiedBy: serverData._lastModifiedBy
        });
      }
    });
    
    return conflicts;
  }

  


  async getEmployeeJVAllocationsWithRules(employeeId, db) {
    const query = `
      LET employee = FIRST(
        FOR e IN employees
        FILTER e._key == @employeeId
        RETURN e
      )
      
      LET applicableRules = (
        FOR rule IN allocation_rules
        FILTER rule.department == employee.department
        RETURN rule
      )
      
      LET currentAllocations = (
        FOR alloc IN jv_allocations
        FILTER alloc.employeeId == @employeeId
        RETURN MERGE(alloc, {
          partner: FIRST(FOR p IN jv_partners FILTER p._key == alloc.partnerId RETURN p),
          agreement: FIRST(FOR a IN jv_agreements FILTER a._key == alloc.agreementId RETURN a)
        })
      )
      
      RETURN {
        employee: employee,
        applicableRules: applicableRules,
        currentAllocations: currentAllocations,
        availablePartners: (
          FOR partner IN jv_partners
          FILTER partner.status == 'active'
          RETURN partner
        )
      }
    `;

    return await db.QueryFirst(query, { employeeId });
  }

  async getEmployeePayrollSummary(employeeId, db) {
    const query = `
      LET employee = FIRST(
        FOR e IN employees
        FILTER e._key == @employeeId
        RETURN e
      )
      
      LET payrollHistory = (
        FOR edge IN payroll_employees
        FILTER edge._from == CONCAT('employees/', employee._key)
        SORT edge.period DESC
        LIMIT 12
        LET payroll = DOCUMENT(edge._to)
        RETURN {
          period: edge.period,
          grossSalary: edge.grossSalary,
          basicSalary: edge.basicSalary,
          allowances: edge.allowances,
          paye: edge.paye,
          pension: edge.pension,
          nhf: edge.nhf,
          nsitf: edge.nsitf,
          totalDeductions: edge.totalDeductions,
          netSalary: edge.netSalary,
          status: payroll.status,
          processedAt: payroll.processedAt
        }
      )
      
      LET ytdEarnings = SUM(
        FOR ph IN payrollHistory
        RETURN ph.grossSalary
      )
      
      LET ytdDeductions = SUM(
        FOR ph IN payrollHistory
        RETURN ph.totalDeductions
      )
      
      LET latestPayroll = FIRST(payrollHistory)
      
      RETURN {
        employee: employee,
        payrollHistory: payrollHistory,
        summary: {
          ytdEarnings: ytdEarnings,
          ytdDeductions: ytdDeductions,
          ytdNet: ytdEarnings - ytdDeductions,
          averageMonthly: ytdEarnings / LENGTH(payrollHistory),
          lastPayPeriod: latestPayroll.period,
          lastNetSalary: latestPayroll.netSalary
        }
      }
    `;

    return await db.QueryFirst(query, { employeeId });
  }

  async getEmployeeComplianceData(employeeId, period = null, db) {
    const currentPeriod = period || this.getCurrentPeriod();
    
    const query = `
      LET employee = FIRST(
        FOR e IN employees
        FILTER e._key == @employeeId
        RETURN e
      )
      
      LET employeeDeductions = (
        FOR ded IN deductions
        FILTER ded.employeeId == @employeeId
        FILTER ded.period == @period
        FILTER ded.type == 'employee'
        RETURN ded
      )
      
      LET batchDeductions = (
        FOR ded IN deductions
        FILTER ded.period == @period
        FILTER ded.type == 'batch'
        RETURN ded
      )
      
      LET remittanceStatus = (
        FOR batch IN batchDeductions
        RETURN {
          type: 'PAYE',
          amount: batch.totals.PAYE,
          status: batch.status,
          remittedAt: batch.remittedAt,
          reference: batch.remittanceReference
        }
      )
      
      RETURN {
        employee: employee,
        statutoryIds: {
          taxId: employee.taxId,
          pensionId: employee.pensionId,
          nhfId: employee.nhfId,
          nsitfId: employee.nsitfId
        },
        monthlyDeductions: FIRST(employeeDeductions),
        remittanceStatus: remittanceStatus,
        period: @period
      }
    `;

    return await db.QueryFirst(query, { 
      employeeId, 
      period: currentPeriod 
    });
  }

  getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async searchEmployeesAdvanced(filters = {}, pagination = { page: 1, limit: 50 }, db) {
    const { 
      search, 
      department, 
      status, 
      employmentType, 
      minSalary, 
      maxSalary,
      jvPartner,
      joinDateFrom,
      joinDateTo 
    } = filters;
    
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = `
      FOR e IN employees
    `;

    const bindVars = { offset, limit };
    const conditions = [];

    // Text search
    if (search) {
      conditions.push(`(
        e.name LIKE @search OR 
        e.employeeId LIKE @search OR 
        e.email LIKE @search OR
        e.position LIKE @search
      )`);
      bindVars.search = `%${search}%`;
    }

    // Department filter
    if (department) {
      conditions.push(`e.department == @department`);
      bindVars.department = department;
    }

    // Status filter
    if (status) {
      conditions.push(`e.status == @status`);
      bindVars.status = status;
    }

    // Employment type filter
    if (employmentType) {
      conditions.push(`e.employmentType == @employmentType`);
      bindVars.employmentType = employmentType;
    }

    // Salary range filter
    if (minSalary !== undefined) {
      conditions.push(`e.salary >= @minSalary`);
      bindVars.minSalary = minSalary;
    }
    if (maxSalary !== undefined) {
      conditions.push(`e.salary <= @maxSalary`);
      bindVars.maxSalary = maxSalary;
    }

    // Join date range
    if (joinDateFrom) {
      conditions.push(`e.joinDate >= @joinDateFrom`);
      bindVars.joinDateFrom = joinDateFrom;
    }
    if (joinDateTo) {
      conditions.push(`e.joinDate <= @joinDateTo`);
      bindVars.joinDateTo = joinDateTo;
    }

    // JV Partner filter
    if (jvPartner) {
      query += `
        LET employeeJV = (
          FOR j IN jv_allocations
          FILTER j.employeeId == e._key
          FILTER j.partnerId == @jvPartner
          RETURN j
        )
      `;
      conditions.push(`LENGTH(employeeJV) > 0`);
      bindVars.jvPartner = jvPartner;
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ` FILTER ${conditions.join(' AND ')}`;
    }

    query += `
      LET departmentInfo = FIRST(
        FOR d IN departments
        FILTER d._key == e.department
        RETURN d
      )
      
      LET jvPartners = (
        FOR j IN jv_allocations
        FILTER j.employeeId == e._key
        FOR p IN jv_partners
        FILTER p._key == j.partnerId
        RETURN p.name
      )
      
      SORT e.name ASC
      LIMIT @offset, @limit
      
      RETURN MERGE(e, {
        departmentName: departmentInfo.name,
        jvPartnerNames: jvPartners,
        totalAllowances: e.housingAllowance + e.transportAllowance + 
                        e.mealAllowance + e.utilityAllowance + 
                        e.entertainmentAllowance + e.otherAllowances
      })
    `;

    return await db.QueryAll(query, bindVars);
  }
  
  // async findByIdWithDetails(employeeId, db) {
  //   const query = `
  //     LET employee = FIRST(
  //       FOR e IN employees
  //       FILTER e._key == @employeeId OR e.employeeId == @employeeId
  //       RETURN e
  //     )
      
  //     LET department = FIRST(
  //       FOR d IN departments
  //       FILTER d._key == employee.department
  //       RETURN d
  //     )
      
  //     LET contracts = (
  //       FOR c IN employee_contracts
  //       FILTER c.employeeId == employee._key
  //       SORT c.startDate DESC
  //       RETURN c
  //     )
      
  //     LET jvAllocations = (
  //       FOR j IN employee_jv_allocations
  //       FILTER j.employeeId == employee._key
  //       RETURN j
  //     )
      
  //     RETURN MERGE(employee, {
  //       departmentDetail: department,
  //       contracts: contracts,
  //       jvAllocations: jvAllocations
  //     })
  //   `;

  //   const result = await db.QueryFirst(query, { employeeId });
  //   return result || null;
  // }


  // async findByIdWithAllDetails(employeeId, db) {
  //   const query = `
  //     LET employee = FIRST(
  //       FOR e IN employees
  //       FILTER e._key == @employeeId OR e.employeeId == @employeeId
  //       RETURN e
  //     )
      
  //     LET department = FIRST(
  //       FOR d IN departments
  //       FILTER d._key == employee.department
  //       RETURN d
  //     )
      
  //     LET addresses = (
  //       FOR a IN employee_addresses
  //       FILTER a.employeeId == employee._key
  //       SORT a.isPrimary DESC, a.startDate DESC
  //       RETURN a
  //     )
      
  //     LET education = (
  //       FOR edu IN employee_education
  //       FILTER edu.employeeId == employee._key
  //       SORT edu.startDate DESC
  //       RETURN edu
  //     )
      
  //     LET employmentHistory = (
  //       FOR eh IN employee_employment_history
  //       FILTER eh.employeeId == employee._key
  //       SORT eh.startDate DESC
  //       RETURN eh
  //     )
      
  //     LET documents = (
  //       FOR doc IN employee_documents
  //       FILTER doc.employeeId == employee._key
  //       SORT doc.uploadDate DESC
  //       RETURN doc
  //     )
      
  //     LET personalDetails = FIRST(
  //       FOR pd IN employee_personal_details
  //       FILTER pd.employeeId == employee._key
  //       RETURN pd
  //     )
      
  //     LET contracts = (
  //       FOR c IN employee_contracts
  //       FILTER c.employeeId == employee._key
  //       SORT c.startDate DESC
  //       RETURN c
  //     )
      
  //     LET jvAllocations = (
  //       FOR j IN employee_jv_allocations
  //       FILTER j.employeeId == employee._key
  //       RETURN j
  //     )
      
  //     RETURN MERGE(employee, {
  //       departmentDetail: department,
  //       addresses: addresses,
  //       education: education,
  //       employmentHistory: employmentHistory,
  //       documents: documents,
  //       personalDetails: personalDetails,
  //       contracts: contracts,
  //       jvAllocations: jvAllocations
  //     })
  //   `;

  //   const result = await db.QueryFirst(query, { employeeId });
  //   return result || null;
  // }


  // async findByIdWithCompleteProfile(employeeId, db) {
  //   const query = `
  //     LET employee = FIRST(
  //       FOR e IN employees
  //       FILTER e._key == @employeeId OR e.employeeId == @employeeId
  //       RETURN e
  //     )
      
  //     LET department = FIRST(
  //       FOR d IN departments
  //       FILTER d._key == employee.department
  //       RETURN d
  //     )
      
  //     LET addresses = (
  //       FOR a IN employee_addresses
  //       FILTER a.employeeId == employee._key
  //       SORT a.isPrimary DESC, a.startDate DESC
  //       RETURN a
  //     )
      
  //     LET education = (
  //       FOR edu IN employee_education
  //       FILTER edu.employeeId == employee._key
  //       SORT edu.startDate DESC
  //       RETURN edu
  //     )
      
  //     LET employmentHistory = (
  //       FOR eh IN employee_employment_history
  //       FILTER eh.employeeId == employee._key
  //       SORT eh.startDate DESC
  //       RETURN eh
  //     )
      
  //     LET documents = (
  //       FOR doc IN employee_documents
  //       FILTER doc.employeeId == employee._key
  //       SORT doc.uploadDate DESC
  //       RETURN doc
  //     )
      
  //     LET personalDetails = FIRST(
  //       FOR pd IN employee_personal_details
  //       FILTER pd.employeeId == employee._key
  //       RETURN pd
  //     )
      
  //     LET contracts = (
  //       FOR c IN employee_contracts
  //       FILTER c.employeeId == employee._key
  //       SORT c.startDate DESC
  //       RETURN c
  //     )
      
  //     LET jvAllocations = (
  //       FOR j IN jv_allocations
  //       FILTER j.employeeId == employee._key
  //       RETURN MERGE(j, {
  //         partner: FIRST(FOR p IN jv_partners FILTER p._key == j.partnerId RETURN p)
  //       })
  //     )
      
  //     LET payrollHistory = (
  //       FOR edge IN payroll_employees
  //       FILTER edge._from == CONCAT('employees/', employee._key)
  //       LET payroll = DOCUMENT(edge._to)
  //       RETURN MERGE(payroll, {
  //         grossSalary: edge.grossSalary,
  //         netSalary: edge.netSalary,
  //         deductions: edge.totalDeductions,
  //         period: edge.period
  //       })
  //     )
      
  //     LET paymentTransactions = (
  //       FOR pt IN payment_transactions
  //       FILTER pt.employee_id == employee._key
  //       SORT pt.payment_date DESC
  //       RETURN pt
  //     )
      
  //     LET bankDetails = FIRST(
  //       FOR b IN banks
  //       FILTER b.code == employee.bankCode
  //       RETURN b
  //     )
      
  //     RETURN MERGE(employee, {
  //       departmentDetail: department,
  //       addresses: addresses,
  //       education: education,
  //       employmentHistory: employmentHistory,
  //       documents: documents,
  //       personalDetails: personalDetails,
  //       contracts: contracts,
  //       jvAllocations: jvAllocations,
  //       payrollHistory: payrollHistory,
  //       paymentTransactions: paymentTransactions,
  //       bankDetails: bankDetails,
  //       // Calculate derived fields
  //       totalAllowances: employee.housingAllowance + employee.transportAllowance + 
  //                        employee.mealAllowance + employee.utilityAllowance + 
  //                        employee.entertainmentAllowance + employee.otherAllowances,
  //       yearsOfService: DATE_DIFF(employee.joinDate, DATE_NOW(), 'years')
  //     })
  //   `;

  //   const result = await db.QueryFirst(query, { employeeId });
  //   return result || null;
  // }
}

module.exports = new EmployeeQueries();