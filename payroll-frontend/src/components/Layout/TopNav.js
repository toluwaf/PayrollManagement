// import React, { useState, useRef, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';

// const TopNav = ({ toggleSidebar, user }) => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const profileRef = useRef(null);
//   const { logout } = useAuth();

//   // Close profile dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setIsProfileOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getInitials = (name) => {
//     return name
//       ?.split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase() || 'U';
//   };

//   const getRoleBadge = (role) => {
//     const roleConfig = {
//       admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
//       hr: { color: 'bg-blue-100 text-blue-800', label: 'HR' },
//       payroll: { color: 'bg-green-100 text-green-800', label: 'Payroll' },
//       finance: { color: 'bg-purple-100 text-purple-800', label: 'Finance' },
//       compliance: { color: 'bg-orange-100 text-orange-800', label: 'Compliance' },
//       employee: { color: 'bg-gray-100 text-gray-800', label: 'Employee' }
//     };
    
//     const config = roleConfig[role] || roleConfig.employee;
//     return (
//       <span className={`px-2 py-1 ${config.color} text-xs rounded-full`}>
//         {config.label}
//       </span>
//     );
//   };

//   // Use Link component for internal navigation instead of <a> tags
//   const ProfileLink = ({ to, children, icon, onClick }) => (
//     <button
//       onClick={onClick}
//       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//     >
//       {icon}
//       {children}
//     </button>
//   );

//   return (
//     <nav className="bg-white border-b border-gray-200 px-4 py-3">
//       <div className="flex items-center justify-between">
//         {/* Left side - Menu button and breadcrumb */}
//         <div className="flex items-center">
//           <button
//             onClick={toggleSidebar}
//             className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
//             aria-label="Toggle sidebar"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>
          
//           <div className="ml-4">
//             <h1 className="text-xl font-semibold text-gray-800">Payroll Dashboard</h1>
//             <p className="text-sm text-gray-500 hidden sm:block">
//               Welcome back, {user?.name || 'User'}
//             </p>
//           </div>
//         </div>

//         {/* Right side - User menu and notifications */}
//         <div className="flex items-center space-x-4">
//           {/* Notifications */}
//           <button 
//             className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
//             aria-label="Notifications"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//             </svg>
//             <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
//               3
//             </span>
//           </button>

//           {/* User profile dropdown */}
//           <div className="relative" ref={profileRef}>
//             <button
//               onClick={() => setIsProfileOpen(!isProfileOpen)}
//               className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="User menu"
//               aria-expanded={isProfileOpen}
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//                   {getInitials(user?.name)}
//                 </div>
//                 <div className="hidden md:block text-left">
//                   <p className="text-sm font-medium text-gray-700">{user?.name}</p>
//                   <p className="text-xs text-gray-500">{user?.email}</p>
//                 </div>
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   className={`h-5 w-5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
//                   viewBox="0 0 20 20" 
//                   fill="currentColor"
//                 >
//                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             </button>

//             {isProfileOpen && (
//               <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
//                 <div className="px-4 py-3 border-b border-gray-100">
//                   <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
//                   <p className="text-sm text-gray-500 truncate">{user?.email}</p>
//                   <div className="mt-1">
//                     {getRoleBadge(user?.role)}
//                   </div>
//                 </div>
                
//                 <div className="py-1">
//                   <ProfileLink
//                     onClick={() => {
//                       window.location.href = '/settings';
//                       setIsProfileOpen(false);
//                     }}
//                     icon={
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                     }
//                   >
//                     Account Settings
//                   </ProfileLink>
                  
//                   <ProfileLink
//                     onClick={() => {
//                       window.location.href = '/profile';
//                       setIsProfileOpen(false)
//                     }}
//                     icon={
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     }
//                   >
//                     My Profile
//                   </ProfileLink>
//                 </div>
                
//                 <div className="py-1 border-t border-gray-100">
//                   <ProfileLink
//                     onClick={logout}
//                     icon={
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                       </svg>
//                     }
//                   >
//                     Sign Out
//                   </ProfileLink>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;




// src/components/Layout/TopNav.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

const TopNav = ({ toggleSidebar, user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const profileRef = useRef(null);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active module based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/hr')) setActiveModule('hr');
    else if (path.startsWith('/payroll')) setActiveModule('payroll');
    else if (path.startsWith('/finance')) setActiveModule('finance');
    else if (path.startsWith('/compliance')) setActiveModule('compliance');
    else if (path.startsWith('/reports')) setActiveModule('reports');
    else if (path.startsWith('/settings')) setActiveModule('settings');
    else setActiveModule('dashboard');
  }, [location.pathname]);

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
      hr: { color: 'bg-blue-100 text-blue-800', label: 'HR' },
      payroll: { color: 'bg-green-100 text-green-800', label: 'Payroll' },
      finance: { color: 'bg-purple-100 text-purple-800', label: 'Finance' },
      compliance: { color: 'bg-orange-100 text-orange-800', label: 'Compliance' },
      employee: { color: 'bg-gray-100 text-gray-800', label: 'Employee' }
    };
    
    const config = roleConfig[role] || roleConfig.employee;
    return <span className={`px-2 py-1 ${config.color} text-xs rounded-full`}>{config.label}</span>;
  };

  // Module configuration
  const modules = [
    { id: 'dashboard', name: 'Dashboard', path: '/', roles: ['admin', 'payroll', 'finance', 'compliance', 'employee', 'executive'] },
    { id: 'hr', name: 'HR Management', path: '/hr', roles: ['admin', 'hr'] },
    { id: 'payroll', name: 'Payroll', path: '/payroll', roles: ['admin', 'payroll'] },
    { id: 'finance', name: 'Finance', path: '/finance', roles: ['admin', 'finance'] },
    { id: 'compliance', name: 'Compliance', path: '/compliance', roles: ['admin', 'compliance'] },
    { id: 'reports', name: 'Reports', path: '/reports', roles: ['admin', 'payroll', 'finance', 'compliance', 'executive'] },
    { id: 'settings', name: 'Settings', path: '/settings', roles: ['admin'] },
  ];

  const filteredModules = modules.filter(module => 
    module.roles.includes(user?.role || 'employee')
  );

  const handleModuleClick = (module) => {
    navigate(module.path);
    setActiveModule(module.id);
  };

  const ProfileLink = ({ children, icon, onClick }) => (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
    >
      {icon}
      {children}
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-200">
      {/* Module Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4">
          {/* Left side - Menu button and module tabs */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex space-x-1 ml-4">
              {filteredModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {module.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - User menu and notifications */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(user?.name)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <svg className={`h-5 w-5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    <div className="mt-1">{getRoleBadge(user?.role)}</div>
                  </div>
                  
                  <div className="py-1">
                    <ProfileLink
                      onClick={() => navigate('/profile')}
                      icon={<svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    >
                      My Profile
                    </ProfileLink>
                  </div>
                  
                  <div className="py-1 border-t border-gray-100">
                    <ProfileLink
                      onClick={logout}
                      icon={<svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                    >
                      Sign Out
                    </ProfileLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Breadcrumbs />
      </div>
    </nav>
  );
};

export default TopNav;