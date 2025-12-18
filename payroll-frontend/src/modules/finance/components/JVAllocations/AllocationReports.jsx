// frontend/src/components/JVAllocations/AllocationReports.jsx
import React, { useState, useEffect } from 'react';
import { jvService } from '../../../../services/jvService';
import DataTable from '../../../../components/Common/DataTable';

const AllocationReports = ({ partners, agreements, rules }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2023-11');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState('');
  const [reportData, setReportData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
    loadStatistics();
  }, [selectedPeriod, selectedPartner, selectedAgreement]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedPartner) filters.partnerId = selectedPartner;
      if (selectedAgreement) filters.agreementId = selectedAgreement;
      
      const response = await jvService.getAllocationReport(selectedPeriod, filters);
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await jvService.getAllocationStatistics(selectedPeriod);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics(null);
    }
  };

  const handleCalculateAllocations = async () => {
    try {
      setLoading(true);
      // Use the existing payroll run from your data
      const response = await jvService.calculateAllocations('pr_2023_11');
      alert('Allocations calculated successfully!');
      await loadReportData();
      await loadStatistics();
    } catch (error) {
      console.error('Error calculating allocations:', error);
      alert('Failed to calculate allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;
    
    // Simple CSV export for demo
    const csvContent = generateCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jv_allocations_${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data) => {
    const headers = ['Partner', 'Department', 'Agreement', 'Allocated Amount', 'Percentage', 'Cost Center'];
    const rows = data.allocations.map(item => [
      item.partner.name,
      item.allocation.department,
      item.agreement.name,
      item.allocation.allocatedAmount,
      item.allocation.allocationPercentage + '%',
      item.allocation.costCenter
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const reportColumns = [
    {
      key: 'partner',
      header: 'Partner',
      render: (item) => (
        <div className="font-medium text-gray-900">
          {item.partner.name}
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => (
        <div className="text-gray-600">
          {item.allocation.department}
        </div>
      )
    },
    {
      key: 'agreement',
      header: 'Agreement',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {item.agreement.name}
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Allocated Amount',
      render: (item) => (
        <div className="font-medium text-gray-900">
          ₦{item.allocation.allocatedAmount?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (item) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.allocation.allocationPercentage}%
          </span>
        </div>
      )
    },
    {
      key: 'costCenter',
      header: 'Cost Center',
      render: (item) => (
        <div className="text-sm text-gray-500 font-mono">
          {item.allocation.costCenter}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Allocation Reports</h2>
          <p className="text-sm text-gray-600">
            View and export JV allocation reports and statistics
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCalculateAllocations}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Allocations'}
          </button>
          <button
            onClick={handleExportReport}
            disabled={!reportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2023-11">November 2023</option>
              <option value="2023-12">December 2023</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner
            </label>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Partners</option>
              {partners.map(partner => (
                <option key={partner._key} value={partner._key}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agreement
            </label>
            <select
              value={selectedAgreement}
              onChange={(e) => setSelectedAgreement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agreements</option>
              {agreements.map(agreement => (
                <option key={agreement._key} value={agreement._key}>
                  {agreement.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedPartner('');
                setSelectedAgreement('');
              }}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">Total Allocated</div>
            <div className="text-2xl font-bold text-gray-900">
              ₦{statistics.summary?.totalAllocated?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">Partners</div>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.summary?.totalPartners || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">Agreements</div>
            <div className="text-2xl font-bold text-green-600">
              {statistics.summary?.totalAgreements || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">Avg. Allocation</div>
            <div className="text-2xl font-bold text-purple-600">
              ₦{statistics.summary?.averageAllocation?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      )}

      {/* Partner Breakdown */}
      {statistics && statistics.partnerBreakdown && (
        <div className="bg-white p-6 rounded-lg shadow border mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Allocation Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statistics.partnerBreakdown.map((breakdown, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{breakdown.partner.name}</div>
                  <span className="text-sm text-gray-500">{breakdown.agreement.name}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  ₦{breakdown.totalAmount?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {breakdown.departmentCount} departments • {breakdown.allocationCount} allocations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Data */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Allocation Details {reportData && `- ${reportData.summary?.allocations?.length || 0} records`}
          </h3>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reportData && reportData.allocations && reportData.allocations.length > 0 ? (
          <DataTable
            columns={reportColumns}
            data={reportData.allocations}
            searchable={true}
            searchFields={['partner.name', 'allocation.department', 'agreement.name']}
          />
        ) : (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No allocation data found for the selected period.</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Calculate Allocations" to generate allocation data from payroll runs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationReports;