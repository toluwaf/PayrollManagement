# System Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Integration Points](#integration-points)
- [Scalability Considerations](#scalability-considerations)

---

## Overview

The Payroll Management System follows a **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer**: React-based SPA
2. **Application Layer**: Node.js/Express REST API
3. **Data Layer**: ArangoDB (primary) + MSSQL (secondary)

### Architecture Principles
- **Modularity**: Code organized by business domains
- **Separation of Concerns**: Clear boundaries between layers
- **RESTful Design**: Standard HTTP methods and status codes
- **Security First**: Authentication, authorization, and data protection
- **Scalability**: Designed to handle growing employee counts

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐│
│  │ HR Module  │  │  Payroll   │  │  Finance   │  │Compliance ││
│  │            │  │   Module   │  │   Module   │  │  Module   ││
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │      React Components + Context Providers + Hooks          ││
│  └────────────────────────────────────────────────────────────┘│
│                            ▼                                     │
│                     HTTP/REST (Axios)                           │
└─────────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Express.js Middleware Stack                     │  │
│  │  • CORS  • Helmet  • Rate Limiting  • Compression        │  │
│  │  • Authentication (JWT)  • Request Validation            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐│
│  │  Employee  │  │  Payroll   │  │  Finance   │  │Deductions ││
│  │ Controller │  │ Controller │  │ Controller │  │Controller ││
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘│
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Business Logic Services                      │  │
│  │  • Payroll Calculation  • PAYE Calculation               │  │
│  │  • Eligibility Service  • Adjustment Processor           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Query Layer (AQL Queries)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                  │
│  ┌──────────────────────┐         ┌────────────────────────┐   │
│  │      ArangoDB        │         │        MSSQL           │   │
│  │   (Primary Store)    │         │   (Secondary Store)    │   │
│  │                      │         │                        │   │
│  │  • Employees         │         │  • External Data       │   │
│  │  • Payroll Runs      │         │  • Legacy Systems      │   │
│  │  • Deductions        │         │                        │   │
│  │  • Positions         │         │                        │   │
│  │  • JV Partners       │         │                        │   │
│  │  • Settings          │         │                        │   │
│  └──────────────────────┘         └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **React** | 19.1.1 | UI Framework | Component-based, Virtual DOM |
| **React Router** | 7.9.1 | Routing | Client-side navigation |
| **React Context API** | Built-in | State Management | Auth, Settings contexts |
| **Axios** | 1.12.2 | HTTP Client | Promise-based API calls |
| **Chart.js** | 4.5.0 | Data Visualization | Interactive charts |
| **Tailwind CSS** | 3.4.17 | Styling | Utility-first CSS |

### Backend Technologies

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **Node.js** | 16+ | Runtime | Event-driven, non-blocking I/O |
| **Express** | 4.21.2 | Web Framework | Middleware-based routing |
| **ArangoJS** | 10.1.1 | Database Driver | Multi-model database support |
| **MSSQL** | 11.0.1 | Database Driver | SQL Server connectivity |
| **jsonwebtoken** | 9.0.2 | Authentication | JWT token generation/validation |
| **bcryptjs** | 3.0.2 | Encryption | Password hashing |
| **Joi** | 17.13.3 | Validation | Schema-based validation |
| **Helmet** | 7.0.0 | Security | HTTP headers security |
| **Morgan** | 1.10.0 | Logging | HTTP request logging |

### Database Technologies

| Database | Type | Usage |
|----------|------|-------|
| **ArangoDB** | Multi-model (Document/Graph) | Primary data store |
| **MSSQL** | Relational | Secondary/integration store |

---

## Component Architecture

### Backend Component Structure

```
payroll-backend/
│
├── server.js                    # Application entry point
│   └── Initializes: Express app, middleware, routes, database
│
├── middleware/                  # Express middleware
│   ├── auth.js                 # JWT authentication
│   ├── validation.js           # Request validation
│   └── errorHandler.js         # Error handling
│
├── routes/                      # API route definitions
│   ├── employeeRoutes.js       # /api/employees
│   ├── payrollRoutes.js        # /api/payroll
│   ├── deductionsRoutes.js     # /api/deductions
│   ├── reportsRoutes.js        # /api/reports
│   ├── bankRoutes.js           # /api/bank-disbursement
│   └── ...
│
├── controller/                  # Business logic controllers
│   ├── employeeController.js   # Employee CRUD operations
│   ├── payrollController.js    # Payroll processing
│   ├── deductionsController.js # Deduction management
│   │
│   └── payroll/                # Payroll-specific logic
│       ├── services/           # Core payroll services
│       │   ├── adjustmentProcessorService.js  # Process adjustments
│       │   ├── eligibilityService.js          # Determine eligibility
│       │   └── payrollSettingsService.js      # Settings management
│       │
│       ├── utilities/          # Helper utilities
│       │   ├── cycleHelpers.js               # Pay cycle logic
│       │   ├── dateHelpers.js                # Date calculations
│       │   └── overtimeCalculator.js         # Overtime math
│       │
│       └── constants/          # Configuration constants
│           ├── payrollConstants.js           # System constants
│           └── defaultSettings.js            # Default configs
│
├── queries/                     # Database query layer
│   ├── employeeQueries.js      # Employee data access
│   ├── payrollQueries.js       # Payroll data access
│   ├── deductionsQueries.js    # Deduction data access
│   └── ...
│
├── helpers/                     # Utility functions
│   ├── payeCalculator.js       # Tax calculation engine
│   ├── DataStorage.js          # ArangoDB wrapper
│   ├── DataSqlHelper.js        # MSSQL wrapper
│   ├── responseHelper.js       # Standardized responses
│   └── Logger.js               # Logging utility
│
├── validations/                 # Input validation schemas
│   └── [Joi validation schemas]
│
└── services/                    # External service integrations
    └── [Third-party integrations]
```

### Frontend Component Structure

```
payroll-frontend/src/
│
├── App.js                       # Main application component
├── index.js                     # React entry point
│
├── modules/                     # Feature modules (business domains)
│   │
│   ├── hr/                     # Human Resources Module
│   │   ├── pages/              # HR page components
│   │   │   ├── HRDashboard.js
│   │   │   ├── Employees.js
│   │   │   ├── Positions.js
│   │   │   └── EmployeeProfile/
│   │   │       ├── EmployeeDetails.js
│   │   │       ├── EmployeeFinance.js
│   │   │       └── ...
│   │   └── components/         # HR-specific components
│   │       └── Employees/
│   │           └── EmployeeTable.jsx
│   │
│   ├── payroll/                # Payroll Module
│   │   ├── pages/
│   │   │   ├── PayrollDashboard.js
│   │   │   ├── Payroll.js              # Payroll processing
│   │   │   ├── PayrollHistory.js
│   │   │   ├── PayrollSettings.js
│   │   │   └── AdjustmentsManagement.js
│   │   └── components/
│   │       ├── calculator/
│   │       │   └── PAYECalculatorVisualization.jsx
│   │       └── AnnualBreakdownComponents/
│   │
│   ├── finance/                # Finance Module
│   │   ├── pages/
│   │   │   ├── FinanceDashboard.js
│   │   │   ├── BankDisbursement.js
│   │   │   └── JVAllocations.js
│   │   └── components/
│   │
│   ├── compliance/             # Compliance Module
│   │   ├── pages/
│   │   │   ├── ComplianceDashboard.js
│   │   │   └── Deductions.js
│   │   └── components/
│   │       └── Deductions/
│   │
│   ├── reports/                # Reports Module
│   │   └── pages/
│   │       └── Reports.js
│   │
│   └── settings/               # Settings Module
│       └── pages/
│           └── Settings.js
│
├── components/                  # Shared components
│   ├── Common/                 # Generic reusable components
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   │
│   ├── Layout/                 # Layout components
│   │   ├── MainLayout.jsx
│   │   ├── Sidebar.js
│   │   ├── TopNav.js
│   │   └── Breadcrumbs.jsx
│   │
│   └── Auth/                   # Authentication components
│       └── ProtectedRoute.js
│
├── context/                     # React Context providers
│   ├── AuthContext.js          # Authentication state
│   └── SettingsContext.js      # App settings state
│
├── hooks/                       # Custom React hooks
│   ├── usePayeCalculator.js    # PAYE calculation hook
│   ├── usePayrollSettings.js   # Payroll settings hook
│   └── useTaxBracketManager.js # Tax bracket management
│
├── pages/                       # Top-level pages
│   ├── Dashboard.js            # Main dashboard
│   └── Login.js                # Login page
│
└── index.css                    # Global styles (Tailwind)
```

---

## Data Flow

### 1. User Authentication Flow

```
User enters credentials
        ↓
Frontend validates input
        ↓
POST /api/auth/login
        ↓
Backend validates credentials
        ↓
Bcrypt compares password hash
        ↓
Generate JWT token
        ↓
Return token + user data
        ↓
Frontend stores token in localStorage
        ↓
Include token in all subsequent requests
```

### 2. Payroll Processing Flow

```
User initiates payroll run
        ↓
Frontend: Select period, cycle, employees
        ↓
POST /api/payroll/process
        ↓
Backend: Validate payroll period
        ↓
Load eligible employees from database
        ↓
For each employee:
  ├─ Calculate gross salary (base + allowances)
  ├─ Apply deductions:
  │  ├─ Pension (8% of gross)
  │  ├─ PAYE (progressive tax)
  │  └─ Other deductions (loans, etc.)
  ├─ Calculate net salary
  └─ Generate payslip record
        ↓
Save payroll run to database
        ↓
Return payroll summary
        ↓
Frontend displays results
```

### 3. PAYE Tax Calculation Flow (Nigerian Tax Act 2025)

```
Gross Salary Input
        ↓
Calculate Annual Gross (monthly × 12)
        ↓
Calculate Rent Relief (Evidence-Based)
  • If renting: Rent Relief = Min(Annual Rent × 20%, ₦500,000)
  • If not renting: Rent Relief = ₦0
        ↓
Calculate Taxable Income
  • Taxable Income = Annual Gross - Rent Relief - Pension - NHF - NHIS
        ↓
Apply Progressive Tax Brackets:
  • First ₦800,000: 0%
  • Next ₦2,200,000: 15%
  • Next ₦9,000,000: 18%
  • Next ₦13,000,000: 21%
  • Next ₦25,000,000: 23%
  • Above ₦50,000,000: 25%
        ↓
Sum Tax from All Brackets
        ↓
Monthly PAYE = Annual Tax / 12
        ↓
Return Monthly PAYE Amount
```

**Key Change in 2025**: CRA (Consolidated Relief Allowance) removed and replaced with evidence-based Rent Relief.

### 4. API Request Flow

```
User Action in UI
        ↓
React Component Handler
        ↓
Axios HTTP Request
  • Headers: { Authorization: "Bearer <token>" }
  • Body: Request data
        ↓
Express Middleware Chain:
  1. CORS validation
  2. Helmet security headers
  3. Rate limiting check
  4. Body parsing (JSON)
  5. JWT authentication
  6. Request validation (Joi)
        ↓
Route Handler
        ↓
Controller Method
        ↓
Business Logic Service (if needed)
        ↓
Query Layer (AQL/SQL)
        ↓
Database (ArangoDB/MSSQL)
        ↓
Return Data
        ↓
Response Helper (standardized format)
        ↓
HTTP Response
        ↓
Frontend receives response
        ↓
Update UI state
```

---

## Security Architecture

### 1. Authentication & Authorization

**JWT-Based Authentication**
```javascript
// Token Structure
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "role": "admin"
  },
  "iat": 1640000000,  // Issued at
  "exp": 1640086400   // Expires (24 hours)
}
```

**Authorization Middleware**
```javascript
// Role-based access control
const authMiddleware = (req, res, next) => {
  // 1. Extract token from Authorization header
  // 2. Verify JWT signature
  // 3. Check token expiration
  // 4. Attach user to request object
  // 5. Proceed to route handler
}
```

### 2. Security Layers

| Layer | Implementation | Purpose |
|-------|----------------|---------|
| **Network** | CORS configuration | Allow only trusted origins |
| **Headers** | Helmet.js | Secure HTTP headers |
| **Rate Limiting** | express-rate-limit | Prevent abuse (1000 req/15min) |
| **Authentication** | JWT | Verify user identity |
| **Authorization** | Role-based middleware | Control resource access |
| **Input Validation** | Joi schemas | Prevent injection attacks |
| **Password Storage** | bcrypt (10 rounds) | Secure password hashing |
| **SQL Injection** | Parameterized queries | Prevent SQL injection |
| **XSS Protection** | React escaping + CSP | Prevent cross-site scripting |

### 3. Data Protection

**Sensitive Data Handling**
- Passwords: Hashed with bcrypt (never stored plain text)
- JWTs: Signed with secret key
- Salary data: Restricted by role-based access
- Personal data: Access logged for audit trail

---

## Integration Points

### 1. Database Connections

**ArangoDB Integration**
```javascript
// Connection configuration
{
  dbname: 'Payroll',
  dbport: 8529,
  dbhost: '18.216.2.5',
  dbuser: 'root',
  dbpassword: '[encrypted]'
}
```

**MSSQL Integration**
```javascript
// Connection configuration
{
  server: 'hivedata.c1szsvwlgsja.eu-west-2.rds.amazonaws.com',
  database: 'HiveNAPIMSData',
  user: 'admin',
  password: '[encrypted]'
}
```

### 2. External Service Integration Points

| Integration Point | Purpose | Location |
|------------------|---------|----------|
| Logging Service | Centralized logging | `helpers/Logger.js` |
| Report Generation | PDF/Excel reports | `helpers/jsReports.js` |
| Chart Service | Chart generation | `helpers/chartService.js` |
| Bank APIs | Payment disbursement | Future enhancement |

---

## Scalability Considerations

### Current Limitations
- Single server deployment
- No load balancing
- In-memory session storage
- Synchronous payroll processing

### Recommended Improvements for Scale

**1. Horizontal Scaling**
```
Current: Single Node.js instance
Future:  Multiple instances behind load balancer
```

**2. Asynchronous Processing**
```javascript
// Current: Synchronous payroll processing
await processPayroll(employees)

// Future: Queue-based processing
await queue.add('processPayroll', { employees })
```

**3. Database Optimization**
- Add indexes on frequently queried fields
- Implement caching layer (Redis)
- Database read replicas for reporting
- Archive old payroll data

**4. Frontend Optimization**
- Code splitting by route
- Lazy loading modules
- CDN for static assets
- Service worker for offline support

### Performance Metrics

**Target Performance**
- API Response Time: < 200ms (95th percentile)
- Payroll Processing: < 5 minutes for 1000 employees
- Database Queries: < 100ms
- Frontend Load: < 3 seconds

---

## Design Patterns Used

### Backend Patterns

1. **MVC Pattern**: Controllers → Services → Models
2. **Repository Pattern**: Query layer abstracts database access
3. **Middleware Pattern**: Express middleware chain
4. **Factory Pattern**: Database connection factories
5. **Strategy Pattern**: Multiple payroll cycle strategies

### Frontend Patterns

1. **Component Composition**: Reusable React components
2. **Container/Presentation**: Smart vs. presentational components
3. **Context API**: Global state management
4. **Custom Hooks**: Reusable stateful logic
5. **HOC (Higher-Order Components)**: ProtectedRoute wrapper

---

## Error Handling Strategy

### Backend Error Handling

```javascript
// Centralized error handler
app.use((error, req, res, next) => {
  // Log error
  logger.error(error)
  
  // Return standardized error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  })
})
```

### Frontend Error Handling

```javascript
// Error Boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error to service
    logErrorToService(error, errorInfo)
    
    // Update state to show fallback UI
    this.setState({ hasError: true })
  }
}
```

---

## Logging Strategy

### Log Levels
- **ERROR**: System errors, exceptions
- **WARN**: Unusual but handled situations
- **INFO**: Important business events (payroll run completed)
- **DEBUG**: Detailed debugging information
- **TRACE**: Very detailed debugging (disabled in production)

### Log Locations
- Console output (development)
- Centralized logging service (production)
- Database audit tables (critical operations)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Reverse Proxy (Nginx)              │
│         SSL Termination & Load Balancing        │
└─────────────────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │                              │
┌───────▼────────┐           ┌─────────▼────────┐
│  Frontend      │           │  Backend         │
│  React App     │           │  Node.js/Express │
│  (Static)      │           │  (PM2 Process)   │
│  Port 3000     │           │  Port 4000       │
└────────────────┘           └──────────────────┘
                                      ↓
                    ┌─────────────────────────────┐
                    │                             │
            ┌───────▼────────┐         ┌──────────▼────────┐
            │   ArangoDB     │         │      MSSQL        │
            │   Port 8529    │         │   Port 1433       │
            └────────────────┘         └───────────────────┘
```

---

## Technology Decision Rationale

### Why ArangoDB?
- Multi-model (document + graph)
- Flexible schema for evolving employee data
- Built-in query language (AQL)
- Good performance for complex queries

### Why React?
- Component-based architecture
- Large ecosystem and community
- Excellent developer experience
- Easy to find developers

### Why Express?
- Minimal and flexible
- Large middleware ecosystem
- Well-documented
- Industry standard

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team
