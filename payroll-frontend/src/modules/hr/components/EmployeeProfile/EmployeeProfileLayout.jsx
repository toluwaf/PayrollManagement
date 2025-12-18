// components/EmployeeProfile/EmployeeProfileLayout.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';
import EmployeeSidebar from './EmployeeSidebar'
import EmployeeHeader from './EmployeeHeader';

const EmployeeProfileLayout = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [id]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Try full profile first, fallback to basic
      let response;
      try {
        response = await employeeService.getEmployeeFullProfile(id);
      } catch (error) {
        console.warn('Full profile failed, using basic:', error);
        response = await employeeService.getEmployeeById(id);
      }
      
      if (response.success) {
        setEmployee(response.data);
      } else {
        throw new Error(response.message || 'Failed to load employee');
      }
    } catch (error) {
      console.error('Employee loading failed:', error);
      // Set empty employee to prevent crashes
      setEmployee({ 
        _key: id, 
        name: 'Unknown Employee',
        position: 'Unknown Position',
        status: 'unknown',
        employeeId: 'Unknown ID'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeUpdate = (updatedEmployee) => {
    setEmployee(updatedEmployee);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <EmployeeSidebar 
        employee={employee} // ✅ Make sure this is passed
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmployeeHeader 
          employee={employee}
          onRefresh={loadEmployeeData}
        />
        
        {/* Profile Sections */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ 
            employee, 
            onEmployeeUpdate: handleEmployeeUpdate,
            reloadEmployee: loadEmployeeData 
          }} />
        </main>
      </div>
    </div>
  );
};

export default EmployeeProfileLayout;