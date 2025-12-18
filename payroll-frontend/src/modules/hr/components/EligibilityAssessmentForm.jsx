// src/components/employees/EligibilityAssessmentForm.jsx
import React, { useState, useEffect } from 'react';

const EligibilityAssessmentForm = ({ employee, onUpdate, employmentType }) => {
  const [activeSection, setActiveSection] = useState('housing');
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle text/number input changes
  const handleTextChange = (field, value) => {
    onUpdate(field, value);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field, checked) => {
    onUpdate(field, checked);
  };

  // Handle radio changes
  const handleRadioChange = (field, value) => {
    onUpdate(field, value);
  };

  // Handle file uploads
  const handleFileUpload = (field, file) => {
    // For file uploads, we just update the form state
    // The actual upload will happen when the form is submitted
    onUpdate(field, file);
  };

  // Housing Situation Section
  const HousingSituationSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">Housing Situation</h4>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="housingSituation"
            value="renting"
            checked={employee.housingSituation === 'renting'}
            onChange={(e) => handleRadioChange('housingSituation', e.target.value)}
            className="text-blue-600"
          />
          <div>
            <span className="font-medium">Renting</span>
            <p className="text-sm text-gray-500">Eligible for rent relief (20% of annual rent, max ₦500,000)</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="housingSituation"
            value="owner"
            checked={employee.housingSituation === 'owner'}
            onChange={(e) => handleRadioChange('housingSituation', e.target.value)}
            className="text-blue-600"
          />
          <div>
            <span className="font-medium">Home Owner</span>
            <p className="text-sm text-gray-500">Not eligible for rent relief</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="housingSituation"
            value="company"
            checked={employee.housingSituation === 'company'}
            onChange={(e) => handleRadioChange('housingSituation', e.target.value)}
            className="text-blue-600"
          />
          <div>
            <span className="font-medium">Company Provided</span>
            <p className="text-sm text-gray-500">Housing benefit may be taxable</p>
          </div>
        </label>
      </div>
      
      {employee.housingSituation === 'renting' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Rent Paid (₦)
          </label>
          <input
            type="number"
            value={employee.annualRent || ''}
            onChange={(e) => handleTextChange('annualRent', parseFloat(e.target.value) || 0)}
            className="border rounded-lg px-3 py-2 w-full"
            placeholder="e.g., 1200000"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            Rent relief: ₦{Math.min((employee.annualRent || 0) * 0.2, 500000).toLocaleString()} annually
          </p>
        </div>
      )}
    </div>
  );

  // NHF Exemption Section
  const NHFExemptionSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">NHF (National Housing Fund) Status</h4>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={employee.exemptFromNHF || false}
            onChange={(e) => handleCheckboxChange('exemptFromNHF', e.target.checked)}
            className="text-blue-600 rounded"
          />
          <div>
            <span className="font-medium">Exempt from NHF Contribution</span>
            <p className="text-sm text-gray-500">Check if eligible for exemption</p>
          </div>
        </label>
        
        {employee.exemptFromNHF && (
          <div className="ml-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exemption Reason
              </label>
              <select
                value={employee.nhfExemptionReason || ''}
                onChange={(e) => handleTextChange('nhfExemptionReason', e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">Select reason</option>
                <option value="age_60_plus">60+ years old</option>
                <option value="non_nigerian">Non-Nigerian citizen</option>
                <option value="casual_worker">Casual worker (less than 6 months)</option>
                <option value="contract_staff">Contract staff</option>
                <option value="other">Other (specify)</option>
              </select>
            </div>
            
            {employee.nhfExemptionReason === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specify Reason
                </label>
                <input
                  type="text"
                  value={employee.nhfExemptionDetails || ''}
                  onChange={(e) => handleTextChange('nhfExemptionDetails', e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="e.g., Diplomatic staff"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Document
              </label>
              <input
                type="file"
                onChange={(e) => handleFileUpload('nhfExemptionDoc', e.target.files[0])}
                className="border rounded-lg px-3 py-2 w-full"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload proof of exemption (PDF, JPG, PNG)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Pension Optimization Section
  const PensionSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">Pension Contributions</h4>
      
      <div className="space-y-3">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Mandatory Pension</span>
            <span className="text-sm">8% of pensionable emoluments</span>
          </div>
          <p className="text-xs text-gray-500">
            Automatically calculated from Basic + Housing + Transport
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Voluntary Contribution (Monthly)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₦</span>
            <input
              type="number"
              value={employee.additionalPension || ''}
              onChange={(e) => handleTextChange('additionalPension', parseFloat(e.target.value) || 0)}
              className="border rounded-lg px-3 py-2 w-full pl-8"
              placeholder="e.g., 10000"
              min="0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Up to 15% of pensionable emoluments (tax deductible)
          </p>
        </div>
        
        {employee.additionalPension > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              Tax Saving: ₦{(employee.additionalPension * 0.20 * 12).toLocaleString()} annually
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Life Assurance Section
  const LifeAssuranceSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">Life Assurance</h4>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={employee.hasLifeAssurance || false}
            onChange={(e) => handleCheckboxChange('hasLifeAssurance', e.target.checked)}
            className="text-blue-600 rounded"
          />
          <div>
            <span className="font-medium">Has Life Assurance Policy</span>
            <p className="text-sm text-gray-500">Premiums are tax-deductible (up to 10% of income)</p>
          </div>
        </label>
        
        {employee.hasLifeAssurance && (
          <div className="ml-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Premium (₦)
              </label>
              <input
                type="number"
                value={employee.lifeAssurancePremium || ''}
                onChange={(e) => handleTextChange('lifeAssurancePremium', parseFloat(e.target.value) || 0)}
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="e.g., 50000"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Details
              </label>
              <input
                type="text"
                value={employee.lifeAssuranceProvider || ''}
                onChange={(e) => handleTextChange('lifeAssuranceProvider', e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Insurance company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number
              </label>
              <input
                type="text"
                value={employee.lifeAssurancePolicyNo || ''}
                onChange={(e) => handleTextChange('lifeAssurancePolicyNo', e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Policy reference number"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Disability & Special Categories
  const SpecialCategoriesSection = () => {
    const age = calculateAge(employee.dateOfBirth);
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Special Categories</h4>
        
        <div className="space-y-4">
          {/* Disability */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={employee.hasDisability || false}
                onChange={(e) => handleCheckboxChange('hasDisability', e.target.checked)}
                className="text-blue-600 rounded"
              />
              <div>
                <span className="font-medium">Person with Disability</span>
                <p className="text-sm text-gray-500">Eligible for additional ₦20,000 monthly relief</p>
              </div>
            </label>
            
            {employee.hasDisability && (
              <div className="ml-8 mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disability Category
                  </label>
                  <select
                    value={employee.disabilityCategory || ''}
                    onChange={(e) => handleTextChange('disabilityCategory', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                  >
                    <option value="">Select category</option>
                    <option value="physical">Physical Disability</option>
                    <option value="visual">Visual Impairment</option>
                    <option value="hearing">Hearing Impairment</option>
                    <option value="intellectual">Intellectual Disability</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disability Registration Number
                  </label>
                  <input
                    type="text"
                    value={employee.disabilityRegNo || ''}
                    onChange={(e) => handleTextChange('disabilityRegNo', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="e.g., NCPWD-XXXX-XXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Certificate
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('disabilityCertificate', e.target.files[0])}
                    className="border rounded-lg px-3 py-2 w-full"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Aged Person */}
          {age >= 65 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-yellow-800">Aged Person Relief Eligible</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Additional 5% of income relief available. Submit age proof.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Benefits Summary - Simplified without TaxEligibilityChecker dependency
  const BenefitsSummary = () => {
    // Calculate estimated benefits based on form data
    const calculateEstimatedBenefits = () => {
      const benefits = [];
      
      // Rent Relief
      if (employee.housingSituation === 'renting' && employee.annualRent > 0) {
        const rentRelief = Math.min(employee.annualRent * 0.2, 500000);
        benefits.push({
          type: 'RENT_RELIEF',
          benefit: `Annual rent relief: ₦${rentRelief.toLocaleString()}`,
          priority: 'HIGH'
        });
      }
      
      // NHF Exemption
      if (employee.exemptFromNHF) {
        const basicSalary = parseFloat(employee.basicSalary) || 0;
        const nhfSavings = basicSalary * 0.025 * 12; // 2.5% of basic salary annually
        benefits.push({
          type: 'NHF_EXEMPTION',
          benefit: `NHF savings: ₦${nhfSavings.toLocaleString()} annually`,
          priority: 'HIGH'
        });
      }
      
      // Additional Pension
      if (employee.additionalPension > 0) {
        const taxSavings = employee.additionalPension * 0.20 * 12; // 20% tax rate
        benefits.push({
          type: 'VOLUNTARY_PENSION',
          benefit: `Tax savings from voluntary pension: ₦${taxSavings.toLocaleString()} annually`,
          priority: 'MEDIUM'
        });
      }
      
      // Disability Relief
      if (employee.hasDisability) {
        const disabilityRelief = 20000 * 12; // ₦20,000 monthly
        benefits.push({
          type: 'DISABILITY_RELIEF',
          benefit: `Annual disability relief: ₦${disabilityRelief.toLocaleString()}`,
          priority: 'HIGH'
        });
      }
      
      // Life Assurance
      if (employee.hasLifeAssurance && employee.lifeAssurancePremium > 0) {
        const lifeAssuranceSavings = Math.min(employee.lifeAssurancePremium * 0.20, (employee.lifeAssurancePremium * 0.10));
        benefits.push({
          type: 'LIFE_ASSURANCE',
          benefit: `Tax deductible life assurance: ₦${lifeAssuranceSavings.toLocaleString()} annually`,
          priority: 'MEDIUM'
        });
      }
      
      return benefits;
    };
    
    const benefits = calculateEstimatedBenefits();
    const totalSavings = benefits.reduce((sum, benefit) => {
      // Extract numeric value from benefit string
      const match = benefit.benefit.match(/₦([\d,]+)/);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        return sum + (value || 0);
      }
      return sum;
    }, 0);
    
    if (benefits.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">Estimated Tax Benefits</h4>
        
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start">
              {benefit.priority === 'HIGH' ? (
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              
              <div>
                <div className="font-medium text-blue-800">{benefit.type}</div>
                <p className="text-sm text-blue-700">{benefit.benefit}</p>
              </div>
            </div>
          ))}
          
          {totalSavings > 0 && (
            <div className="pt-3 border-t border-blue-300">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Total Estimated Annual Benefit:</span>
                <span className="text-lg font-bold text-blue-900">
                  ₦{totalSavings.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'housing', label: 'Housing', icon: '🏠' },
            { id: 'nhf', label: 'NHF', icon: '🏘️' },
            { id: 'pension', label: 'Pension', icon: '💰' },
            { id: 'life', label: 'Life Assurance', icon: '🛡️' },
            { id: 'special', label: 'Special', icon: '⭐' }
          ].map(tab => (
            <button
              type="button"  // CRITICAL: Prevents form submission
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-2 px-3 text-sm font-medium whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Active Section Content */}
      <div className="min-h-[300px]">
        {activeSection === 'housing' && <HousingSituationSection />}
        {activeSection === 'nhf' && <NHFExemptionSection />}
        {activeSection === 'pension' && <PensionSection />}
        {activeSection === 'life' && <LifeAssuranceSection />}
        {activeSection === 'special' && <SpecialCategoriesSection />}
      </div>
      
      {/* Benefits Summary */}
      <BenefitsSummary />
      
      {/* Documentation Checklist - Static for now */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-3">Required Documentation Checklist</h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          {employee.housingSituation === 'renting' && (
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tenancy Agreement for Rent Relief
            </li>
          )}
          {employee.exemptFromNHF && (
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Proof of NHF Exemption
            </li>
          )}
          {employee.hasDisability && (
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Disability Registration Certificate
            </li>
          )}
          {employee.hasLifeAssurance && (
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Life Assurance Policy Document
            </li>
          )}
          {calculateAge(employee.dateOfBirth) >= 60 && (
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Age Proof Document
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EligibilityAssessmentForm;