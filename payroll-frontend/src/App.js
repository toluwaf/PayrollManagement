import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/Layout/MainLayout';
import EmployeeProfileLayout from './modules/hr/components/EmployeeProfile/EmployeeProfileLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import main pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// HR Module
import HRDashboard from './modules/hr/pages/HRDashboard';
import Employees from './modules/hr/pages/Employees';
import EmployeeProfile from './modules/hr/pages/EmployeeProfile';
import UserProfile from './modules/hr/pages/UserProfile';
import Positions from './modules/hr/pages/Positions';
import HRTools from './modules/hr/pages/HRTools';
import HRSettings from './modules/hr/pages/HRSettings';
import Attendance from './modules/hr/pages/Attendance';
import LeaveManagement from './modules/hr/pages/LeaveManagement';
import Forms from './modules/hr/pages/Forms';

// Employee Profile Module
import EmployeeDetails from './modules/hr/pages/EmployeeProfile/EmployeeDetails';
import EmployeeFinance from './modules/hr/pages/EmployeeProfile/EmployeeFinance';
import EmployeeCompliance from './modules/hr/pages/EmployeeProfile/EmployeeCompliance';
import EmployeeAddresses from './modules/hr/pages/EmployeeProfile/EmployeeAddresses';
import EmployeeEducation from './modules/hr/pages/EmployeeProfile/EmployeeEducation';
import EmployeeEmployment from './modules/hr/pages/EmployeeProfile/EmployeeEmployment';
import EmployeeDocuments from './modules/hr/pages/EmployeeProfile/EmployeeDocuments';
import EmployeeJVAllocations from './modules/hr/pages/EmployeeProfile/EmployeeJvAllocations';


// Payroll Module
import PayrollDashboard from './modules/payroll/pages/PayrollDashboard';
import PayrollProcessing from './modules/payroll/pages/Payroll';
import PayrollHistory from './modules/payroll/pages/PayrollHistory';
import PayrollSettings from './modules/payroll/pages/PayrollSettings';
import AdjustmentsManagement from './modules/payroll/pages/AdjustmentsManagement';
import PAYECalculatorVisualization from './modules/payroll/components/calculator/PAYECalculatorVisualization';

// Finance Module
import FinanceDashboard from './modules/finance/pages/FinanceDashboard';
import BankDisbursement from './modules/finance/pages/BankDisbursement';
import JVAllocations from './modules/finance/pages/JVAllocations';

// Compliance Module
import ComplianceDashboard from './modules/compliance/pages/ComplianceDashboard';
import Deductions from './modules/compliance/pages/Deductions';

// Reports Module
import Reports from './modules/reports/pages/Reports';

// Settings Module
import Settings from './modules/settings/pages/Settings';

import './index.css';



// Root app component with proper route structure
function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        
        {/* Protected routes with main layout */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'hr', 'payroll', 'finance', 'compliance', 'executive']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Index route */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<UserProfile />} />

          {/* HR Module Routes */}
          <Route path="hr">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="positions" element={<Positions />} />
            <Route path="tools" element={<HRTools/>}>
              <Route index element={<Navigate to="attendance" replace />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="forms" element={<Forms />} />
            </Route>
            <Route path="settings" element={<HRSettings />} />
          </Route>

          {/* Payroll Module */}
          <Route path="payroll">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PayrollDashboard />} />
            <Route path="process" element={<PayrollProcessing />} />
            <Route path="history" element={<PayrollHistory />} />
            <Route path="calcTesting" element={<PAYECalculatorVisualization />} />
            <Route path="adjustment" element={<AdjustmentsManagement />} />
            <Route path="settings" element={<PayrollSettings />} />
          </Route>

          {/* Finance Module */}
          <Route path="finance">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FinanceDashboard />} />
            <Route path="bank-disbursement" element={<BankDisbursement />} />
            <Route path="jv-allocations" element={<JVAllocations />} />
          </Route>

          {/* Compliance Module */}
          <Route path="compliance">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ComplianceDashboard />} />
            <Route path="deductions" element={<Deductions />} />
          </Route>

          {/* Reports & Settings (flat routes) */}
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

          {/* Redirect old routes */}
          <Route path="employees" element={<Navigate to="/hr/employees" replace />} />
          <Route path="payroll" element={<Navigate to="/payroll/process" replace />} />
          <Route path="bank-disbursement" element={<Navigate to="/finance/bank-disbursement" replace />} />
          <Route path="jv-allocations" element={<Navigate to="/finance/jv-allocations" replace />} />
          <Route path="deductions" element={<Navigate to="/compliance/deductions" replace />} />
        </Route>

          <Route path="hr/employees/:id/*" element={
            <ProtectedRoute allowedRoles={['admin', 'hr']}>
              <EmployeeProfileLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<EmployeeDetails />} />
            <Route path="finance" element={<EmployeeFinance />} />
            <Route path="compliance" element={<EmployeeCompliance />} />
            <Route path="addresses" element={<EmployeeAddresses />} />
            <Route path="education" element={<EmployeeEducation />} />
            <Route path="employment" element={<EmployeeEmployment />} />
            <Route path="documents" element={<EmployeeDocuments />} />
            <Route path="emp-jvallocations" element={<EmployeeJVAllocations />} />
            
          </Route>

        {/* Catch-all for unauthenticated */}
        <Route path="*" element={!isAuthenticated ? <Navigate to="/login" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function ConditionalSettingsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <SettingsProvider>
      {children}
    </SettingsProvider>
  ) : (
    children
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <ConditionalSettingsProvider>
        <App />
      </ConditionalSettingsProvider>
    </AuthProvider>

  );
}