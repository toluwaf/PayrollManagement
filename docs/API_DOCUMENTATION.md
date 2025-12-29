# API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Standards](#api-standards)
- [Employee Endpoints](#employee-endpoints)
- [Payroll Endpoints](#payroll-endpoints)
- [Finance Endpoints](#finance-endpoints)
- [Compliance Endpoints](#compliance-endpoints)
- [Reports Endpoints](#reports-endpoints)
- [Settings Endpoints](#settings-endpoints)
- [Error Handling](#error-handling)
- [Response Formats](#response-formats)

---

## Overview

### Base URL
```
Development: http://localhost:4000/api
Production:  https://your-domain.com/api
```

### API Version
Current version: `v1` (implicit in all endpoints)

### Content Type
All requests and responses use `application/json`

### Rate Limiting
- **Development**: 1000 requests per 15 minutes
- **Production**: 500 requests per 15 minutes per IP

---

## Authentication

### Authentication Method
The API uses **JWT (JSON Web Tokens)** for authentication.

### Login Flow

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    }
  }
}
```

#### 2. Use Token in Requests
Include the token in the `Authorization` header:

```http
GET /api/employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. Token Expiration
- Tokens expire after **24 hours**
- Client should handle `401 Unauthorized` and redirect to login

### Authorization Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full system access |
| **hr** | Employee management, positions |
| **payroll** | Payroll processing, history |
| **finance** | Bank disbursements, JV allocations |
| **compliance** | Deductions, compliance tracking |
| **executive** | Read-only access to reports |

---

## API Standards

### HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Retrieve resources |
| `POST` | Create new resources |
| `PUT` | Update existing resources |
| `DELETE` | Delete resources |

### Standard Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 20) | `?limit=50` |
| `search` | string | Search term | `?search=john` |
| `status` | string | Filter by status | `?status=active` |
| `sort` | string | Sort field | `?sort=name` |
| `order` | string | Sort order (asc/desc) | `?order=desc` |

---

## Employee Endpoints

### List All Employees

```http
GET /api/employees
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (integer): Page number
- `limit` (integer): Items per page
- `department` (string): Filter by department
- `status` (string): Filter by status (active, suspended, terminated)
- `search` (string): Search by name, email, or employee ID
- `jvPartner` (string): Filter by JV partner

**Example Request**:
```bash
curl -X GET "http://localhost:4000/api/employees?page=1&limit=20&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "id": "emp001",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering",
      "position": "Software Engineer",
      "status": "active",
      "basicSalary": 500000,
      "hireDate": "2023-01-15",
      "createdAt": "2023-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Get Single Employee

```http
GET /api/employees/:id
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "id": "emp001",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+234-800-000-0000",
    "department": "Engineering",
    "position": "Software Engineer",
    "grade": "Level 5",
    "status": "active",
    "basicSalary": 500000,
    "allowances": {
      "housing": 150000,
      "transport": 50000,
      "utility": 25000
    },
    "bankDetails": {
      "bankName": "GTBank",
      "accountNumber": "0123456789",
      "accountName": "John Doe"
    },
    "taxInfo": {
      "taxId": "TAX123456",
      "pensionId": "PEN123456"
    },
    "hireDate": "2023-01-15",
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2024-12-29T10:00:00Z"
  }
}
```

### Create Employee

```http
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "employeeId": "EMP002",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+234-800-000-0001",
  "department": "HR",
  "position": "HR Manager",
  "grade": "Level 6",
  "basicSalary": 600000,
  "allowances": {
    "housing": 180000,
    "transport": 60000,
    "utility": 30000
  },
  "bankDetails": {
    "bankName": "Access Bank",
    "accountNumber": "9876543210",
    "accountName": "Jane Smith"
  },
  "taxInfo": {
    "taxId": "TAX789012",
    "pensionId": "PEN789012"
  },
  "hireDate": "2024-01-01",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "emp002",
    "employeeId": "EMP002",
    "name": "Jane Smith",
    ...
  }
}
```

### Update Employee

```http
PUT /api/employees/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: (partial update supported)
```json
{
  "basicSalary": 650000,
  "position": "Senior HR Manager",
  "status": "active"
}
```

### Delete Employee

```http
DELETE /api/employees/:id
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### Get Employee Full Profile

```http
GET /api/employees/:id/full-profile
Authorization: Bearer {token}
```

Returns complete employee data including addresses, education, documents, etc.

### Get Employee Addresses

```http
GET /api/employees/:id/addresses
Authorization: Bearer {token}
```

### Add Employee Address

```http
POST /api/employees/:id/addresses
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "residential",
  "street": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "postalCode": "100001",
  "isPrimary": true
}
```

### Get Employee Documents

```http
GET /api/employees/:id/documents
Authorization: Bearer {token}
```

### Add Employee Document

```http
POST /api/employees/:id/documents
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "passport",
  "title": "International Passport",
  "documentNumber": "A12345678",
  "issueDate": "2020-01-01",
  "expiryDate": "2025-01-01",
  "fileUrl": "https://storage.example.com/docs/passport.pdf"
}
```

### Get Employee Payroll History

```http
GET /api/employees/:id/payroll-history
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-12",
      "grossSalary": 720000,
      "totalDeductions": 145000,
      "netSalary": 575000,
      "paymentDate": "2024-12-25",
      "status": "paid"
    }
  ]
}
```

### Calculate Employee Payroll

```http
POST /api/employees/:id/calculate-payroll
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "period": "2024-12",
  "includeOvertime": true,
  "overtimeHours": 10
}
```

---

## Payroll Endpoints

### List All Payroll Runs

```http
GET /api/payroll
Authorization: Bearer {token}
```

**Query Parameters**:
- `period` (string): Filter by period (e.g., "2024-12")
- `status` (string): Filter by status (draft, pending, approved, paid)
- `page`, `limit`: Pagination

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "payroll001",
      "period": "2024-12",
      "cycle": "monthly",
      "status": "approved",
      "totalEmployees": 150,
      "totalGross": 75000000,
      "totalDeductions": 18750000,
      "totalNet": 56250000,
      "processedDate": "2024-12-20T10:00:00Z",
      "approvedBy": "admin@example.com",
      "approvedDate": "2024-12-21T10:00:00Z"
    }
  ]
}
```

### Get Payroll Run by ID

```http
GET /api/payroll/:id
Authorization: Bearer {token}
```

### Process Payroll

```http
POST /api/payroll/process
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "period": "2024-12",
  "cycle": "monthly",
  "employeeIds": ["emp001", "emp002"],  // Optional: specific employees
  "includeOvertime": true,
  "adjustments": [
    {
      "employeeId": "emp001",
      "type": "bonus",
      "amount": 50000,
      "description": "Performance bonus"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payroll processed successfully",
  "data": {
    "payrollRunId": "payroll001",
    "period": "2024-12",
    "summary": {
      "totalEmployees": 150,
      "totalGross": 75000000,
      "totalDeductions": 18750000,
      "totalNet": 56250000
    },
    "breakdown": {
      "baseSalary": 60000000,
      "allowances": 15000000,
      "bonuses": 500000,
      "pension": 6000000,
      "paye": 11250000,
      "otherDeductions": 1500000
    }
  }
}
```

### Approve Payroll

```http
POST /api/payroll/:id/approve
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "comment": "Approved after review"
}
```

### Get Payroll Summary

```http
GET /api/payroll/summary/:period
Authorization: Bearer {token}
```

**Example**: `GET /api/payroll/summary/2024-12`

### Get Employee Payslip

```http
GET /api/payroll/payslip/:employeeId/:period
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp001",
      "name": "John Doe",
      "employeeId": "EMP001",
      "department": "Engineering"
    },
    "period": "2024-12",
    "earnings": {
      "basicSalary": 500000,
      "housingAllowance": 150000,
      "transportAllowance": 50000,
      "utilityAllowance": 25000,
      "overtime": 20000,
      "bonus": 50000,
      "totalGross": 795000
    },
    "deductions": {
      "pension": 63600,
      "paye": 120000,
      "nhf": 25000,
      "loan": 20000,
      "totalDeductions": 228600
    },
    "netSalary": 566400,
    "paymentDate": "2024-12-25",
    "paymentMethod": "Bank Transfer",
    "bankDetails": {
      "bankName": "GTBank",
      "accountNumber": "0123456789"
    }
  }
}
```

### Payroll Adjustments

#### Get All Adjustments

```http
GET /api/payroll/adjustments/list
Authorization: Bearer {token}
```

#### Create Adjustment

```http
POST /api/payroll/adjustments/create
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "employeeId": "emp001",
  "type": "bonus",
  "amount": 50000,
  "period": "2024-12",
  "description": "Year-end performance bonus",
  "isRecurring": false
}
```

#### Bulk Create Adjustments

```http
POST /api/payroll/adjustments/bulk-create
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "adjustments": [
    {
      "employeeId": "emp001",
      "type": "bonus",
      "amount": 50000,
      "period": "2024-12"
    },
    {
      "employeeId": "emp002",
      "type": "deduction",
      "amount": 10000,
      "period": "2024-12"
    }
  ]
}
```

### Generate Payroll Periods

```http
GET /api/payroll/periods/generate
Authorization: Bearer {token}
```

**Query Parameters**:
- `year` (integer): Year to generate periods for
- `cycle` (string): Payroll cycle (monthly, bi-weekly, weekly)

### Get Payroll History

```http
GET /api/payroll/history/all
Authorization: Bearer {token}
```

**Query Parameters**:
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `employeeId` (string): Filter by employee

---

## Finance Endpoints

### Bank Disbursement

#### Get Bank Disbursement Files

```http
GET /api/bank-disbursement
Authorization: Bearer {token}
```

#### Generate Bank Disbursement File

```http
POST /api/bank-disbursement/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "payrollRunId": "payroll001",
  "bankCode": "GTB",
  "format": "csv"  // or "excel", "text"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.example.com/disbursements/2024-12-gtb.csv",
    "totalAmount": 56250000,
    "totalRecords": 150,
    "generatedAt": "2024-12-22T10:00:00Z"
  }
}
```

### JV Allocations

#### Get All JV Partners

```http
GET /api/jv-partners
Authorization: Bearer {token}
```

#### Get JV Allocations

```http
GET /api/jv-allocations
Authorization: Bearer {token}
```

#### Create JV Allocation

```http
POST /api/jv-allocations
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Project Alpha",
  "code": "JV001",
  "percentage": 100,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "costCenter": "CC001"
}
```

#### Get JV Report

```http
GET /api/jv/report
Authorization: Bearer {token}
```

**Query Parameters**:
- `period` (string): Reporting period
- `jvPartnerId` (string): Filter by JV partner

---

## Compliance Endpoints

### Deductions

#### Get All Deductions

```http
GET /api/deductions
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ded001",
      "name": "Pension",
      "type": "percentage",
      "rate": 8,
      "isStatutory": true,
      "isActive": true
    },
    {
      "id": "ded002",
      "name": "NHF",
      "type": "percentage",
      "rate": 2.5,
      "isStatutory": true,
      "isActive": true
    }
  ]
}
```

#### Create Deduction

```http
POST /api/deductions
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Union Dues",
  "type": "fixed",
  "amount": 5000,
  "isStatutory": false,
  "description": "Monthly union membership fee"
}
```

#### Update Deduction

```http
PUT /api/deductions/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Deduction

