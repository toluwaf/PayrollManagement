// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const location = useLocation();
//   const { user } = useAuth();

//   // Role-based menu configuration
//   const getMenuItems = (userRole) => {
//     const baseItems = [
//       { name: 'Dashboard', href: '/', icon: 'home', roles: ['admin', 'payroll', 'finance', 'compliance', 'employee', 'executive'] },
//     ];

//     const roleSpecificItems = [
//       { name: 'Employees', href: '/employees', icon: 'users', roles: ['admin'] },
//       { name: 'Payroll Processing', href: '/payroll', icon: 'currency-dollar', roles: ['admin', 'payroll'] },
//       { name: 'Statutory Deductions', href: '/deductions', icon: 'calculator', roles: ['admin', 'finance', 'compliance'] },
//       { name: 'Bank Disbursement', href: '/bank-disbursement', icon: '🏦', roles: ['admin', 'finance'] },
//       { name: 'Jv Allocations', href: '/jv-allocations', icon: '💼', roles: ['admin', 'finance'] },
//       { name: 'Reports & Analytics', href: '/reports', icon: 'chart-bar', roles: ['admin', 'payroll', 'finance', 'compliance', 'executives'] },
//       { name: 'Settings', href: '/settings', icon: 'cog', roles: ['admin'] },
      
//     ];

//     return [...baseItems, ...roleSpecificItems].filter(item => 
//       item.roles.includes(userRole)
//     );
//   };

//   const navigation = getMenuItems(user?.role || 'employee');

//   // Get user display info
//   const getUserDisplayInfo = () => {
//     if (!user) {
//       return { initials: 'U', name: 'User', role: 'Unknown' };
//     }

//     const initials = user.name
//       ?.split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase() || 'U';

//     const roleDisplay = {
//       admin: 'Administrator', 
//       payroll: 'Payroll Officer',
//       finance: 'Finance Officer',
//       compliance: 'Compliance Officer',
//       employee: 'Employee',
//       executive: 'Executive'
//     }[user.role] || 'User';

//     return {
//       initials,
//       name: user.name || 'User',
//       role: roleDisplay
//     };
//   };

//   const userInfo = getUserDisplayInfo();
  
//   const getIcon = (iconName) => {
//     const icons = {
//       home: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//         </svg>
//       ),
//       users: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//         </svg>
//       ),
//       'currency-dollar': (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       ),
//       calculator: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//         </svg>
//       ),
//       'chart-bar': (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//         </svg>
//       ),
//       cog: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//         </svg>
//       )
//     };
//     return icons[iconName] || null;
//   };

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={toggleSidebar}
//         />
//       )}
      
//       <div className={`sidebar bg-gray-800 text-white fixed h-full overflow-y-auto z-50 ${isOpen ? 'active' : ''}`}>
//         <div className="p-5 border-b border-gray-700">
//           <h1 className="text-xl font-bold">Payroll System</h1>
//           <p className="text-sm text-gray-400">Enterprise Edition</p>
//         </div>
        
//         <nav className="mt-5">
//           <div className="px-4 py-3 text-xs text-gray-400 uppercase">Main Navigation</div>
//           {navigation.map((item) => (
//             <Link
//               key={item.name}
//               to={item.href}
//               className={`nav-item block py-3 px-4 flex items-center ${
//                 location.pathname === item.href ? 'active text-white' : 'text-gray-300'
//               }`}
//               onClick={() => window.innerWidth < 768 && toggleSidebar()}
//             >
//               {getIcon(item.icon)}
//               {item.name}
//             </Link>
//           ))}
//         </nav>
        
