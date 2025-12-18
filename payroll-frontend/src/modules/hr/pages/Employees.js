import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import EmployeeForm from '../components/Employees/EmployeeForm';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      alert('Failed to load employees. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };


  const loadDepartments = async () => {
    try {
      const response = await employeeService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  // Get unique departments from employees for filter
  const employeeDepartments = ['All', ...new Set(employees.map(emp => emp.departmentName || emp.department))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
                         
    const matchesDepartment = selectedDepartment === 'All' || 
                             (employee.departmentName === selectedDepartment) || 
                             (employee.department === selectedDepartment); 
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = async (formData) => {
    try {
      // Calculate total salary from allowances
      const totalSalary = calculateTotalSalary(formData);
      
      // Prepare the complete employee data
      const employeeData = {
        // Personal Information
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        
        
        // Employment Information
        department: formData.department,
        position: formData.position,
        jobGrade: formData.jobGrade,
        employmentType: formData.employmentType,
        employmentStatus: formData.employmentStatus,
        joinDate: formData.joinDate,
        probationEndDate: formData.probationEndDate,
        
        // Salary Structure
        salary: totalSalary,
        basicSalary: parseFloat(formData.basicSalary) || 0,
        housingAllowance: parseFloat(formData.housingAllowance) || 0,
        transportAllowance: parseFloat(formData.transportAllowance) || 0,
        mealAllowance: parseFloat(formData.mealAllowance) || 0,
        utilityAllowance: parseFloat(formData.utilityAllowance) || 0,
        uniformAllowance: parseFloat(formData.uniformAllowance) || 0,
        hardshipAllowance: parseFloat(formData.hardshipAllowance) || 0,
        entertainmentAllowance: parseFloat(formData.entertainmentAllowance) || 0,
        otherAllowances: parseFloat(formData.otherAllowances) || 0,
              
        // Eligibility & Exemptions (NEW FIELDS)
        housingSituation: formData.housingSituation,
        annualRent: parseFloat(formData.annualRent) || 0,
        exemptFromNHF: formData.exemptFromNHF,
        nhfExemptionReason: formData.nhfExemptionReason,
        nhfExemptionDetails: formData.nhfExemptionDetails,
        additionalPension: parseFloat(formData.additionalPension) || 0,
        hasLifeAssurance: formData.hasLifeAssurance,
        lifeAssurancePremium: parseFloat(formData.lifeAssurancePremium) || 0,
        lifeAssuranceProvider: formData.lifeAssuranceProvider,
        lifeAssurancePolicyNo: formData.lifeAssurancePolicyNo,
        hasDisability: formData.hasDisability,
        disabilityCategory: formData.disabilityCategory,
        disabilityRegNo: formData.disabilityRegNo,

        // Legacy exemptions structure
        exemptions: formData.exemptions || {},

        // Bank Information
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankCode: formData.bankCode,
        accountType: formData.accountType,
        
        // Compliance Information
        taxId: formData.taxId,
        pensionId: formData.pensionId,
        nhfId: formData.nhfId,
        nhisId: formData.nhisId, // NEW
        itfId: formData.itfId, // NEW
              
        // Documents (NEW)
        documents: formData.documents || {},
      
        // JV Information
        jvPartners: formData.jvPartners || [],
        
        // Assessment Results (NEW)
        eligibilityAssessment: formData.eligibilityAssessment,
        lastAssessmentDate: formData.lastAssessmentDate,
        assessmentVersion: formData.assessmentVersion,
        
        // Status
        status: formData.status || 'active'
      };

      console.log('Submitting employee data:', employeeData);

      const response = await employeeService.createEmployee(employeeData);
      
      if (response.success) {
        setEmployees(prev => [...prev, response.data]);
        setShowForm(false);
        setSuccessMessage(`Employee ${response.data.name} added successfully!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Failed to add employee: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleEditEmployee = async (formData) => {
    try {
      // Calculate total salary from allowances
      const totalSalary = calculateTotalSalary(formData);
      
      // Prepare the complete employee data for update
      const employeeData = {
        // Personal Information
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        
        
        // Employment Information
        department: formData.department,
        position: formData.position,
        jobGrade: formData.jobGrade,
        employmentType: formData.employmentType,
        employmentStatus: formData.employmentStatus,
        joinDate: formData.joinDate,
        probationEndDate: formData.probationEndDate,
        
        // Salary Structure
        salary: totalSalary,
        basicSalary: parseFloat(formData.basicSalary) || 0,
        housingAllowance: parseFloat(formData.housingAllowance) || 0,
        transportAllowance: parseFloat(formData.transportAllowance) || 0,
        mealAllowance: parseFloat(formData.mealAllowance) || 0,
        utilityAllowance: parseFloat(formData.utilityAllowance) || 0,
        uniformAllowance: parseFloat(formData.uniformAllowance) || 0,
        hardshipAllowance: parseFloat(formData.hardshipAllowance) || 0,
        entertainmentAllowance: parseFloat(formData.entertainmentAllowance) || 0,
        otherAllowances: parseFloat(formData.otherAllowances) || 0,
              
        // Eligibility & Exemptions (NEW FIELDS)
        housingSituation: formData.housingSituation,
        annualRent: parseFloat(formData.annualRent) || 0,
        exemptFromNHF: formData.exemptFromNHF,
        nhfExemptionReason: formData.nhfExemptionReason,
        nhfExemptionDetails: formData.nhfExemptionDetails,
        additionalPension: parseFloat(formData.additionalPension) || 0,
        hasLifeAssurance: formData.hasLifeAssurance,
        lifeAssurancePremium: parseFloat(formData.lifeAssurancePremium) || 0,
        lifeAssuranceProvider: formData.lifeAssuranceProvider,
        lifeAssurancePolicyNo: formData.lifeAssurancePolicyNo,
        hasDisability: formData.hasDisability,
        disabilityCategory: formData.disabilityCategory,
        disabilityRegNo: formData.disabilityRegNo,

        // Legacy exemptions structure
        exemptions: formData.exemptions || {},

        // Bank Information
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankCode: formData.bankCode,
        accountType: formData.accountType,
        
        // Compliance Information
        taxId: formData.taxId,
        pensionId: formData.pensionId,
        nhfId: formData.nhfId,
        nhisId: formData.nhisId, // NEW
        itfId: formData.itfId, // NEW
              
        // Documents (NEW)
        documents: formData.documents || {},
      
        // JV Information
        jvPartners: formData.jvPartners || [],
        
        // Assessment Results (NEW)
        eligibilityAssessment: formData.eligibilityAssessment,
        lastAssessmentDate: formData.lastAssessmentDate,
        assessmentVersion: formData.assessmentVersion,
        
        // Status
        status: formData.status || 'active'
      };

      console.log('Updating employee data:', employeeData);

      const response = await employeeService.updateEmployee(selectedEmployee._key, employeeData);
      
      if (response.success) {
        // Update the employee in the local state
        setEmployees(prev => prev.map(emp => 
          emp._key === selectedEmployee._key ? response.data : emp
        ));
        setShowForm(false);
        setSelectedEmployee(null);
        setSuccessMessage(`Employee ${response.data.name} updated successfully!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Failed to update employee: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleEditClick = async (employee) => {
    try {
      // Fetch the full employee details including contracts and JV allocations
      const response = await employeeService.getEmployeeById(employee._key);
      
      if (response.success) {
        setSelectedEmployee(response.data);
        setFormMode('edit');
        setShowForm(true);
      } else {
        alert('Failed to load employee details: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to load employee details:', error);
      alert('Failed to load employee details. Please try again.');
    }
  };

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setFormMode('add');
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    if (formMode === 'add') {
      handleAddEmployee(formData);
    } else {
      handleEditEmployee(formData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    setFormMode('add');
  };

  const calculateTotalSalary = (formData) => {
    return (
      parseFloat(formData.basicSalary || 0) +
      parseFloat(formData.housingAllowance || 0) +
      parseFloat(formData.transportAllowance || 0) +
      parseFloat(formData.mealAllowance || 0) +
      parseFloat(formData.utilityAllowance || 0) +
      parseFloat(formData.entertainmentAllowance || 0) +
      parseFloat(formData.otherAllowances || 0)
    );
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await employeeService.deleteEmployee(id);
        if (response.success) {
          setEmployees(employees.filter(emp => emp._key !== id));
          alert('Employee deleted successfully!');
        } else {
          alert('Failed to delete employee: ' + response.message);
        }
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d._key === departmentId);
    return dept ? dept.name : departmentId;
  };

  const getFormTitle = () => {
    return formMode === 'add' ? 'Add New Employee' : `Edit Employee - ${selectedEmployee?.name}`;
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


  return (
    <div className="p-5">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <button 
          onClick={handleAddClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {employeeDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
            <div className="flex space-x-2">
              <button className="bg-gray-100 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
                Export CSV
              </button>
              <button className="bg-gray-100 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
                Bulk Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                {/* <h2 className="text-xl font-bold">{getFormTitle()}</h2> */}
                <button
                  onClick={handleFormCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <EmployeeForm 
                employee={selectedEmployee} // null for new employee
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee._key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <Link 
                        to={`/hr/employees/${employee._key}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        {employee.name}
                      </Link>
                      <div className="text-sm text-gray-500">{employee.employeeId}</div>
                      <div className="text-xs text-gray-400">{employee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.departmentName || getDepartmentName(employee.department)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₦ {employee.salary?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : employee.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(employee)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                        Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee._key)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-500">No employees found</p>
              {searchTerm || selectedDepartment !== 'All' ? (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <button 
                  onClick={handleAddClick}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Add your first employee
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;