```http
DELETE /api/deductions/:id
Authorization: Bearer {token}
```

---

## Reports Endpoints

### Generate Report

```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "reportType": "payroll_summary",  // or "employee_list", "tax_report", etc.
  "period": "2024-12",
  "format": "pdf",  // or "excel", "csv"
  "filters": {
    "department": "Engineering",
    "status": "active"
  }
}
```

### Get Available Reports

```http
GET /api/reports/available
Authorization: Bearer {token}
```

### Download Report

```http
GET /api/reports/download/:reportId
Authorization: Bearer {token}
```

---

## Settings Endpoints

### Get All Settings

```http
GET /api/settings
Authorization: Bearer {token}
```

### Get Setting by Key

```http
GET /api/settings/:key
Authorization: Bearer {token}
```

**Example**: `GET /api/settings/payroll_cycle`

### Update Setting

```http
PUT /api/settings/:key
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "value": "monthly"
}
```

### Get Tax Brackets

```http
GET /api/settings/tax-brackets
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    { "min": 0, "max": 300000, "rate": 7 },
    { "min": 300000, "max": 600000, "rate": 11 },
    { "min": 600000, "max": 1100000, "rate": 15 },
    { "min": 1100000, "max": 1600000, "rate": 19 },
    { "min": 1600000, "max": 3200000, "rate": 21 },
    { "min": 3200000, "max": null, "rate": 24 }
  ]
}
```

