// frontend/src/components/JVAllocations/JVAllocations.jsx
import React, { useState, useEffect } from 'react';
import { jvService } from '../../../../services/jvService';
import JVPartners from './JVPartners';
import JVAgreements from './JVAgreements';
import AllocationRules from './AllocationRules';
import AllocationReports from './AllocationReports';

const JVAllocations = () => {
  const [activeTab, setActiveTab] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [allocationRules, setAllocationRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [partnersResponse, agreementsResponse, rulesResponse] = await Promise.all([
        jvService.getPartners(),
        jvService.getAgreements(),
        jvService.getAllocationRules()
      ]);
      
      setPartners(partnersResponse.data || []);
      setAgreements(agreementsResponse.data || []);
      setAllocationRules(rulesResponse.data || []);
    } catch (error) {
      console.error('Error loading JV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'partners', name: 'JV Partners', icon: '🤝' },
    { id: 'agreements', name: 'Agreements', icon: '📝' },
    { id: 'rules', name: 'Allocation Rules', icon: '⚖️' },
    { id: 'reports', name: 'Reports', icon: '📊' },
  ];

  if (loading && partners.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JV Allocations</h1>
          <p className="text-gray-600">Manage joint venture cost allocations and reporting</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'partners' && (
          <JVPartners
            partners={partners}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'agreements' && (
          <JVAgreements
            agreements={agreements}
            partners={partners}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'rules' && (
          <AllocationRules
            rules={allocationRules}
            agreements={agreements}
            partners={partners}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'reports' && (
          <AllocationReports
            partners={partners}
            agreements={agreements}
            rules={allocationRules}
          />
        )}
      </div>
    </div>
  );
};

export default JVAllocations;