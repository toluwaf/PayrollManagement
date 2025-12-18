// Enhanced Mock Data for Payroll System Demo
export const mockEmployees = [
  {
    id: 1,
    employeeId: "EMP-001",
    name: "John Doe",
    department: "Engineering",
    position: "Senior Software Engineer",
    salary: 850000,
    basicSalary: 500000,
    housingAllowance: 200000,
    transportAllowance: 80000,
    otherAllowances: 70000,
    email: "john.doe@company.com",
    phone: "+2348012345678",
    joinDate: "2022-01-15",
    status: "Active",
    bankAccount: "0123456789",
    bankName: "GTBank",
    taxId: "TIN-001234",
    pensionId: "PEN-001234"
  },
  {
    id: 2,
    employeeId: "EMP-002",
    name: "Jane Smith",
    department: "Finance",
    position: "Financial Analyst",
    salary: 750000,
    basicSalary: 450000,
    housingAllowance: 180000,
    transportAllowance: 70000,
    otherAllowances: 50000,
    email: "jane.smith@company.com",
    phone: "+2348023456789",
    joinDate: "2021-03-20",
    status: "Active",
    bankAccount: "0234567890",
    bankName: "First Bank",
    taxId: "TIN-001235",
    pensionId: "PEN-001235"
  },
  {
    id: 3,
    employeeId: "EMP-003",
    name: "Mike Johnson",
    department: "HR",
    position: "HR Manager",
    salary: 950000,
    basicSalary: 550000,
    housingAllowance: 250000,
    transportAllowance: 90000,
    otherAllowances: 60000,
    email: "mike.johnson@company.com",
    phone: "+2348034567890",
    joinDate: "2020-11-05",
    status: "Active",
    bankAccount: "0345678901",
    bankName: "Zenith Bank",
    taxId: "TIN-001236",
    pensionId: "PEN-001236"
  },
  {
    id: 4,
    employeeId: "EMP-004",
    name: "Sarah Williams",
    department: "Sales",
    position: "Sales Manager",
    salary: 820000,
    basicSalary: 480000,
    housingAllowance: 190000,
    transportAllowance: 85000,
    otherAllowances: 65000,
    email: "sarah.williams@company.com",
    phone: "+2348045678901",
    joinDate: "2022-06-10",
    status: "Active",
    bankAccount: "0456789012",
    bankName: "Access Bank",
    taxId: "TIN-001237",
    pensionId: "PEN-001237"
  }
];

export const employeeDeductions = []; 

export const mockPayrollRuns = [
  {
    id: "PR-2023-011",
    period: "November 2023",
    employees: 1247,
    totalAmount: 42876543,
    status: "Completed",
    processedDate: "2023-11-30",
    approvedBy: "Finance Manager",
    breakdown: {
      basicSalary: 27876543,
      allowances: 9500000,
      deductions: 4500000,
      netPay: 37876543
    }
  },
  {
    id: "PR-2023-010",
    period: "October 2023",
    employees: 1235,
    totalAmount: 41234567,
    status: "Completed",
    processedDate: "2023-10-31",
    approvedBy: "Finance Manager",
    breakdown: {
      basicSalary: 26876543,
      allowances: 9200000,
      deductions: 4358000,
      netPay: 36576543
    }
  },
  {
    id: "PR-2023-009",
    period: "September 2023",
    employees: 1220,
    totalAmount: 40123456,
    status: "Completed",
    processedDate: "2023-09-30",
    approvedBy: "Finance Manager",
    breakdown: {
      basicSalary: 26123456,
      allowances: 8900000,
      deductions: 4200000,
      netPay: 35923456
    }
  },
  {
    id: "PR-2023-012",
    period: "December 2023",
    employees: 1247,
    totalAmount: null,
    status: "Pending",
    processedDate: null,
    approvedBy: null
  }
];

export const dashboardStats = {
  totalEmployees: 1247,
  totalPayroll: 42876543,
  pendingApprovals: 18,
  complianceIssues: 2
};

export const statutoryDeductions = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "John Doe",
    period: "November 2023",
    paye: 125000,
    pension: 63750,
    nhf: 21250,
    nsitf: 8500,
    totalDeductions: 218500,
    status: "Paid",
    paymentDate: "2023-12-10"
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    period: "November 2023",
    paye: 112500,
    pension: 56250,
    nhf: 18750,
    nsitf: 7500,
    totalDeductions: 195000,
    status: "Paid",
    paymentDate: "2023-12-10"
  }
];

export const jvAllocations = [
  {
    id: 1,
    project: "NNPC Joint Venture",
    partner: "NNPC",
    period: "November 2023",
    totalAmount: 15000000,
    allocation: "60%",
    amount: 9000000,
    status: "Processed"
  },
  {
    id: 2,
    project: "Shell Partnership",
    partner: "Shell",
    period: "November 2023",
    totalAmount: 10000000,
    allocation: "40%",
    amount: 4000000,
    status: "Processed"
  }
];

export const reportsData = {
  payrollSummary: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    data: [35000000, 36500000, 37200000, 38500000, 39000000, 39500000, 39800000, 40500000, 40123456, 41234567, 42876543]
  },
  departmentBreakdown: {
    Engineering: 12500000,
    Finance: 8500000,
    HR: 6500000,
    Operations: 10500000,
    Sales: 9500000,
    IT: 7500000
  }
};

// PAYE Calculation function based on Nigerian tax laws
export const calculatePAYE = (grossIncome) => {
  const annualIncome = grossIncome * 12;
  const relief = Math.max(200000, 0.01 * annualIncome) + (0.2 * annualIncome);
  const pension = 0.08 * annualIncome;
  const nhf = 0.025 * (grossIncome * 12); // Based on basic salary
  
  let taxableIncome = annualIncome - relief - pension - nhf;
  taxableIncome = Math.max(0, taxableIncome);
  
  let tax = 0;
  
  // Nigerian tax bands (2023 rates)
  if (taxableIncome > 3200000) {
    tax += (taxableIncome - 3200000) * 0.24;
    taxableIncome = 3200000;
  }
  if (taxableIncome > 1600000) {
    tax += (taxableIncome - 1600000) * 0.21;
    taxableIncome = 1600000;
  }
  if (taxableIncome > 1100000) {
    tax += (taxableIncome - 1100000) * 0.19;
    taxableIncome = 1100000;
  }
  if (taxableIncome > 600000) {
    tax += (taxableIncome - 600000) * 0.15;
    taxableIncome = 600000;
  }
  if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * 0.11;
    taxableIncome = 300000;
  }
  tax += taxableIncome * 0.07;
  
  // Minimum tax rule
  const minimumTax = 0.01 * annualIncome;
  tax = Math.max(tax, minimumTax);
  
  return Math.round(tax / 12); // Monthly tax
};