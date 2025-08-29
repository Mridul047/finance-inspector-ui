import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner, { InlineSpinner } from '../../components/common/LoadingSpinner';
import { useUsers, useUser } from '../../hooks/useUsers';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { createUser, updateUser, loading: actionLoading, error: actionError, clearError } = useUsers();
  const { user, loading: fetchLoading, error: fetchError } = useUser(isEditing ? id : null);
  
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Load user data for editing
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        userName: user.userName || '',
        password: '', // Don't pre-fill password for security
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [isEditing, user]);

  // Validation rules matching backend constraints
  const validateField = (name, value) => {
    switch (name) {
      case 'userName':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 50) return 'Username must not exceed 50 characters';
        break;
      
      case 'password':
        if (!isEditing && !value.trim()) return 'Password is required';
        if (value && value.length < 8) return 'Password must be at least 8 characters';
        if (value && value.length > 100) return 'Password must not exceed 100 characters';
        break;
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.length > 100) return 'First name must not exceed 100 characters';
        break;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.length > 100) return 'Last name must not exceed 100 characters';
        break;
      
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      }
      
      default:
        break;
    }
    return null;
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
      if (isEditing) {
        // For editing, only send password if it's provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(id, updateData);
      } else {
        await createUser(formData);
      }
      
      // Success - redirect to users list
      navigate('/users');
    } catch (error) {
      // Error is handled by the hook and displayed in UI
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isEditing && fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingSpinner size="lg" message="Loading user data..." />
      </div>
    );
  }

  if (isEditing && fetchError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading User</h2>
            <p className="text-gray-600 mb-4">{fetchError}</p>
            <button onClick={handleCancel} className="btn btn-secondary">
              Back to Users
            </button>
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
          {isEditing ? 'Edit User' : 'Create New User'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Update user information in the Finance Inspector system'
            : 'Add a new user to the Finance Inspector system'
          }
        </p>
      </div>

      {/* Error Message */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error {isEditing ? 'Updating' : 'Creating'} User</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.userName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter username (3-50 characters)"
              disabled={actionLoading}
            />
            {validationErrors.userName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.userName}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password {!isEditing && <span className="text-red-500">*</span>}
              {isEditing && <span className="text-sm text-gray-500">(leave empty to keep current password)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isEditing ? "Enter new password (optional)" : "Enter password (8-100 characters)"}
              disabled={actionLoading}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* First Name and Last Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
                disabled={actionLoading}
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
                disabled={actionLoading}
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
              disabled={actionLoading}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
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
            {isEditing ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;