import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpense } from '../../hooks/useExpenses';
import { useCategories } from '../../contexts/CategoryContext';
import expenseService from '../../services/expenseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function ExpenseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = 1; // Hardcoded for now, would come from auth context
  
  const isEditing = Boolean(id);
  const { expense, loading: expenseLoading, error: expenseError } = useExpense(isEditing ? id : null, userId);
  const { getCategoryOptions, categories, loading: categoryContextLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currencyCode: 'USD',
    expenseDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    categoryId: '',
    expenseType: 'WANT',
    notes: ''
  });
  
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load category options when categories are available
  useEffect(() => {
    if (getCategoryOptions && categories.length > 0) {
      console.log('Loading category options from context...');
      const options = getCategoryOptions();
      console.log('Category options loaded:', options);
      setCategoryOptions(options || []);
    } else {
      setCategoryOptions([]);
    }
  }, [getCategoryOptions, categories]);

  // Load expense data for editing
  useEffect(() => {
    if (isEditing && expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount ? expense.amount.toString() : '',
        currencyCode: expense.currencyCode || 'USD',
        expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
        categoryId: expense.categoryId ? expense.categoryId.toString() : '',
        expenseType: expense.expenseType || 'WANT',
        notes: expense.notes || ''
      });
    }
  }, [isEditing, expense]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.currencyCode) {
      errors.currencyCode = 'Currency code is required';
    }
    
    if (!formData.expenseDate) {
      errors.expenseDate = 'Expense date is required';
    }
    
    // Category is always required according to backend validation
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    if (!formData.expenseType) {
      errors.expenseType = 'Expense type is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currencyCode: formData.currencyCode,
        expenseDate: formData.expenseDate,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        expenseType: formData.expenseType,
        notes: formData.notes.trim() || null
      };
      
      if (isEditing) {
        await expenseService.updateExpense(id, userId, expenseData);
      } else {
        await expenseService.createExpense(userId, expenseData);
      }
      
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to ${isEditing ? 'update' : 'create'} expense`);
      console.error(`${isEditing ? 'Update' : 'Create'} expense error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  const currencyOptions = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  if (isEditing && expenseLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isEditing && expenseError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Expense</p>
              <p className="text-red-700 text-sm">{expenseError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update expense details' : 'Track a new expense with categorization'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error {isEditing ? 'Updating' : 'Creating'} Expense</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-grid-2 gap-4 md:gap-6">
          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.amount && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              id="currencyCode"
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.currencyCode ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {currencyOptions.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            {validationErrors.currencyCode && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.currencyCode}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-2">
              Expense Date *
            </label>
            <input
              type="date"
              id="expenseDate"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.expenseDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.expenseDate && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.expenseDate}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            
            {/* Show loading state */}
            {categoryContextLoading && (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            )}
            
            {/* Show category selector */}
            {!categoryContextLoading && (
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={categoryOptions.length === 0}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.categoryId ? 'border-red-300' : 'border-gray-300'
                } ${categoryOptions.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {categoryOptions.length === 0 ? 'No categories available' : 'Select a category...'}
                </option>
                {categoryOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* Category help text */}
            {categoryOptions.length === 0 && !categoryContextLoading && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                ⚠️ No categories available. You must
                <a href="/categories/new" className="ml-1 underline hover:no-underline font-semibold">
                  create a category first
                </a> before adding expenses.
              </div>
            )}
            
            {validationErrors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.categoryId}</p>
            )}
          </div>

          {/* Expense Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="expenseType"
                  value="NEED"
                  checked={formData.expenseType === 'NEED'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">🚨 Need (Essential)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="expenseType"
                  value="WANT"
                  checked={formData.expenseType === 'WANT'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">🎯 Want (Optional)</span>
              </label>
            </div>
            {validationErrors.expenseType && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.expenseType}</p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes or details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Expense' : 'Create Expense')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;