import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeEducation = () => {
  const { employee, onEmployeeUpdate } = useOutletContext();
  const [educationHistory, setEducationHistory] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    qualification: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    certificateUrl: ''
  });

  useEffect(() => {
    loadEducation();
  }, [employee._key]);

  const loadEducation = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeEducation(employee._key);
      if (response.success) {
        setEducationHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load education:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      const response = await employeeService.addEmployeeEducation(employee._key, newEducation);
      if (response.success) {
        setEducationHistory(prev => [...prev, response.data]);
        setIsAdding(false);
        setNewEducation({
          institution: '',
          qualification: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          grade: '',
          certificateUrl: ''
        });
      } else {
        alert('Failed to add education record: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to add education:', error);
      alert('Failed to add education record. Please try again.');
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      try {
        const response = await employeeService.deleteEmployeeEducation(employee._key, educationId);
        if (response.success) {
          setEducationHistory(prev => prev.filter(edu => edu._key !== educationId));
        } else {
          alert('Failed to delete education record: ' + response.message);
        }
      } catch (error) {
        console.error('Failed to delete education:', error);
        alert('Failed to delete education record. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getQualificationColor = (qualification) => {
    if (qualification.includes('Master') || qualification.includes('PhD')) {
      return 'bg-purple-100 text-purple-800';
    } else if (qualification.includes('Bachelor')) {
      return 'bg-blue-100 text-blue-800';
    } else if (qualification.includes('Diploma')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Education History</h1>
          <p className="text-gray-600">Academic qualifications and certifications</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Education
        </button>
      </div>

      {/* Add Education Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Education Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
              <input
                type="text"
                name="institution"
                value={newEducation.institution}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter institution name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
              <select
                name="qualification"
                value={newEducation.qualification}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Qualification</option>
                <option value="PhD">PhD</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="HND">Higher National Diploma</option>
                <option value="OND">Ordinary National Diploma</option>
                <option value="SSCE">Senior School Certificate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
              <input
                type="text"
                name="fieldOfStudy"
                value={newEducation.fieldOfStudy}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Computer Science"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={newEducation.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={newEducation.endDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
              <input
                type="text"
                name="grade"
                value={newEducation.grade}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., First Class, 4.5 GPA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
              <input
                type="url"
                name="certificateUrl"
                value={newEducation.certificateUrl}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
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
              onClick={handleAddEducation}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Record
            </button>
          </div>
        </div>
      )}

      {/* Education History */}
      <div className="space-y-6">
        {educationHistory.map((education) => (
          <div key={education._key} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualificationColor(education.qualification)}`}>
                  {education.qualification}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{education.institution}</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDeleteEducation(education._key)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <p className="text-gray-900">{education.fieldOfStudy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-gray-900">
                    {new Date(education.startDate).getFullYear()} - {new Date(education.endDate).getFullYear()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
                  <p className="text-gray-900">{education.grade || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                  {education.certificateUrl ? (
                    <a 
                      href={education.certificateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Certificate
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {educationHistory.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Education Records</h3>
          <p className="text-gray-500 mb-4">Add the employee's educational background to complete their profile.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add First Education Record
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeEducation;