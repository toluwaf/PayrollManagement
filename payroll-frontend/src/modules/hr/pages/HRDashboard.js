import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { dashboardService } from '../../../services/dashboardService';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeave: 0,
    newHires: 0,
    departments: 0
  });
  const [recentHires, setRecentHires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load HR statistics
      const statsResponse = await dashboardService.getHRStatistics();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Load recent hires
      const hiresResponse = await employeeService.getRecentHires();
      if (hiresResponse.success) {
        setRecentHires(hiresResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, description, color, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold mt-2" style={{ color }}>
            {loading ? '...' : value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="text-2xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">HR Management Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          description="Active staff"
          color="#2563eb"
          icon="👥"
        />
        
        <StatCard 
          title="On Leave" 
          value={stats.onLeave} 
          description="This month"
          color="#d97706"
          icon="🏖️"
        />
        
        <StatCard 
          title="New Hires" 
          value={stats.newHires} 
          description="This quarter"
          color="#059669"
          icon="🎉"
        />
        
        <StatCard 
          title="Departments" 
          value={stats.departments} 
          description="Active departments"
          color="#7c3aed"
          icon="🏢"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/hr/employees?action=create"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900">Add New Employee</h4>
              <p className="text-sm text-gray-500">Onboard a new team member</p>
            </Link>
            
            <Link 
              to="/hr/positions"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900">Manage Positions</h4>
              <p className="text-sm text-gray-500">Update job roles and grades</p>
            </Link>
            
            <Link 
              to="/hr/tools/attendance"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900">Attendance Report</h4>
              <p className="text-sm text-gray-500">View staff attendance</p>
            </Link>
            
            <Link 
              to="/hr/tools/leave"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900">Leave Management</h4>
              <p className="text-sm text-gray-500">Handle leave requests</p>
            </Link>
          </div>
        </div>

        {/* Recent Hires */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Hires</h2>
          <div className="space-y-3">
            {recentHires.slice(0, 5).map(employee => (
              <div key={employee._key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {employee.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(employee.joinDate).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentHires.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent hires</p>
            )}
          </div>
          {recentHires.length > 0 && (
            <Link 
              to="/hr/employees?filter=new"
              className="block text-center mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              View all employees →
            </Link>
          )}
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stats.departmentBreakdown?.map(dept => (
            <div key={dept.name} className="text-center p-3 border border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dept.count}</div>
              <div className="text-sm text-gray-600 truncate" title={dept.name}>
                {dept.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;