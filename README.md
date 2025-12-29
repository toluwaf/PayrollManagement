# Payroll Management System

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Documentation Index](#documentation-index)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Help](#getting-help)

---

## Overview

The **Payroll Management System** is a comprehensive enterprise-grade application designed to automate and streamline payroll processing, employee management, compliance tracking, and financial reporting for organizations.

### Purpose
This system handles:
- Employee lifecycle management (onboarding, updates, terminations)
- Automated payroll calculations with PAYE tax computation
- Compliance tracking (pensions, taxes, deductions)
- Financial integrations (bank disbursements, JV allocations)
- Comprehensive reporting and audit trails

### Business Value
- **Accuracy**: Automated calculations reduce human error
- **Compliance**: Built-in tax and regulatory compliance
- **Efficiency**: Processes payroll for hundreds of employees in minutes
- **Transparency**: Complete audit trails and reporting
- **Integration**: Works with existing financial systems

---

## System Architecture

### High-Level Overview
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄────► │  Express Backend │ ◄────► │  ArangoDB/MSSQL │
│  (Port 3000)    │         │   (Port 4000)    │         │    Databases    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Components
1. **Frontend**: React 19 SPA with module-based architecture
2. **Backend**: Node.js/Express REST API with JWT authentication
3. **Databases**: 
   - ArangoDB (primary - document/graph database)
   - MSSQL (secondary - for specific data operations)

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- ArangoDB 3.9+
- MSSQL Server (optional, for specific features)
- Git

### Installation (5 minutes)
```bash
# 1. Clone the repository
git clone https://github.com/toluwaf/PayrollManagement.git
cd PayrollManagement

# 2. Setup Backend
cd payroll-backend
npm install
cp .env.example .env  # Create and configure environment variables
npm run dev          # Start backend on port 4000

# 3. Setup Frontend (in a new terminal)
cd payroll-frontend
npm install
npm start            # Start frontend on port 3000
```

### First Login
- URL: http://localhost:3000
- Default credentials will be in your setup documentation
- Change password immediately after first login

---

## Documentation Index

This repository contains comprehensive documentation for all aspects of the system:

### 📚 For New Team Members
1. **[SETUP.md](./docs/SETUP.md)** - Complete installation and configuration guide
2. **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design and technical architecture
3. **[FRONTEND_GUIDE.md](./docs/FRONTEND_GUIDE.md)** - React application structure and development

### 🔧 For Developers
4. **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Complete REST API reference
5. **[DATABASE.md](./docs/DATABASE.md)** - Database schemas and data models
6. **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development workflows and best practices

### 🚀 For DevOps/Operations
7. **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment procedures and environments
8. **[MAINTENANCE.md](./docs/MAINTENANCE.md)** - Troubleshooting and maintenance guide

### 📊 For Business Users
9. **[USER_GUIDE.md](./docs/USER_GUIDE.md)** - End-user manual for each module
10. **[BUSINESS_LOGIC.md](./docs/BUSINESS_LOGIC.md)** - Payroll calculation rules and business logic

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1 | UI framework |
| React Router | 7.9 | Client-side routing |
| Axios | 1.12 | HTTP client |
| Chart.js | 4.5 | Data visualization |
| Tailwind CSS | 3.4 | Utility-first CSS framework |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime environment |
| Express | 4.21 | Web framework |
| JWT | 9.0 | Authentication |
| ArangoDB | 10.1 | Primary database |
| MSSQL | 11.0 | Secondary database |
| Joi | 17.13 | Input validation |

### Security & Infrastructure
- Helmet.js for security headers
- bcrypt for password hashing
- CORS configuration
- Rate limiting
- Compression middleware

---

## Key Features

### 1. Human Resources Module
- **Employee Management**: Complete employee lifecycle tracking
- **Position Management**: Job titles, grades, and salary structures
- **Document Management**: Store and track employee documents
- **Bulk Import**: Import multiple employees via CSV/Excel
- **Employee Profiles**: Detailed views with personal, financial, and compliance data

### 2. Payroll Module
- **Automated Processing**: Calculate payroll for all employees in one run
- **PAYE Calculation**: Accurate tax computation following Nigerian tax laws
- **Multiple Pay Cycles**: Support for monthly, bi-weekly, weekly payrolls
- **Adjustments**: Handle bonuses, deductions, loans, and corrections
- **Payroll History**: Complete audit trail of all payroll runs
- **Overtime Calculation**: Automated overtime computation

### 3. Finance Module
- **Bank Disbursement**: Generate bank payment files
- **JV Allocations**: Cost center and project allocations
- **Financial Reports**: Detailed financial breakdowns
- **Export Formats**: Multiple export formats (CSV, Excel, PDF)

### 4. Compliance Module
- **Pension Management**: Automated pension calculations
- **Tax Compliance**: PAYE, WHT, and other statutory deductions
- **Deduction Management**: Configure and track all deductions
- **Regulatory Reporting**: Generate compliance reports

### 5. Reporting & Analytics
- **Dashboard**: Real-time KPIs and metrics
- **Custom Reports**: Flexible report generation
- **Data Visualization**: Charts and graphs
- **Export Capabilities**: Multiple export formats

### 6. Settings & Configuration
- **Payroll Settings**: Configure calculation rules
- **Tax Brackets**: Manage tax rate tables
- **System Settings**: Global system configuration
- **User Management**: Role-based access control

---

## Project Structure

```
PayrollManagement/
├── payroll-backend/          # Backend API server
│   ├── controller/           # Business logic controllers
│   │   ├── payroll/         # Payroll-specific services
│   │   │   ├── services/    # Payroll calculation services
│   │   │   ├── utilities/   # Helper utilities
│   │   │   └── constants/   # Payroll constants
│   │   ├── employeeController.js
│   │   ├── payrollController.js
│   │   └── ...
│   ├── routes/              # API route definitions
│   ├── queries/             # Database queries (AQL)
│   ├── middleware/          # Express middleware
│   ├── helpers/             # Utility functions
│   ├── validations/         # Input validation schemas
│   ├── services/            # External service integrations
│   ├── server.js            # Application entry point
│   └── package.json
│
├── payroll-frontend/        # React frontend application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── hr/          # Human Resources module
│   │   │   ├── payroll/     # Payroll module
│   │   │   ├── finance/     # Finance module
│   │   │   ├── compliance/  # Compliance module
│   │   │   ├── reports/     # Reports module
│   │   │   └── settings/    # Settings module
│   │   ├── components/      # Shared React components
│   │   │   ├── Common/      # Generic reusable components
│   │   │   ├── Layout/      # Layout components
│   │   │   └── Auth/        # Authentication components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Top-level page components
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Application entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── docs/                    # Documentation (to be created)
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── ...
│
└── README.md               # This file
```

### Module Architecture

The system follows a **modular architecture** where each business domain is isolated:

- **HR Module**: Employee management, positions, documents
- **Payroll Module**: Payroll processing, calculations, history
- **Finance Module**: Bank disbursements, JV allocations
- **Compliance Module**: Deductions, tax, pension tracking
- **Reports Module**: Report generation and analytics
- **Settings Module**: System configuration

---

## Getting Help

### For Technical Issues
1. Check the [MAINTENANCE.md](./docs/MAINTENANCE.md) troubleshooting section
2. Review relevant documentation in the `/docs` folder
3. Check application logs:
   - Backend logs: Console output from `npm run dev`
   - Frontend logs: Browser developer console

### For Business Logic Questions
1. Review [BUSINESS_LOGIC.md](./docs/BUSINESS_LOGIC.md) for calculation rules
2. Check [USER_GUIDE.md](./docs/USER_GUIDE.md) for feature explanations

### For Development Questions
1. Review [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for coding standards
2. Check [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for API details
3. Examine existing code in similar modules

---

## Key System Concepts

### 1. Employee Lifecycle
Employees flow through states: Draft → Active → Suspended → Terminated

### 2. Payroll Cycles
The system supports multiple payroll cycles:
- Monthly (most common)
- Bi-weekly
- Weekly
- Custom cycles

### 3. Calculation Engine
The payroll calculation engine follows this flow:
1. Load eligible employees
2. Calculate gross salary (base + allowances)
3. Apply deductions (pension, tax, loans)
4. Calculate net salary
5. Generate payslips and reports

### 4. Tax Calculation (PAYE)
Uses Nigerian Tax Act 2025 with progressive rates and evidence-based reliefs.

### 5. Role-Based Access Control (RBAC)
Users have roles that determine what they can view and modify:
- **Admin**: Full system access
- **HR**: Employee and position management
- **Payroll**: Payroll processing
- **Finance**: Financial operations
- **Compliance**: Compliance tracking
- **Executive**: View-only access to reports

---

## Important Notes for Successor

### Critical Information
1. **Database Connection**: The system uses ArangoDB as primary database. Connection details are in `.env` file.
2. **Authentication**: JWT-based with tokens stored in localStorage on frontend.
3. **PAYE Calculation**: Core business logic in `payroll-backend/helpers/payeCalculator.js` - follows Nigerian Tax Act 2025
4. **Tax Relief**: Uses evidence-based Rent Relief (2025 Tax Act removed CRA)
5. **Backup Strategy**: Regular database backups are essential

### Known Limitations
1. System is optimized for Nigerian Tax Act 2025 regulations
2. Rent Relief requires manual verification of evidence (tenancy agreements)
3. Bank disbursement formats may need customization per bank
4. Large payroll runs (5000+ employees) may require performance tuning

### Recommended First Steps
1. Read [SETUP.md](./docs/SETUP.md) and set up local environment
2. Review [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand system design
3. Run the application and explore each module
4. Review [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for backend details
5. Check [DEVELOPMENT.md](./docs/DEVELOPMENT.md) before making changes

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Current | Production version with full feature set |

---

## License

[Specify license here]

---

## Contact Information

For questions or support:
- Repository: https://github.com/toluwaf/PayrollManagement
- [Add other contact information as needed]

---

**Last Updated**: December 2024  
**Maintained By**: [Your name/team]  
**Documentation Version**: 1.0