### Update Tax Brackets

```http
PUT /api/settings/tax-brackets
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error (development only)",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Validation error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Common Error Examples

**Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "basicSalary",
      "message": "Basic salary must be greater than 0"
    }
  ],
  "statusCode": 422
}
```

**Authentication Error**:
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

**Authorization Error**:
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

---

## Response Formats

### Success Response (Single Resource)

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {
    // Resource object
  }
}
```

### Success Response (Multiple Resources)

```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [
    // Array of resources
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Empty Result

```json
{
  "success": true,
  "message": "No results found",
  "data": []
}
```

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@payroll.com","password":"admin123"}'

# Get employees (with token)
curl -X GET http://localhost:4000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create employee
curl -X POST http://localhost:4000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","department":"IT"}'
```

### Using Postman

1. Create a new collection
2. Add environment variable: `BASE_URL = http://localhost:4000/api`
3. Add environment variable: `TOKEN = <your_jwt_token>`
4. Create requests using: `{{BASE_URL}}/employees`
5. Add header: `Authorization: Bearer {{TOKEN}}`

---

## Pagination

All list endpoints support pagination:

**Request**:
```http
GET /api/employees?page=2&limit=50
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "pages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Rate Limiting

**Headers Returned**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640095200
```

**Rate Limit Exceeded Response**:
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "statusCode": 429,
  "retryAfter": 900
}
```

---

## Webhooks (Future Feature)

Planned webhook events:
- `payroll.processed`
- `payroll.approved`
- `employee.created`
- `employee.updated`

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**API Maintainer**: Backend Team
