// Positions.js
import React, { useState, useEffect } from 'react';
import { positionService } from '../../../services/positionService';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPositions();
    loadDepartments();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const response = await positionService.getAllPositions();
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error('Failed to load positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await positionService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleAddPosition = () => {
    setEditingPosition(null);
    setShowForm(true);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setShowForm(true);
  };

  const handleDeletePosition = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        const response = await positionService.deletePosition(id);
        if (response.success) {
          setPositions(positions.filter(p => p._key !== id));
        }
      } catch (error) {
        console.error('Failed to delete position:', error);
        alert('Failed to delete position');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingPosition) {
        response = await positionService.updatePosition(editingPosition._key, formData);
      } else {
        response = await positionService.createPosition(formData);
      }

      if (response.success) {
        await loadPositions();
        setShowForm(false);
        setEditingPosition(null);
      }
    } catch (error) {
      console.error('Failed to save position:', error);
      alert('Failed to save position');
    }
  };

  const calculateBaseSalary = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      return 1200000;
    } else if (titleLower.includes('junior') || titleLower.includes('associate')) {
      return 800000;
    } else if (titleLower.includes('entry') || titleLower.includes('trainee')) {
      return 500000;
    } else {
      return 1000000; // Default for mid-level
    }
  };

  const getSalaryColor = (salary) => {
    if (salary >= 1000000) return 'text-green-600';
    if (salary >= 700000) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Position Management</h1>
          <p className="text-gray-600">Manage job positions and salary bands</p>
        </div>
        <button 
          onClick={handleAddPosition}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Position
        </button>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map(position => (
          <div key={position._key} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
                <p className="text-sm text-gray-600">{position.department}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                position.grade === 'Senior' ? 'bg-purple-100 text-purple-800' :
                position.grade === 'Mid' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {position.grade}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Base Salary</span>
                <span className={`font-semibold ${getSalaryColor(position.baseSalary)}`}>
                  ₦ {position.baseSalary?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Employees</span>
                <span className="font-medium text-gray-900">{position.employeeCount || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditPosition(position)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeletePosition(position._key)}
                className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {positions.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No positions defined</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first position</p>
          <button 
            onClick={handleAddPosition}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Position
          </button>
        </div>
      )}

      {/* Position Form Modal */}
      {showForm && (
        <PositionForm 
          position={editingPosition}
          departments={departments}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPosition(null);
          }}
          calculateBaseSalary={calculateBaseSalary}
        />
      )}
    </div>
  );
};

// Position Form Component
const PositionForm = ({ position, departments, onSubmit, onCancel, calculateBaseSalary }) => {
  const [formData, setFormData] = useState({
    title: position?.title || '',
    department: position?.department || '',
    grade: position?.grade || 'Mid',
    baseSalary: position?.baseSalary || 0,
    description: position?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTitleChange = (title) => {
    const baseSalary = calculateBaseSalary(title);
    setFormData(prev => ({
      ...prev,
      title,
      baseSalary
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {position ? 'Edit Position' : 'Add New Position'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._key} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Salary (₦)
                <span className="text-xs text-gray-500 ml-2">Auto-calculated based on title</span>
              </label>
              <input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Position description and responsibilities..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {position ? 'Update' : 'Create'} Position
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Positions;