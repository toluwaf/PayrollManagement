# Frontend Development Guide

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Module Architecture](#module-architecture)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [Routing](#routing)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Development Workflow](#development-workflow)
- [Best Practices](#best-practices)

---

## Overview

The frontend is a **React 19** Single Page Application (SPA) built with a **modular architecture**. Each business domain (HR, Payroll, Finance, Compliance) is organized as a self-contained module with its own pages and components.

### Key Characteristics
- **Framework**: React 19.1 with functional components and hooks
- **Routing**: React Router v7 with nested routes
- **State Management**: React Context API (AuthContext, SettingsContext)
- **Styling**: Tailwind CSS utility-first framework
- **HTTP Client**: Axios with interceptors
- **Data Visualization**: Chart.js with react-chartjs-2

---

## Project Structure

```
payroll-frontend/src/
│
├── App.js                      # Main application component with routing
├── index.js                    # React entry point
├── index.css                   # Global styles (Tailwind imports)
│
├── modules/                    # Feature modules (domain-driven design)
│   ├── hr/                    # Human Resources Module
│   │   ├── pages/             # Page components
│   │   │   ├── HRDashboard.js
│   │   │   ├── Employees.js
│   │   │   ├── Positions.js
│   │   │   └── EmployeeProfile/
│   │   │       ├── EmployeeDetails.js
│   │   │       ├── EmployeeFinance.js
│   │   │       ├── EmployeeCompliance.js
│   │   │       └── ...
│   │   └── components/        # HR-specific components
│   │       ├── Employees/
│   │       │   └── EmployeeTable.jsx
│   │       └── EmployeeProfile/
│   │           └── ProfileTabs.jsx
│   │
│   ├── payroll/               # Payroll Module
│   │   ├── pages/
│   │   │   ├── PayrollDashboard.js
│   │   │   ├── Payroll.js
│   │   │   ├── PayrollHistory.js
│   │   │   ├── PayrollSettings.js
│   │   │   └── AdjustmentsManagement.js
│   │   └── components/
│   │       ├── calculator/
│   │       │   └── PAYECalculatorVisualization.jsx
│   │       └── AnnualBreakdownComponents/
│   │
│   ├── finance/               # Finance Module
│   │   ├── pages/
│   │   └── components/
│   │
│   ├── compliance/            # Compliance Module
│   │   ├── pages/
│   │   └── components/
│   │
│   ├── reports/               # Reports Module
│   └── settings/              # Settings Module
│
├── components/                 # Shared components
│   ├── Common/                # Generic reusable components
│   │   ├── DataTable.jsx      # Reusable table component
│   │   ├── Modal.jsx          # Modal dialog
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   ├── ErrorBoundary.jsx  # Error boundary wrapper
│   │   └── MessageDisplay.jsx # Alert/message component
│   │
│   ├── Layout/                # Layout components
│   │   ├── MainLayout.jsx     # Main app layout wrapper
│   │   ├── Sidebar.js         # Navigation sidebar
│   │   ├── TopNav.js          # Top navigation bar
│   │   └── Breadcrumbs.jsx    # Breadcrumb navigation
│   │
│   └── Auth/                  # Authentication components
│       └── ProtectedRoute.js  # Route protection wrapper
│
├── context/                    # React Context providers
│   ├── AuthContext.js         # Authentication state management
│   └── SettingsContext.js     # App settings state management
│
├── hooks/                      # Custom React hooks
│   ├── usePayeCalculator.js   # PAYE calculation logic
│   ├── usePayrollSettings.js  # Payroll settings management
│   └── useTaxBracketManager.js # Tax bracket management
│
├── services/                   # API service layer
│   ├── api.js                 # Axios instance configuration
│   ├── authService.js         # Authentication API calls
│   ├── employeeService.js     # Employee API calls
│   └── payrollService.js      # Payroll API calls
│
├── utils/                      # Utility functions
│   ├── formatters.js          # Data formatting utilities
│   ├── validators.js          # Validation helpers
│   └── constants.js           # App constants
│
└── pages/                      # Top-level pages
    ├── Dashboard.js           # Main dashboard
    └── Login.js               # Login page
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React Router** | 7.9.1 | Client-side routing |
| **React Scripts** | 5.0.1 | Build tooling (CRA) |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |

### Data & API

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.12.2 | HTTP client |
| **Chart.js** | 4.5.0 | Data visualization |
| **react-chartjs-2** | 5.3.0 | React wrapper for Chart.js |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **@testing-library/react** | 16.3.0 | Component testing |
| **@testing-library/jest-dom** | 6.8.0 | Jest matchers |
| **@testing-library/user-event** | 13.5.0 | User interaction simulation |

---

## Module Architecture

### Module Structure Pattern

Each module follows this structure:

```
module-name/
├── pages/                  # Page components (routes)
│   ├── ModuleDashboard.js
│   ├── FeatureList.js
│   └── FeatureDetail.js
├── components/             # Module-specific components
│   ├── FeatureTable.jsx
│   ├── FeatureForm.jsx
│   └── FeatureCard.jsx
└── hooks/                  # Module-specific hooks (optional)
    └── useFeatureData.js
```

### HR Module Example

**Location**: `src/modules/hr/`

**Pages**:
- `HRDashboard.js` - HR metrics and overview
- `Employees.js` - Employee list and management
- `Positions.js` - Job position management
- `EmployeeProfile/` - Detailed employee views

**Routes**:
```javascript
/hr                        → HRDashboard
/hr/employees              → Employees (list)
/hr/employees/:id          → EmployeeProfile
/hr/employees/:id/details  → EmployeeDetails
/hr/employees/:id/finance  → EmployeeFinance
/hr/positions              → Positions
```

### Payroll Module Example

**Location**: `src/modules/payroll/`

**Pages**:
- `PayrollDashboard.js` - Payroll metrics
- `Payroll.js` - Process new payroll
- `PayrollHistory.js` - Historical payroll runs
- `PayrollSettings.js` - Payroll configuration
- `AdjustmentsManagement.js` - Manage adjustments

**Routes**:
```javascript
/payroll                   → PayrollDashboard
/payroll/process           → Payroll (processing)
/payroll/history           → PayrollHistory
/payroll/settings          → PayrollSettings
/payroll/adjustment        → AdjustmentsManagement
```

---

## Component Guidelines

### Component Types

#### 1. Page Components
Full-page views that correspond to routes.

**Example**: `Employees.js`
```javascript
import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import DataTable from '../../components/Common/DataTable';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>
      <DataTable 
        data={employees}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}

export default Employees;
```

#### 2. Reusable Components
Generic components used across modules.

**Example**: `DataTable.jsx`
```javascript
import React from 'react';

function DataTable({ data, columns, loading, onRowClick }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr 
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
```

#### 3. Modal Components
Overlay dialogs for forms and confirmations.

**Example**: `Modal.jsx`
```javascript
import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
```

---

## State Management

### React Context API

The application uses React Context for global state:

#### 1. AuthContext

**Location**: `src/context/AuthContext.js`

**Purpose**: Manage authentication state and user information

**API**:
```javascript
const { user, login, logout, isAuthenticated, loading } = useAuth();

// Login
await login(email, password);

// Logout
logout();

// Check if authenticated
if (isAuthenticated) {
  // User is logged in
}

// Access user data
console.log(user.name, user.role);
```

**Implementation**:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 2. SettingsContext

**Location**: `src/context/SettingsContext.js`

**Purpose**: Manage application settings and configurations

**API**:
```javascript
const { settings, updateSettings, loading } = useSettings();

// Access settings
console.log(settings.payrollCycle);

// Update settings
await updateSettings({ payrollCycle: 'monthly' });
```

### Local Component State

Use `useState` for component-specific state:

```javascript
import { useState } from 'react';

function EmployeeForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Routing

### Router Configuration

**Location**: `src/App.js`

The application uses React Router v7 with nested routes:

```javascript
<Router>
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    
    {/* Protected routes */}
    <Route path="/" element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }>
      {/* Nested routes */}
      <Route index element={<Dashboard />} />
      
      <Route path="hr">
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
      </Route>
      
      <Route path="payroll">
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<PayrollDashboard />} />
        <Route path="process" element={<Payroll />} />
        <Route path="history" element={<PayrollHistory />} />
      </Route>
    </Route>
  </Routes>
</Router>
```

### Protected Routes

**Location**: `src/components/Auth/ProtectedRoute.js`

Routes that require authentication:

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

### Navigation

**Programmatic Navigation**:
```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/hr/employees');
  };

  return <button onClick={handleClick}>Go to Employees</button>;
}
```

**Link Navigation**:
```javascript
import { Link } from 'react-router-dom';

<Link to="/hr/employees" className="text-blue-500">
  View Employees
</Link>
```

---

## API Integration

### API Service Layer

**Location**: `src/services/`

#### Base API Configuration

**File**: `src/services/api.js`
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Service Example

**File**: `src/services/employeeService.js`
```javascript
import api from './api';

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  
  getById: (id) => api.get(`/employees/${id}`),
  
  create: (data) => api.post('/employees', data),
  
  update: (id, data) => api.put(`/employees/${id}`, data),
  
  delete: (id) => api.delete(`/employees/${id}`),
  
  getPayrollHistory: (id) => api.get(`/employees/${id}/payroll-history`)
};
```

#### Using Services in Components

```javascript
import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll({ status: 'active' });
      setEmployees(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>...</div>;
}
```

---

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling.

**Configuration**: `tailwind.config.js`
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
      }
    },
  },
  plugins: [],
}
```

### Common Tailwind Patterns

**Card Component**:
```javascript
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold mb-4">Card Title</h2>
  <p className="text-gray-600">Card content</p>
