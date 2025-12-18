import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeDetails = () => {
  const { employee, onEmployeeUpdate, reloadEmployee } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    // Extract only editable fields from employee
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    dateOfBirth: employee?.dateOfBirth || '',
    gender: employee?.gender || '',
    maritalStatus: employee?.maritalStatus || '',
    department: employee?.department || '',
    position: employee?.position || '',
    jobGrade: employee?.jobGrade || '',
    employmentType: employee?.employmentType || '',
    joinDate: employee?.joinDate || '',
    // Include version for conflict resolution
    _version: employee?._version || 1
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use conflict-safe update if version exists
      let response;
      if (formData._version) {
        response = await employeeService.updateEmployeeWithConflictResolution(
          employee._key, 
          formData,
          'auto'
        );
      } else {
        response = await employeeService.updateEmployee(employee._key, formData);
      }
      
      if (response.success) {
        // Refresh the employee data
        await reloadEmployee();
        setIsEditing(false);
      } else {
        alert('Failed to update employee: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('Failed to update employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  const handleCancel = () => {
    setFormData({ ...employee });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-600">Personal and employment information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Details
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.phone || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{formatDate(employee.dateOfBirth)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg capitalize">{employee.gender || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  {isEditing ? (
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg capitalize">{employee.maritalStatus || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.address || 'No address provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Employment Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg font-mono">{employee.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.departmentName || employee.department}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={formData.position || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.position}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Grade</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobGrade"
                      value={formData.jobGrade || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{employee.jobGrade || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  {isEditing ? (
                    <select
                      name="employmentType"
                      value={formData.employmentType || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg capitalize">{employee.employmentType || 'Full-time'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{formatDate(employee.joinDate)}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
        </div>

        {/* Form Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EmployeeDetails;