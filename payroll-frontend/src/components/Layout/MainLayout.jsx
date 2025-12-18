import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
 // Move debugger here
const RouteDebugger = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.group('🚦 Route Debugging');
    console.log('Current Path:', location.pathname);
    console.log('User Role:', user?.role);
    console.log('Full URL:', window.location.href);
    console.groupEnd();
  }, [location, user]);

  return null;
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  
  const isEmployeeProfile = location.pathname.includes('/hr/employees/');

  return (
    <div className="flex">
      <RouteDebugger />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} user={user}  />
      <div className="main-content w-full min-h-screen">
        <TopNav toggleSidebar={toggleSidebar} user={user} />
        {/* Outlet renders the nested routes */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;