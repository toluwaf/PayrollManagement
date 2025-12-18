import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeEmployment = () => {
  const { employee, onEmployeeUpdate } = useOutletContext();
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEmployment, setNewEmployment] = useState({
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    salary: '',
    employmentType: '',
    location: '',
    supervisor: '',
    reasonForChange: ''
  });

  useEffect(() => {
    loadEmploymentHistory();
  }, [employee._key]);

  const loadEmploymentHistory = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeEmploymentHistory(employee._key);
      if (response.success) {
        setEmploymentHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load employment history:', error);
      // Add current position if no history exists
      setEmploymentHistory([{
        _key: 'current',
        position: employee.position,
        department: employee.departmentName || employee.department,
        startDate: employee.joinDate,
        endDate: null,
        salary: employee.salary,
        employmentType: employee.employmentType,
        location: 'Head Office',
        supervisor: '',
        reasonForChange: 'Initial employment'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployment = async () => {
    try {
      const response = await employeeService.addEmployeeEmploymentHistory(employee._key, newEmployment);
      if (response.success) {
        setEmploymentHistory(prev => [...prev, response.data]);
        setIsAdding(false);
        setNewEmployment({
          position: '',
          department: '',
          startDate: '',
          endDate: '',
          salary: '',
          employmentType: '',
          location: '',
          supervisor: '',
          reasonForChange: ''
        });
      } else {
        alert('Failed to add employment record: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to add employment record:', error);
      alert('Failed to add employment record. Please try again.');
    }
  };

  const handleDeleteEmployment = async (historyId) => {
    if (window.confirm('Are you sure you want to delete this employment record?')) {
      try {
        const response = await employeeService.deleteEmployeeEmploymentHistory(employee._key, historyId);
        if (response.success) {
          setEmploymentHistory(prev => prev.filter(history => history._key !== historyId));
        } else {
          alert('Failed to delete employment record: ' + response.message);
        }
      } catch (error) {
        console.error('Failed to delete employment record:', error);
        alert('Failed to delete employment record. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const isCurrentPosition = (endDate) => !endDate;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employment History</h1>
          <p className="text-gray-600">Career progression and position changes within the company</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Record
        </button>
      </div>

      {/* Add Employment Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Employment Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                name="position"
                value={newEmployment.position}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter position title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                name="department"
                value={newEmployment.department}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter department"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={newEmployment.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={newEmployment.endDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Leave empty for current position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                name="salary"
                value={newEmployment.salary}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter monthly salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                name="employmentType"
                value={newEmployment.employmentType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newEmployment.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter work location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
              <input
                type="text"
                name="supervisor"
                value={newEmployment.supervisor}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter supervisor name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change</label>
              <textarea
                name="reasonForChange"
                value={newEmployment.reasonForChange}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Promotion, Transfer, etc."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployment}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Record
            </button>
          </div>
        </div>
      )}

      {/* Employment Timeline */}
      <div className="space-y-6">
        {employmentHistory.map((employment) => (
          <div key={employment._key} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {isCurrentPosition(employment.endDate) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current Position
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{employment.position}</h3>
              </div>
              <div className="flex space-x-2">
                {!isCurrentPosition(employment.endDate) && (
                  <button 
                    onClick={() => handleDeleteEmployment(employment._key)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-gray-900">{employment.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-gray-900">
                    {new Date(employment.startDate).toLocaleDateString()} -{' '}
                    {isCurrentPosition(employment.endDate) 
                      ? 'Present' 
                      : new Date(employment.endDate).toLocaleDateString()
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <p className="text-gray-900 font-medium">{formatCurrency(employment.salary)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <p className="text-gray-900 capitalize">{employment.employmentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{employment.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  <p className="text-gray-900">{employment.supervisor || 'N/A'}</p>
                </div>
                {employment.reasonForChange && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change</label>
                    <p className="text-gray-900">{employment.reasonForChange}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {employmentHistory.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employment History</h3>
          <p className="text-gray-500 mb-4">Track the employee's career progression within the company.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add First Employment Record
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeEmployment;