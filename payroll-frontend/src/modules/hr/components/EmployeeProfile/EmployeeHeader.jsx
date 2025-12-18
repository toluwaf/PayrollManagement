import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { employeeService } from '../../../../services/employeeService';

const EmployeeHeader = ({ employee, toggleSidebar, onEmployeeUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await employeeService.updateEmployee(id, {
        ...employee,
        status: newStatus
      });
      
      if (response.success) {
        onEmployeeUpdate(response.data);
        setIsStatusMenuOpen(false);
      } else {
        alert('Failed to update employee status: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to update employee status:', error);
      alert('Failed to update employee status. Please try again.');
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Export employee data:', employee);
    // This could generate a PDF or export to Excel
    alert('Export functionality coming soon!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];
    
    // Always include HR and Employees
    breadcrumbs.push({ name: 'HR', href: '/hr' });
    breadcrumbs.push({ name: 'Employees', href: '/hr/employees' });
    
    // Add current employee name
    breadcrumbs.push({ name: employee.name, href: `/hr/employees/${id}/details` });
    
    // Add current page if not details
    const currentPage = pathSegments[pathSegments.length - 1];
    if (currentPage !== 'details') {
      breadcrumbs.push({ 
        name: currentPage.charAt(0).toUpperCase() + currentPage.slice(1), 
        href: null 
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar with Actions */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Breadcrumbs and Mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.name} className="flex items-center">
                  {index > 0 && (
                    <svg className="h-4 w-4 text-gray-400 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {breadcrumb.href ? (
                    <Link
                      to={breadcrumb.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {breadcrumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right side - Actions and Status */}
          <div className="flex items-center space-x-4">
            {/* Status Badge with Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all hover:shadow-sm ${getStatusColor(employee.status)}`}
              >
                <span className="capitalize">{employee.status}</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStatusMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Change Status
                  </div>
                  {['active', 'inactive', 'on-leave', 'suspended'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-50 ${
                        employee.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>

              {/* More Actions Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="More actions"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      Employee Actions
                    </div>
                    <button
                      onClick={() => {
                        // Implement print functionality
                        window.print();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Print Profile
                    </button>
                    <button
                      onClick={() => {
                        // Implement send email functionality
                        console.log('Send email to:', employee.email);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => {
                        // Implement duplicate employee functionality
                        console.log('Duplicate employee:', employee);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Duplicate Employee
                    </button>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
                            // Implement delete functionality
                            console.log('Delete employee:', employee);
                            setIsMenuOpen(false);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete Employee
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-6">
            <span>
              <strong className="text-gray-900">ID:</strong> {employee.employeeId}
            </span>
            <span>
              <strong className="text-gray-900">Department:</strong> {employee.departmentName || employee.department}
            </span>
            <span>
              <strong className="text-gray-900">Position:</strong> {employee.position}
            </span>
            <span>
              <strong className="text-gray-900">Join Date:</strong> {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-900 font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;