// src/components/employees/EnhancedEmployeeForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../../../services/employeeService';
import { TaxEligibilityChecker } from '../../../../utils/taxEligibilityChecker';
import EligibilityAssessmentForm from '../EligibilityAssessmentForm';

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
    const tabs = ['personal', 'employment', 'salary', 'eligibility', 'compliance', 'documents', 'jv'];
    const [formData, setFormData] = useState({
        // Personal Information
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: 'Nigerian',
        
        // Employment Information
        department: '',
        position: '',
        jobGrade: '',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        probationEndDate: '',
        
        // Salary Structure
        basicSalary: '',
        housingAllowance: '',
        transportAllowance: '',
        mealAllowance: '',
        utilityAllowance: '',
        uniformAllowance: '',
        hardshipAllowance: '',
        entertainmentAllowance: '',
        otherAllowances: '',
        
        // Eligibility & Exemptions (Enhanced)
        housingSituation: '', // renting, owner, company
        annualRent: 0,
        exemptFromNHF: false,
        nhfExemptionReason: '',
        nhfExemptionDetails: '',
        additionalPension: 0, // Monthly amount
        hasLifeAssurance: false,
        lifeAssurancePremium: 0,
        lifeAssuranceProvider: '',
        lifeAssurancePolicyNo: '',
        hasDisability: false,
        disabilityCategory: '',
        disabilityRegNo: '',
        
        // Legacy exemptions (for backward compatibility)
        exemptions: {
            rentsPrimaryResidence: false,
            hasTenancyAgreement: false,
            hasRentReceipts: false,
            isPersonWithDisability: false,
            isAboveSixty: false,
            isAboveSixtyFive: false,
            isArmedForcesPersonnel: false,
            isPolicePersonnel: false,
            receivesCompanyProvidedHousing: false,
            isHomeOwner: false,
            transportAllowanceForOfficialDuties: false,
            mealAllowanceForOfficialDuties: false,
            utilityAllowanceForOfficialDuties: false,
            uniformAllowanceForOfficialDuties: false,
            hardshipAllowanceForOfficialDuties: false
        },
        
        // Compliance
        taxId: '',
        pensionId: '',
        nhfId: '',
        nhisId: '',
        itfId: '',
        
        // Bank Information (Added back)
        bankName: '',
        bankAccount: '',
        bankCode: '',
        accountType: 'savings',
        
        // Documents
        documents: {
            tenancyAgreement: null,
            rentReceipts: [],
            disabilityCertificate: null,
            lifeAssurancePolicy: null,
            nhfExemptionDoc: null,
            ageProof: null
        },
        
        // JV Partners
        jvPartners: [],
        
        // Assessment Results
        eligibilityAssessment: null
    });

    const [departments, setDepartments] = useState([]);
    const [jvPartners, setJVPartners] = useState([]);
    const [activeTab, setActiveTab] = useState('personal');
    const [eligibilityResults, setEligibilityResults] = useState(null);
    const [isAssessing, setIsAssessing] = useState(false);

    useEffect(() => {
        if (employee) {
            const enhancedEmployee = mapLegacyEmployee(employee);
            setFormData(enhancedEmployee);
            
            // Auto-run eligibility assessment
            runEligibilityAssessment(enhancedEmployee);
        }
        loadDropdownData();
    }, [employee]);

    const mapLegacyEmployee = (emp) => {
        // Map legacy exemption structure to new structure
        const exemptions = emp.exemptions || {};
        
        return {
            ...emp,
            housingSituation: exemptions.rentsPrimaryResidence ? 'renting' : 
                            exemptions.isHomeOwner ? 'owner' : 
                            exemptions.receivesCompanyProvidedHousing ? 'company' : '',
            annualRent: exemptions.annualRentPaid || 0,
            exemptFromNHF: exemptions.nhfExempt || false,
            nhfExemptionReason: exemptions.nhfExemptionReason || '',
            hasLifeAssurance: exemptions.hasLifeAssurance || false,
            lifeAssurancePremium: exemptions.lifeAssurancePremium || 0,
            hasDisability: exemptions.isPersonWithDisability || false,
            disabilityCategory: exemptions.disabilityCategory || '',
            additionalPension: exemptions.additionalVoluntaryPension || 0,
            // Keep legacy structure for compatibility
            exemptions: {
                ...exemptions
            }
        };
    };

    const loadDropdownData = async () => {
        try {
            const [deptsResponse, jvResponse] = await Promise.all([
                employeeService.getDepartments(),
                employeeService.getJVPartners()
            ]);
            
            if (deptsResponse.success) setDepartments(deptsResponse.data);
            if (jvResponse.success) setJVPartners(jvResponse.data);
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    };

    const runEligibilityAssessment = useCallback(async (employeeData) => {
        if (!employeeData) return;
        
        setIsAssessing(true);
        try {
            const checker = new TaxEligibilityChecker(employeeData, employeeData.employmentType);
            const results = await checker.checkAllEligibilities();
            
            setEligibilityResults(results);
            
            // Update formData with assessment results
            setFormData(prev => ({
                ...prev,
                eligibilityAssessment: results
            }));
        } catch (error) {
            console.error('Eligibility assessment failed:', error);
        } finally {
            setIsAssessing(false);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle nested objects
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let current = newData;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
                return newData;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

const handleUpdateEligibility = (field, value) => {
    // Handle different types of updates
    if (field === 'nhfExemptionDoc' || field === 'disabilityCertificate') {
        // For file uploads, update the documents object
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [field]: value
            }
        }));
    } else {
        // For regular fields, update directly
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }
    
    // Only trigger re-assessment for specific fields
    const eligibilityFields = [
        'housingSituation', 'annualRent', 'exemptFromNHF', 
        'nhfExemptionReason', 'hasLifeAssurance', 'lifeAssurancePremium',
        'hasDisability', 'disabilityCategory', 'additionalPension'
    ];
    
    if (eligibilityFields.includes(field)) {
        // Debounce the assessment to avoid too many calculations
        setTimeout(() => {
            runEligibilityAssessment(formData);
        }, 1000);
    }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Run final assessment
        await runEligibilityAssessment(formData);
        
        // Include assessment results in submission
        const dataToSubmit = {
            ...formData,
            lastAssessmentDate: new Date().toISOString(),
            assessmentVersion: '1.0'
        };
        
        onSubmit(dataToSubmit);
    };

    const calculateTotalSalary = () => {
        const {
            basicSalary, housingAllowance, transportAllowance,
            mealAllowance, utilityAllowance, uniformAllowance,
            hardshipAllowance, entertainmentAllowance, otherAllowances
        } = formData;
        
        return (
            parseFloat(basicSalary || 0) +
            parseFloat(housingAllowance || 0) +
            parseFloat(transportAllowance || 0) +
            parseFloat(mealAllowance || 0) +
            parseFloat(utilityAllowance || 0) +
            parseFloat(uniformAllowance || 0) +
            parseFloat(hardshipAllowance || 0) +
            parseFloat(entertainmentAllowance || 0) +
            parseFloat(otherAllowances || 0)
        );
    };

    const renderAssessmentSummary = () => {
        if (!eligibilityResults || !eligibilityResults.success) return null;
        
        const { summary, optimalDeductions } = eligibilityResults;
        
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">
                        📊 Tax Optimization Assessment
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        summary.complianceStatus === 'COMPLIANT' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {summary.complianceStatus === 'COMPLIANT' ? 'Compliant' : 'Review Required'}
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{summary.totalExemptions}</div>
                        <div className="text-sm text-gray-600">Eligible Exemptions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            ₦{(summary.estimatedAnnualSavings || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Annual Savings</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{summary.totalOptimizations}</div>
                        <div className="text-sm text-gray-600">Optimization Opportunities</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-amber-600">{summary.totalWarnings}</div>
                        <div className="text-sm text-gray-600">Compliance Notes</div>
                    </div>
                </div>
                
                {optimalDeductions.recommendations.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-medium text-blue-800 mb-2">Recommended Actions</h4>
                        <div className="space-y-2">
                            {optimalDeductions.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start p-3 bg-white rounded-lg border border-blue-100">
                                    <div className={`mr-3 mt-1 ${
                                        rec.priority === 'HIGH' ? 'text-red-500' :
                                        rec.priority === 'MEDIUM' ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`}>
                                        {rec.priority === 'HIGH' ? '🔴' : 
                                         rec.priority === 'MEDIUM' ? '🟡' : '🟢'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{rec.type}</div>
                                        <p className="text-sm text-gray-600">{rec.benefit}</p>
                                        <p className="text-sm text-blue-600 mt-1">{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPersonalTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                    {formData.dateOfBirth && (
                        <p className="text-sm text-gray-600 mt-1">
                            Age: {new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()} years
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="Nigerian">Nigerian</option>
                        <option value="Non-Nigerian">Non-Nigerian</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderEmploymentTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept._key} value={dept._key}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Grade</label>
                    <input
                        type="text"
                        name="jobGrade"
                        value={formData.jobGrade}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                        <option value="casual">Casual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                    <select
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="active">Active</option>
                        <option value="probation">Probation</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
                    <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Probation End Date</label>
                    <input
                        type="date"
                        name="probationEndDate"
                        value={formData.probationEndDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderSalaryTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary *</label>
                    <input
                        type="number"
                        name="basicSalary"
                        value={formData.basicSalary}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Housing Allowance</label>
                    <input
                        type="number"
                        name="housingAllowance"
                        value={formData.housingAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Allowance</label>
                    <input
                        type="number"
                        name="transportAllowance"
                        value={formData.transportAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Allowance</label>
                    <input
                        type="number"
                        name="mealAllowance"
                        value={formData.mealAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Utility Allowance</label>
                    <input
                        type="number"
                        name="utilityAllowance"
                        value={formData.utilityAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uniform Allowance</label>
                    <input
                        type="number"
                        name="uniformAllowance"
                        value={formData.uniformAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hardship Allowance</label>
                    <input
                        type="number"
                        name="hardshipAllowance"
                        value={formData.hardshipAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Entertainment Allowance</label>
                    <input
                        type="number"
                        name="entertainmentAllowance"
                        value={formData.entertainmentAllowance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Allowances</label>
                    <input
                        type="number"
                        name="otherAllowances"
                        value={formData.otherAllowances}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
            </div>
            
            {/* Salary Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Salary Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Basic Salary:</div>
                    <div className="text-right">₦ {parseFloat(formData.basicSalary || 0).toLocaleString()}</div>
                    <div>Total Allowances:</div>
                    <div className="text-right">₦ {(calculateTotalSalary() - parseFloat(formData.basicSalary || 0)).toLocaleString()}</div>
                    <div className="font-medium">Total Monthly Salary:</div>
                    <div className="font-medium text-right">₦ {calculateTotalSalary().toLocaleString()}</div>
                    <div className="font-medium">Total Annual Salary:</div>
                    <div className="font-medium text-right">₦ {(calculateTotalSalary() * 12).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );

    const renderEligibilityTab = () => (
        <div className="space-y-6">
            {isAssessing ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Analyzing tax eligibility...</p>
                    </div>
                </div>
            ) : (
                <>
                    {renderAssessmentSummary()}
                    
                    <EligibilityAssessmentForm
                        employee={formData}
                        onUpdate={handleUpdateEligibility}
                        employmentType={formData.employmentType}
                    />
                    
                    {/* Quick Eligibility Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button
                            type="button"
                            onClick={() => runEligibilityAssessment(formData)}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="mr-3 text-blue-600">🔄</div>
                                <div className="text-left">
                                    <div className="font-medium text-blue-900">Re-assess Eligibility</div>
                                    <div className="text-sm text-blue-700">Update calculations</div>
                                </div>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="mr-3 text-green-600">📄</div>
                                <div className="text-left">
                                    <div className="font-medium text-green-900">Generate Report</div>
                                    <div className="text-sm text-green-700">Export eligibility report</div>
                                </div>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setActiveTab('documents')}
                            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="mr-3 text-purple-600">📎</div>
                                <div className="text-left">
                                    <div className="font-medium text-purple-900">Upload Documents</div>
                                    <div className="text-sm text-purple-700">Required for exemptions</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const renderComplianceTab = () => (
        <div className="space-y-8">
            {/* Tax Compliance */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (TIN) *</label>
                        <input
                            type="text"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pension ID (RSA)</label>
                        <input
                            type="text"
                            name="pensionId"
                            value={formData.pensionId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NHF ID</label>
                        <input
                            type="text"
                            name="nhfId"
                            value={formData.nhfId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NHIS ID</label>
                        <input
                            type="text"
                            name="nhisId"
                            value={formData.nhisId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ITF ID</label>
                        <input
                            type="text"
                            name="itfId"
                            value={formData.itfId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Bank Information */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number *</label>
                        <input
                            type="text"
                            name="bankAccount"
                            value={formData.bankAccount}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Code</label>
                        <input
                            type="text"
                            name="bankCode"
                            value={formData.bankCode}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="savings">Savings</option>
                            <option value="current">Current</option>
                            <option value="domiciliary">Domiciliary</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocumentsTab = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Exemption Documentation</h3>
            <p className="text-gray-600">Upload supporting documents for claimed exemptions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rent Relief Documents */}
                {(formData.housingSituation === 'renting' || formData.exemptions?.rentsPrimaryResidence) && (
                    <div className="bg-white p-6 rounded-xl border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-4">🏠 Rent Relief Documents</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tenancy Agreement
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'documents.tenancyAgreement',
                                            value: e.target.files[0]
                                        }
                                    })}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Required for rent relief claim
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recent Rent Receipts (Last 6 months)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'documents.rentReceipts',
                                            value: Array.from(e.target.files)
                                        }
                                    })}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Disability Documents */}
                {(formData.hasDisability || formData.exemptions?.isPersonWithDisability) && (
                    <div className="bg-white p-6 rounded-xl border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-4">♿ Disability Documents</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Disability Registration Certificate
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'documents.disabilityCertificate',
                                            value: e.target.files[0]
                                        }
                                    })}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medical Assessment Report
                                </label>
                                <input
                                    type="file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* NHF Exemption Documents */}
                {formData.exemptFromNHF && (
                    <div className="bg-white p-6 rounded-xl border border-green-200">
                        <h4 className="font-medium text-green-900 mb-4">🏘️ NHF Exemption Documents</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proof of Exemption
                            </label>
                            <input
                                type="file"
                                onChange={(e) => handleChange({
                                    target: {
                                        name: 'documents.nhfExemptionDoc',
                                        value: e.target.files[0]
                                    }
                                })}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Age proof, visa documentation, or official exemption letter
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Life Assurance Documents */}
                {formData.hasLifeAssurance && (
                    <div className="bg-white p-6 rounded-xl border border-purple-200">
                        <h4 className="font-medium text-purple-900 mb-4">🛡️ Life Assurance Documents</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Policy Document
                            </label>
                            <input
                                type="file"
                                onChange={(e) => handleChange({
                                    target: {
                                        name: 'documents.lifeAssurancePolicy',
                                        value: e.target.files[0]
                                    }
                                })}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>
                    </div>
                )}
                
                {/* Age Proof Document */}
                {formData.dateOfBirth && new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() >= 60 && (
                    <div className="bg-white p-6 rounded-xl border border-indigo-200">
                        <h4 className="font-medium text-indigo-900 mb-4">👵 Age Proof Document</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age Verification
                            </label>
                            <input
                                type="file"
                                onChange={(e) => handleChange({
                                    target: {
                                        name: 'documents.ageProof',
                                        value: e.target.files[0]
                                    }
                                })}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Birth certificate, passport, or age declaration
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Document Status Summary */}
            <div className="mt-6 bg-gray-50 p-6 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-4">Document Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Tenancy Agreement', has: formData.documents.tenancyAgreement },
                        { label: 'Rent Receipts', has: formData.documents.rentReceipts?.length > 0 },
                        { label: 'Disability Certificate', has: formData.documents.disabilityCertificate },
                        { label: 'NHF Exemption Proof', has: formData.documents.nhfExemptionDoc },
                        { label: 'Life Assurance Policy', has: formData.documents.lifeAssurancePolicy },
                        { label: 'Age Proof', has: formData.documents.ageProof }
                    ].filter(item => item.has !== undefined).map((doc, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${doc.has ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-700">{doc.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderJvTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">JV Partners</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jvPartners.map(partner => (
                        <div key={partner._key} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`jv-${partner._key}`}
                                checked={formData.jvPartners.includes(partner._key)}
                                onChange={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        jvPartners: prev.jvPartners.includes(partner._key)
                                            ? prev.jvPartners.filter(p => p !== partner._key)
                                            : [...prev.jvPartners, partner._key]
                                    }));
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`jv-${partner._key}`} className="ml-2 text-sm text-gray-700">
                                {partner.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            {formData.jvPartners.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected JV Partners</h4>
                    <ul className="list-disc pl-5 text-sm text-blue-700">
                        {formData.jvPartners.map(partnerId => {
                            const partner = jvPartners.find(p => p._key === partnerId);
                            return partner ? <li key={partnerId}>{partner.name}</li> : null;
                        })}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with Assessment Status */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {employee ? 'Edit Employee' : 'Add New Employee'}
                    </h1>
                    {eligibilityResults && (
                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-600">
                                Last assessed: {new Date().toLocaleDateString()}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                eligibilityResults.summary?.complianceStatus === 'COMPLIANT' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {eligibilityResults.summary?.complianceStatus === 'COMPLIANT' 
                                    ? '✓ Fully Compliant' 
                                    : '⚠ Needs Review'}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Progress Indicator */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ 
                            width: `${(tabs.indexOf(activeTab) + 1) / tabs.length * 100}%` 
                        }}
                    ></div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const icons = {
                            personal: '👤',
                            employment: '💼',
                            salary: '💰',
                            eligibility: '📊',
                            compliance: '⚖️',
                            documents: '📎',
                            jv: '🤝'
                        };
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === tab
                                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <span>{icons[tab]}</span>
                                <span className="capitalize">
                                    {tab === 'jv' ? 'JV Partners' : 
                                     tab === 'eligibility' ? 'Tax Eligibility' : tab}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && renderPersonalTab()}

                {/* Employment Information Tab */}
                {activeTab === 'employment' && renderEmploymentTab()}

                {/* Salary Structure Tab */}
                {activeTab === 'salary' && renderSalaryTab()}

                {/* Eligibility Assessment Tab */}
                {activeTab === 'eligibility' && renderEligibilityTab()}

                {/* Compliance Tab */}
                {activeTab === 'compliance' && renderComplianceTab()}

                {/* Documents Tab */}
                {activeTab === 'documents' && renderDocumentsTab()}

                {/* JV Allocation Tab */}
                {activeTab === 'jv' && renderJvTab()}

                {/* Form Actions */}
                <div className="flex justify-between pt-6 border-t">
                    <div>
                        {activeTab !== 'personal' && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <span className="mr-2">←</span> Previous
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        {activeTab !== 'jv' ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Next <span className="ml-2">→</span>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                <span className="mr-2">✅</span>
                                {employee ? 'Update Employee with Assessment' : 'Create Employee with Assessment'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;