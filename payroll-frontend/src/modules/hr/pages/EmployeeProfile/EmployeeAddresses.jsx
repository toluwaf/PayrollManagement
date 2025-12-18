import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeAddresses = () => {
  const { employee, onEmployeeUpdate } = useOutletContext();
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    type: 'current',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    isPrimary: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null
  });

  useEffect(() => {
    loadAddresses();
  }, [employee._key]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeAddresses(employee._key);
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // Fallback to employee's main address if no addresses exist
      if (employee.address) {
        setAddresses([{
          _key: 'primary',
          type: 'current',
          address: employee.address,
          city: '',
          state: '',
          country: 'Nigeria',
          isPrimary: true,
          startDate: employee.joinDate || new Date().toISOString().split('T')[0]
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await employeeService.addEmployeeAddress(employee._key, newAddress);
      if (response.success) {
        setAddresses(prev => [...prev, response.data]);
        setIsAdding(false);
        setNewAddress({
          type: 'current',
          address: '',
          city: '',
          state: '',
          country: 'Nigeria',
          postalCode: '',
          isPrimary: false,
          startDate: new Date().toISOString().split('T')[0],
          endDate: null
        });
      } else {
        alert('Failed to add address: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleUpdateAddress = async (addressId, updateData) => {
    try {
      const response = await employeeService.updateEmployeeAddress(employee._key, addressId, updateData);
      if (response.success) {
        setAddresses(prev => prev.map(addr => 
          addr._key === addressId ? response.data : addr
        ));
      } else {
        alert('Failed to update address: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      alert('Failed to update address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await employeeService.deleteEmployeeAddress(employee._key, addressId);
        if (response.success) {
          setAddresses(prev => prev.filter(addr => addr._key !== addressId));
        } else {
          alert('Failed to delete address: ' + response.message);
        }
      } catch (error) {
        console.error('Failed to delete address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      // First, set all addresses to non-primary
      const updatePromises = addresses.map(addr => 
        employeeService.updateEmployeeAddress(employee._key, addr._key, { isPrimary: false })
      );
      
      await Promise.all(updatePromises);
      
      // Then set the selected address as primary
      await handleUpdateAddress(addressId, { isPrimary: true });
      
      // Reload addresses to ensure consistency
      await loadAddresses();
      
    } catch (error) {
      console.error('Failed to set primary address:', error);
      alert('Failed to set primary address. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'permanent': return 'bg-green-100 text-green-800';
      case 'previous': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Address History</h1>
          <p className="text-gray-600">Current and previous residential addresses</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Address
        </button>
      </div>

      {/* Add Address Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
              <select
                name="type"
                value={newAddress.type}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="current">Current Address</option>
                <option value="permanent">Permanent Address</option>
                <option value="previous">Previous Address</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrimary"
                checked={newAddress.isPrimary}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Set as primary address</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <textarea
                name="address"
                value={newAddress.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter full street address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={newAddress.postalCode}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={newAddress.startDate}
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
                value={newAddress.endDate || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
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
              onClick={handleAddAddress}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Address
            </button>
          </div>
        </div>
      )}

      {/* Addresses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address._key} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddressTypeColor(address.type)}`}>
                  {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                </span>
                {address.isPrimary && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {!address.isPrimary && (
                  <button 
                    onClick={() => handleSetPrimary(address._key)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Set Primary
                  </button>
                )}
                <button className="text-red-600 hover:text-red-900 text-sm"
                  onClick={() => handleDeleteAddress(address._key)}>
                  Remove
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-900 font-medium">{address.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">City:</span>
                    <p className="text-gray-900">{address.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">State:</span>
                    <p className="text-gray-900">{address.state}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Country:</span>
                    <p className="text-gray-900">{address.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Postal Code:</span>
                    <p className="text-gray-900">{address.postalCode || 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Start Date: {new Date(address.startDate).toLocaleDateString()}</span>
                    {address.endDate && (
                      <span>End Date: {new Date(address.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Found</h3>
          <p className="text-gray-500 mb-4">Add the employee's current and previous addresses to keep their records up to date.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeAddresses;