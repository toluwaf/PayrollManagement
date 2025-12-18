import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

const EmployeeSidebar = ({ isOpen, toggleSidebar, employee }) => {
  const { id } = useParams();
  const location = useLocation();

  // Add safety checks for employee data
  const getEmployeeInitials = () => {
    if (!employee?.name) return '...';
    return employee.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getEmployeeStatus = () => {
    if (!employee?.status) return 'Unknown';
    return employee.status.charAt(0).toUpperCase() + employee.status.slice(1);
  };
  const navigationSections = [
    {
      category: 'Profile',
      items: [
        { 
          name: 'Details', 
          href: `/hr/employees/${id}/details`,
          icon: 'user',
          description: 'Personal & employment information',
          badge: null
        },
        { 
          name: 'Employment History', 
          href: `/hr/employees/${id}/employment`,
          icon: 'briefcase',
          description: 'Job history & contracts',
          badge: employee?.employmentHistory?.length || 0
        },
        { 
          name: 'Education', 
          href: `/hr/employees/${id}/education`,
          icon: 'academic-cap',
          description: 'Educational background',
          badge: employee?.education?.length || 0
        },
        { 
          name: 'Addresses', 
          href: `/hr/employees/${id}/addresses`,
          icon: 'home',
          description: 'Current & previous addresses',
          badge: employee?.addresses?.length || 0
        }
      ]
    },
    {
      category: 'Financial',
      items: [
        { 
          name: 'Finance', 
          href: `/hr/employees/${id}/finance`,
          icon: 'currency-dollar',
          description: 'Salary & bank information',
          badge: null
        },
        { 
          name: 'Compliance', 
          href: `/hr/employees/${id}/compliance`,
          icon: 'shield-check',
          description: 'Tax & statutory deductions',
          badge: null
        },
        { 
          name: 'Allocations', 
          href: `/hr/employees/${id}/emp-jvallocations`,
          icon: 'chart-pie',
          description: 'Employee JV Allocations',
          badge: employee?.jvAllocations?.length || 0
        },

      ]
    },
    {
      category: 'Documents',
      items: [
        { 
          name: 'Documents', 
          href: `/hr/employees/${id}/documents`,
          icon: 'folder',
          description: 'Contracts & certificates',
          badge: employee?.documents?.length || 0
        }
      ]
    }
  ];

  const getIcon = (iconName) => {
    const iconClass = "h-5 w-5";
    const icons = {
      user: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      briefcase: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
        </svg>
      ),
      'academic-cap': (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      home: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      'currency-dollar': (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'shield-check': (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'chart-pie': (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      folder: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    };
    return icons[iconName] || icons.user;
  };

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  // Show loading state if employee data isn't available
  if (!employee) {
    return (
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              {[1, 2, 3].map(j => (
                <div key={j} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Employee Summary Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {getEmployeeInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {employee?.name || 'Unknown Employee'}
              </h2>
              <p className="text-sm text-gray-600 truncate">
                {employee?.position || 'No position'}
              </p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  employee?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : employee?.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getEmployeeStatus()}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {employee?.employeeId || 'No ID'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.category}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        className={`
                          flex items-center px-3 py-3 text-sm rounded-xl transition-all duration-200 group
                          ${isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                          }
                        `}
                      >
                        <span className={`mr-3 transition-colors ${
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                        }`}>
                          {getIcon(item.icon)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{item.name}</span>
                            {item.badge !== null && item.badge > 0 && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer with Back Button */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <Link
            to="/hr/employees"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Employees
          </Link>
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;