</div>
```

**Button Styles**:
```javascript
// Primary button
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Submit
</button>

// Secondary button
<button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
  Cancel
</button>
```

**Form Input**:
```javascript
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text"
/>
```

**Responsive Grid**:
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## Development Workflow

### Starting Development Server

```bash
cd payroll-frontend
npm start
```

This starts the development server at `http://localhost:3000` with:
- Hot reloading
- Error overlay
- Auto-refresh on file changes

### Building for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

### Running Tests

```bash
npm test              # Interactive test runner
npm test -- --coverage  # With coverage report
```

### Code Quality

**ESLint**: Check code quality
```bash
npm run lint
```

**Format Code**:
```bash
npm run format
```

---

## Best Practices

### 1. Component Organization

✅ **DO**:
```javascript
// Organize imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import services
import { employeeService } from '../../services/employeeService';

// Import components
import DataTable from '../../components/Common/DataTable';

// Component
function Employees() {
  // Hooks
  const navigate = useNavigate();
  
  // State
  const [employees, setEmployees] = useState([]);
  
  // Effects
  useEffect(() => {
    loadEmployees();
  }, []);
  
  // Functions
  const loadEmployees = async () => {
    // ...
  };
  
  // Render
  return <div>...</div>;
}

export default Employees;
```

### 2. Error Handling

✅ **DO**:
```javascript
try {
  const response = await employeeService.create(data);
  // Handle success
  showSuccessMessage('Employee created!');
  navigate('/hr/employees');
} catch (error) {
  // Handle error
  showErrorMessage(error.response?.data?.message || 'Failed to create employee');
}
```

### 3. Loading States

✅ **DO**:
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.call();
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Processing...' : 'Submit'}
  </button>
);
```

### 4. Form Handling

✅ **DO**:
```javascript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

<input
  name="name"
  value={formData.name}
  onChange={handleChange}
/>
```

### 5. Conditional Rendering

✅ **DO**:
```javascript
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}
{!loading && !error && <DataTable data={data} />}
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Frontend Team**: Development Team
