import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeById(id);
      if (response.success) {
        setEmployee(response.data);
      } else {
        alert('Employee not found');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
      alert('Failed to load employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-5">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900">Employee Not Found</h2>
          <Link to="/hr/employees" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link 
          to="/hr/employees" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Employees
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-600">{employee.employeeId} • {employee.position}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/hr/employees/${employee._key}/edit`}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Edit Profile
            </Link>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Export Profile
            </button>
          </div>
        </div>
      </div>

      {/* Employee Summary Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {employee.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
            <p className="text-gray-900">{employee.email}</p>
            <p className="text-gray-900">{employee.phone || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-1">{employee.address || 'No address provided'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Employment Details</h4>
            <p className="text-gray-900">{employee.departmentName || employee.department}</p>
            <p className="text-gray-900">{employee.employmentType || 'Full-time'}</p>
            <p className="text-sm text-gray-600">Joined {formatDate(employee.joinDate)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Salary & Status</h4>
            <p className="text-gray-900 font-semibold">{formatCurrency(employee.salary)}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              employee.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : employee.status === 'inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'salary', 'bank', 'compliance', 'contracts', 'jv'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'jv' ? 'JV Allocation' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{employee.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{employee.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{employee.phone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">{formatDate(employee.dateOfBirth)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900">{employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                    <dd className="text-sm text-gray-900">{employee.maritalStatus ? employee.maritalStatus.charAt(0).toUpperCase() + employee.maritalStatus.slice(1) : 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{employee.address || 'No address provided'}</dd>
                  </div>
                </dl>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                    <dd className="text-sm text-gray-900">{employee.employeeId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="text-sm text-gray-900">{employee.departmentName || employee.department}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Position</dt>
                    <dd className="text-sm text-gray-900">{employee.position}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Job Grade</dt>
                    <dd className="text-sm text-gray-900">{employee.jobGrade || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                    <dd className="text-sm text-gray-900">{employee.employmentType ? employee.employmentType.charAt(0).toUpperCase() + employee.employmentType.slice(1) : 'Full-time'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(employee.joinDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Salary Breakdown</h4>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Basic Salary</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.basicSalary)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Housing Allowance</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.housingAllowance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Transport Allowance</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.transportAllowance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Meal Allowance</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.mealAllowance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Utility Allowance</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.utilityAllowance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Entertainment Allowance</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.entertainmentAllowance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Other Allowances</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(employee.otherAllowances)}</dd>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <dt className="text-sm font-semibold text-gray-900">Total Salary</dt>
                    <dd className="text-sm font-semibold text-gray-900">{formatCurrency(employee.salary)}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Salary Distribution</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Basic Salary', value: employee.basicSalary, color: 'bg-blue-500' },
                    { label: 'Housing', value: employee.housingAllowance, color: 'bg-green-500' },
                    { label: 'Transport', value: employee.transportAllowance, color: 'bg-yellow-500' },
                    { label: 'Meal', value: employee.mealAllowance, color: 'bg-purple-500' },
                    { label: 'Utility', value: employee.utilityAllowance, color: 'bg-pink-500' },
                    { label: 'Entertainment', value: employee.entertainmentAllowance, color: 'bg-indigo-500' },
                    { label: 'Other', value: employee.otherAllowances, color: 'bg-gray-500' },
                  ].map((item, index) => {
                    const percentage = employee.salary ? ((item.value / employee.salary) * 100).toFixed(1) : 0;
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                          <span className="text-gray-600">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{formatCurrency(item.value)}</span>
                          <span className="text-gray-500 w-10 text-right">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Tab */}
        {activeTab === 'bank' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                  <dd className="text-sm text-gray-900">{employee.bankName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                  <dd className="text-sm text-gray-900">{employee.bankAccount || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank Code</dt>
                  <dd className="text-sm text-gray-900">{employee.bankCode || 'N/A'}</dd>
                </div>
              </dl>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="text-sm text-gray-900">{employee.accountType ? employee.accountType.charAt(0).toUpperCase() + employee.accountType.slice(1) : 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Salary Disbursement</dt>
                  <dd className="text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Add other tabs (Compliance, Contracts, JV) following similar pattern */}
        {/* You can implement these similarly */}
        
        {activeTab === 'compliance' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tax ID (TIN)</dt>
                  <dd className="text-sm text-gray-900">{employee.taxId || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pension ID</dt>
                  <dd className="text-sm text-gray-900">{employee.pensionId || 'N/A'}</dd>
                </div>
              </dl>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">NHF ID</dt>
                  <dd className="text-sm text-gray-900">{employee.nhfId || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">NSITF ID</dt>
                  <dd className="text-sm text-gray-900">{employee.nsitfId || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'jv' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Joint Venture Allocations</h3>
            {employee.jvAllocations && employee.jvAllocations.length > 0 ? (
              <div className="space-y-4">
                {employee.jvAllocations.map((allocation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{allocation.jvPartner}</h4>
                        <p className="text-sm text-gray-600">Cost Center: {allocation.costCenter || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">{allocation.allocationPercentage}%</p>
                        <p className="text-sm text-gray-600">Allocation</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No JV allocations assigned</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;