//         {/* <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
//           <div className="flex items-center">
//             <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
//               {userInfo.initials}
//             </div>
//             <div className="ml-3">
//               <p className="text-sm font-medium">{userInfo.name}</p>
//               <p className="text-xs text-gray-400">{userInfo.role}</p>
//             </div>
//           </div>
//         </div> */}
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// src/components/Layout/Sidebar.jsx
import React, { Children } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import EmployeeSidebar from '../../modules/hr/components/EmployeeProfile/EmployeeSidebar';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  // const { id } = useParams();

  // // Check if we're in employee profile context
  // const isEmployeeProfile = location.pathname.includes('/hr/employees/') && id;

  // if (isEmployeeProfile) {
  //   return (
  //     <EmployeeSidebar 
  //       isOpen={isOpen} 
  //       toggleSidebar={toggleSidebar} 
  //       // We'll need to pass employee data here, might need to lift state up
  //     />
  //   );
  // }

  // Module-based sidebar configuration
  const getSidebarItems = () => {
    const path = location.pathname;
    
    if (path.startsWith('/hr')) {
      return [
        { name: 'HR Dashboard', href: '/hr/dashboard', icon: 'chart-bar' },
        { name: 'Employees', href: '/hr/employees', icon: 'users' },
        { name: 'Positions', href: '/hr/positions', icon: 'briefcase' },
        { name: 'Tools', href: '/hr/tools', icon: 'wrench', children: [
          { name: 'Attendance', href: '/hr/tools/attendance' },
          { name: 'Leave Management', href: '/hr/tools/leave' },
          { name: 'Forms', href: '/hr/tools/forms' }
        ]},
        { name: 'HR Settings', href: '/hr/settings', icon: 'cog' }
      ];
    } else if (path.startsWith('/payroll')) {
      return [
        { name: 'Payroll Dashboard', href: '/payroll/dashboard', icon: 'chart-bar' },
        { name: 'Process Payroll', href: '/payroll/process', icon: 'calculator' },
        { name: 'Payroll Adjustments', href: '/payroll/adjustment', icon: 'document' },
        { name: 'Payroll History', href: '/payroll/history', icon: 'clock' },
        { name: 'Payroll Settings', href: '/payroll/settings', icon: 'cog' },
        { name: 'Paye Tests', href: '/payroll/calcTesting', icon: 'cog' },
        // children: [
        //   { name: 'Company Settings', href: '/payroll/settings/company', icon: '🏢'},
        //   { name: 'Tax Settings', href: '/payroll/settings/tax', icon: '📊' },
        //   { name: 'User Management', href: '/settings/users', icon: '👥' }
        // ]
      ];
    } else if (path.startsWith('/finance')) {
      return [
        { name: 'Finance Dashboard', href: '/finance/dashboard', icon: 'chart-bar' },
        { name: 'Bank Disbursement', href: '/finance/bank-disbursement', icon: 'bank' },
        { name: 'JV Allocations', href: '/finance/jv-allocations', icon: 'share' },
        { name: 'Financial Reports', href: '/finance/reports', icon: 'document' }
      ];
    } else if (path.startsWith('/compliance')) {
      return [
        { name: 'Compliance Dashboard', href: '/compliance/dashboard', icon: 'chart-bar' },
        { name: 'Statutory Deductions', href: '/compliance/deductions', icon: 'calculator' },
        { name: 'Remittances', href: '/compliance/remittances', icon: 'currency-dollar' },
        { name: 'Compliance Reports', href: '/compliance/reports', icon: 'document' }
      ];
    } else if (path.startsWith('/reports')) {
      return [
        { name: 'All Reports', href: '/reports', icon: 'chart-bar' },
        { name: 'Payroll Reports', href: '/reports/payroll', icon: 'currency-dollar' },
        { name: 'HR Reports', href: '/reports/hr', icon: 'users' },
        { name: 'Financial Reports', href: '/reports/finance', icon: 'bank' },
        { name: 'Compliance Reports', href: '/reports/compliance', icon: 'shield-check' }
      ];
    } else {
      // Default dashboard sidebar
      return [
        { name: 'Main Dashboard', href: '/', icon: 'home' },
        { name: 'Quick Actions', href: '/quick-actions', icon: 'bolt' },
        { name: 'Recent Activity', href: '/activity', icon: 'clock' }
      ];
    }
  };

  const navigation = getSidebarItems();

  const getIcon = (iconName) => {
    const icons = {
      home: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      users: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      'chart-bar': <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      calculator: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      cog: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      briefcase: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" /></svg>,
      wrench: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      bank: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      share: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
      document: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      'shield-check': <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      clock: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      bolt: <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      'currency-dollar': <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };
    return icons[iconName] || null;
  };

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`sidebar bg-gray-800 text-white fixed h-full overflow-y-auto z-50 ${isOpen ? 'active' : ''}`}>
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">Payroll System</h1>
          <p className="text-sm text-gray-400">Enterprise Edition</p>
        </div>
        
        <nav className="mt-5">
          <div className="px-4 py-3 text-xs text-gray-400 uppercase">Navigation</div>
          {navigation.map((item) => (
            <div key={item.name}>
              <Link
                to={item.href}
                className={`nav-item block py-3 px-4 flex items-center ${
                  isActiveLink(item.href) ? 'active text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
              >
                {getIcon(item.icon)}
                {item.name}
              </Link>
              {/* Render children if any */}
              {item.children && isActiveLink(item.href) && (
                <div className="ml-8 border-l border-gray-600">
                  {item.children.map(child => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={`block py-2 px-4 text-sm ${
                        location.pathname === child.href 
                          ? 'text-white border-l-2 border-blue-500' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;