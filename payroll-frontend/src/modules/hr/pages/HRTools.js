import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const HRTools = () => {
  const location = useLocation();

  const tools = [
    { name: 'Attendance', path: '/hr/tools/attendance', description: 'Manage staff attendance and time tracking' },
    { name: 'Leave Management', path: '/hr/tools/leave', description: 'Handle leave requests and approvals' },
    { name: 'Forms & Documents', path: '/hr/tools/forms', description: 'Access HR forms and templates' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">HR Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`p-6 border rounded-lg hover:shadow-md transition-shadow ${
              location.pathname === tool.path 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Outlet />
      </div>
    </div>
  );
};

export default HRTools;