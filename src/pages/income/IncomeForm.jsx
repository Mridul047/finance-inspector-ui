import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner, { InlineSpinner } from '../../components/common/LoadingSpinner';
import { useIncome, useSalaryIncome } from '../../hooks/useIncome';
import { useUsers } from '../../hooks/useUsers';

const IncomeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { createSalaryIncome, updateSalaryIncome, loading: actionLoading, error: actionError, clearError } = useIncome();
  const { income, loading: fetchLoading, error: fetchError } = useSalaryIncome(isEditing ? id : null);
  const { users, loading: usersLoading } = useUsers();
  
  const [formData, setFormData] = useState({
    userId: '',
    currencyCode: 'INR',
    basicAmount: '',
    hraAmount: '',
    otherAllowanceAmount: '',
    bonusAmount: '',
    empPfAmount: '',
    professionTaxAmount: '',
    incomeTaxAmount: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Load income data for editing
  useEffect(() => {
    if (isEditing && income) {
      setFormData({
        userId: income.userId || '',
        currencyCode: income.currencyCode || 'INR',
        basicAmount: income.basicAmount || '',
        hraAmount: income.hraAmount || '',
        otherAllowanceAmount: income.otherAllowanceAmount || '',
        bonusAmount: income.bonusAmount || '',
        empPfAmount: income.empPfAmount || '',
        professionTaxAmount: income.professionTaxAmount || '',
        incomeTaxAmount: income.incomeTaxAmount || ''
      });
    }
  }, [isEditing, income]);

  // Validation rules matching backend constraints
  const validateField = (name, value) => {
    switch (name) {
      case 'userId':
        if (!value) return 'User is required';
        break;
      
      case 'currencyCode':
        if (!value) return 'Currency code is required';
        if (value.length !== 3) return 'Currency code must be exactly 3 characters';
        break;
      
      case 'basicAmount':
      case 'hraAmount':
      case 'otherAllowanceAmount':
      case 'bonusAmount':
      case 'empPfAmount':
      case 'professionTaxAmount':
      case 'incomeTaxAmount':
        if (!value) return `${getFieldLabel(name)} is required`;
        if (isNaN(value) || Number(value) < 0) return `${getFieldLabel(name)} must be greater than or equal to 0`;
        break;
      
      default:
        break;
    }
    return null;
  };

  const getFieldLabel = (fieldName) => {
    const labels = {
      'basicAmount': 'Basic amount',
      'hraAmount': 'HRA amount',
      'otherAllowanceAmount': 'Other allowance amount',
      'bonusAmount': 'Bonus amount',
      'empPfAmount': 'Employee PF amount',
      'professionTaxAmount': 'Profession tax amount',
      'incomeTaxAmount': 'Income tax amount'
    };
    return labels[fieldName] || fieldName;
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Real-time validation for better UX
    if (touched[name] || submitAttempted) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
    
    clearError(); // Clear API errors when user starts typing
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        userId: Number(formData.userId),
        basicAmount: Number(formData.basicAmount),
        hraAmount: Number(formData.hraAmount),
        otherAllowanceAmount: Number(formData.otherAllowanceAmount),
        bonusAmount: Number(formData.bonusAmount),
        empPfAmount: Number(formData.empPfAmount),
        professionTaxAmount: Number(formData.professionTaxAmount),
        incomeTaxAmount: Number(formData.incomeTaxAmount)
      };

      if (isEditing) {
        await updateSalaryIncome(id, submitData);
      } else {
        await createSalaryIncome(submitData);
      }
      
      // Success - redirect to income list
      navigate('/income');
    } catch (error) {
      // Error is handled by the hook and displayed in UI
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/income');
  };

  // Calculate totals for preview
  const calculateGrossIncome = () => {
    return (Number(formData.basicAmount) || 0) + 
           (Number(formData.hraAmount) || 0) + 
           (Number(formData.otherAllowanceAmount) || 0) + 
           (Number(formData.bonusAmount) || 0);
  };

  const calculateTotalDeductions = () => {
    return (Number(formData.empPfAmount) || 0) + 
           (Number(formData.professionTaxAmount) || 0) + 
           (Number(formData.incomeTaxAmount) || 0);
  };

  const calculateNetIncome = () => {
    return calculateGrossIncome() - calculateTotalDeductions();
  };

  if (isEditing && fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner size="lg" message="Loading income data..." />
      </div>
    );
  }

  if (isEditing && fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Income</h2>
            <p className="text-gray-600 mb-4">{fetchError}</p>
            <button onClick={handleCancel} className="btn btn-secondary">
              Back to Income List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Salary Income Record' : 'Create New Salary Income Record'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Update salary income information with detailed components and deductions'
            : 'Add a new salary income record with detailed components and deductions'
          }
        </p>
      </div>

      {/* Error Message */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error {isEditing ? 'Updating' : 'Creating'} Salary Income Record</p>
              <p className="text-red-700 text-sm">{actionError}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.userId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={actionLoading || usersLoading}
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.userName})
                    </option>
                  ))}
                </select>
                {validationErrors.userId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.userId}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Code <span className="text-red-500">*</span>
                </label>
                <select
                  id="currencyCode"
                  name="currencyCode"
                  value={formData.currencyCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.currencyCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={actionLoading}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                {validationErrors.currencyCode && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.currencyCode}</p>
                )}
              </div>

              {/* Income Components Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">💰</span>
                  Income Components
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="basicAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Basic Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="basicAmount"
                      name="basicAmount"
                      value={formData.basicAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.basicAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.basicAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.basicAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hraAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      HRA Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="hraAmount"
                      name="hraAmount"
                      value={formData.hraAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.hraAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.hraAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.hraAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="otherAllowanceAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Other Allowance <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="otherAllowanceAmount"
                      name="otherAllowanceAmount"
                      value={formData.otherAllowanceAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.otherAllowanceAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.otherAllowanceAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.otherAllowanceAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bonusAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="bonusAmount"
                      name="bonusAmount"
                      value={formData.bonusAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.bonusAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.bonusAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.bonusAmount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-600 mr-2">📉</span>
                  Deductions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="empPfAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee PF Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="empPfAmount"
                      name="empPfAmount"
                      value={formData.empPfAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.empPfAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.empPfAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.empPfAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="professionTaxAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Profession Tax <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="professionTaxAmount"
                      name="professionTaxAmount"
                      value={formData.professionTaxAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.professionTaxAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.professionTaxAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.professionTaxAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="incomeTaxAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Income Tax Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="incomeTaxAmount"
                      name="incomeTaxAmount"
                      value={formData.incomeTaxAmount}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.incomeTaxAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                    {validationErrors.incomeTaxAmount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.incomeTaxAmount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`btn btn-primary flex items-center gap-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {actionLoading && <InlineSpinner />}
                {isEditing ? 'Update Salary Income' : 'Create Salary Income'}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Panel */}
        <div>
          <div className="card sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Summary</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Gross Income</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{calculateGrossIncome().toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Total Deductions</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{calculateTotalDeductions().toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Net Income</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{calculateNetIncome().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeForm;