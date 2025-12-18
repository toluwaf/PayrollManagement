import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { employeeService } from '../../../../services/employeeService';

const EmployeeDocuments = () => {
  const { employee } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDocument, setNewDocument] = useState({
    type: 'other',
    name: '',
    url: '',
    uploadDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'active'
  });

  useEffect(() => {
    loadDocuments();
  }, [employee._key]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeDocuments(employee._key);
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      const response = await employeeService.addEmployeeDocument(employee._key, newDocument);
      if (response.success) {
        setDocuments(prev => [...prev, response.data]);
        setIsUploading(false);
        setNewDocument({
          type: 'other',
          name: '',
          url: '',
          uploadDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          status: 'active'
        });
      } else {
        alert('Failed to upload document: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await employeeService.deleteEmployeeDocument(employee._key, documentId);
        if (response.success) {
          setDocuments(prev => prev.filter(doc => doc._key !== documentId));
        } else {
          alert('Failed to delete document: ' + response.message);
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const documentTypes = {
    employment_contract: { label: 'Employment Contract', color: 'bg-blue-100 text-blue-800' },
    id_card: { label: 'ID Card', color: 'bg-green-100 text-green-800' },
    certificate: { label: 'Certificate', color: 'bg-purple-100 text-purple-800' },
    tax_form: { label: 'Tax Form', color: 'bg-yellow-100 text-yellow-800' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getDocumentStatus = (document) => {
    if (isExpired(document.expiryDate)) return 'expired';
    if (isExpiringSoon(document.expiryDate)) return 'pending';
    return document.status || 'active';
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
          <h1 className="text-2xl font-bold text-gray-900">Employee Documents</h1>
          <p className="text-gray-600">Contracts, certificates, and identification documents</p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Upload Document Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setIsUploading(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleFileUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select 
                      name="type"
                      value={newDocument.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select Document Type</option>
                      <option value="employment_contract">Employment Contract</option>
                      <option value="id_card">ID Card</option>
                      <option value="certificate">Certificate</option>
                      <option value="tax_form">Tax Form</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newDocument.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter document name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
                    <input
                      type="url"
                      name="url"
                      value={newDocument.url}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                    <input
                      type="date"
                      name="uploadDate"
                      value={newDocument.uploadDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                    <input 
                      type="date"
                      name="expiryDate"
                      value={newDocument.expiryDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg" 
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsUploading(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => {
          const documentType = documentTypes[document.type] || documentTypes.other;
          const status = getDocumentStatus(document);
          const expiringSoon = isExpiringSoon(document.expiryDate);
          const expired = isExpired(document.expiryDate);
          
          return (
            <div key={document._key} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${documentType.color} mb-2`}>
                      {documentType.label}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    {document.url && (
                      <>
                        <a 
                          href={document.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <a 
                          href={document.url} 
                          download
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>
                  {document.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className={expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-900'}>
                        {new Date(document.expiryDate).toLocaleDateString()}
                        {expired && ' (Expired)'}
                        {expiringSoon && !expired && ' (Soon)'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <button 
                    onClick={() => handleDeleteDocument(document._key)}
                    className="text-red-600 hover:text-red-900 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-500 mb-4">Upload employment contracts, certificates, and other important documents.</p>
          <button
            onClick={() => setIsUploading(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Upload First Document
          </button>
        </div>
      )}

      {/* Document Statistics */}
      {documents.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => getDocumentStatus(d) === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => isExpiringSoon(d.expiryDate)).length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {documents.filter(d => isExpired(d.expiryDate)).length}
            </div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;