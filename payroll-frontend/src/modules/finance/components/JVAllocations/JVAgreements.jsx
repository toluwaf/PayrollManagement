// frontend/src/components/JVAllocations/JVAgreements.jsx
import React, { useState } from 'react';
import DataTable from '../../../../components/Common/DataTable';
import Modal from '../../../../components/Common/Modal';

const JVAgreements = ({ agreements, partners, onRefresh }) => {
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = async (agreement) => {
    setSelectedAgreement(agreement);
    setShowDetailModal(true);
  };

  const columns = [
    {
      key: 'agreement',
      header: 'Agreement',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.description}</div>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Effective Period',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>From: {new Date(item.effectiveDate).toLocaleDateString()}</div>
          <div>To: {new Date(item.expirationDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'terms',
      header: 'Terms',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>Allocation: {item.totalAllocationPercentage}%</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.terms?.costRecovery && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Cost Recovery
              </span>
            )}
            {item.terms?.profitSharing && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Profit Sharing
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : item.status === 'expired'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <button
          onClick={() => handleViewDetails(item)}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  const AgreementDetailModal = () => {
    if (!selectedAgreement) return null;

    return (
      <Modal
        title={selectedAgreement.name}
        onClose={() => setShowDetailModal(false)}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Agreement Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Description:</span>
                <p className="mt-1 text-gray-900">{selectedAgreement.description}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Status:</span>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAgreement.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedAgreement.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Effective Date:</span>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedAgreement.effectiveDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Expiration Date:</span>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedAgreement.expirationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Agreement Terms</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Total Allocation:</span>
                  <p className="mt-1 text-gray-900">{selectedAgreement.totalAllocationPercentage}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Termination Clause:</span>
                  <p className="mt-1 text-gray-900 capitalize">
                    {selectedAgreement.terms?.terminationClause?.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-500">Features:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAgreement.terms?.costRecovery && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Cost Recovery
                      </span>
                    )}
                    {selectedAgreement.terms?.profitSharing && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Profit Sharing
                      </span>
                    )}
                    {selectedAgreement.terms?.auditRights && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Audit Rights
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partners */}
          {selectedAgreement.partners && selectedAgreement.partners.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">JV Partners</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedAgreement.partners.map((partner) => (
                      <tr key={partner._key}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{partner.name}</div>
                          <div className="text-sm text-gray-500">{partner.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {partner.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            partner.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {partner.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">JV Agreements</h2>
          <p className="text-sm text-gray-600">
            Manage joint venture agreements and their terms
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Agreements</div>
          <div className="text-2xl font-bold text-gray-900">{agreements.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {agreements.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Partners Covered</div>
          <div className="text-2xl font-bold text-blue-600">
            {partners.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Avg. Allocation</div>
          <div className="text-2xl font-bold text-purple-600">
            {agreements.length > 0 
              ? Math.round(agreements.reduce((sum, a) => sum + a.totalAllocationPercentage, 0) / agreements.length) 
              : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={agreements}
          emptyMessage="No JV agreements found"
          searchable={true}
          searchFields={['name', 'description', 'status']}
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && <AgreementDetailModal />}
    </div>
  );
};

export default JVAgreements;