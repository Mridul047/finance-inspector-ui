// Comprehensive error handling utilities for the FinanceInspector application

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  SERVER: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// User-friendly error messages mapping
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Authentication & Authorization
  AUTHENTICATION_ERROR: 'Please log in to continue.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Invalid format. Please check your input.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  
  // Business logic errors
  NOT_FOUND_ERROR: 'The requested item was not found.',
  CONFLICT_ERROR: 'This action conflicts with existing data. Please refresh and try again.',
  DUPLICATE_ERROR: 'An item with this information already exists.',
  
  // Server errors
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  MAINTENANCE_ERROR: 'The service is temporarily unavailable for maintenance.',
  
  // Expense-specific errors
  EXPENSE_NOT_FOUND: 'Expense not found. It may have been deleted.',
  EXPENSE_CREATE_FAILED: 'Failed to create expense. Please check your input.',
  EXPENSE_UPDATE_FAILED: 'Failed to update expense. Please try again.',
  EXPENSE_DELETE_FAILED: 'Failed to delete expense. Please try again.',
  INVALID_EXPENSE_DATE: 'Please enter a valid expense date.',
  INVALID_EXPENSE_AMOUNT: 'Please enter a valid expense amount greater than 0.',
  
  // Category-specific errors
  CATEGORY_NOT_FOUND: 'Category not found. It may have been deleted.',
  CATEGORY_CREATE_FAILED: 'Failed to create category. Please check your input.',
  CATEGORY_UPDATE_FAILED: 'Failed to update category. Please try again.',
  CATEGORY_DELETE_FAILED: 'Failed to delete category. This category may have associated expenses.',
  CIRCULAR_CATEGORY_REFERENCE: 'A category cannot be its own parent or create a circular reference.',
  CATEGORY_NAME_EXISTS: 'A category with this name already exists.',
  
  // Default fallback
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Context-specific error message generators
export const getContextualErrorMessage = (error, context = 'general') => {
  const baseMessage = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  switch (context) {
    case 'expense':
      if (error.isNotFoundError) return ERROR_MESSAGES.EXPENSE_NOT_FOUND;
      if (error.isValidationError) {
        if (baseMessage.toLowerCase().includes('amount')) return ERROR_MESSAGES.INVALID_EXPENSE_AMOUNT;
        if (baseMessage.toLowerCase().includes('date')) return ERROR_MESSAGES.INVALID_EXPENSE_DATE;
        return ERROR_MESSAGES.EXPENSE_CREATE_FAILED;
      }
      if (error.status === 409) return ERROR_MESSAGES.CONFLICT_ERROR;
      break;
      
    case 'category':
      if (error.isNotFoundError) return ERROR_MESSAGES.CATEGORY_NOT_FOUND;
      if (error.isValidationError) {
        if (baseMessage.toLowerCase().includes('circular') || baseMessage.toLowerCase().includes('parent')) {
          return ERROR_MESSAGES.CIRCULAR_CATEGORY_REFERENCE;
        }
        if (baseMessage.toLowerCase().includes('exists') || baseMessage.toLowerCase().includes('duplicate')) {
          return ERROR_MESSAGES.CATEGORY_NAME_EXISTS;
        }
        return ERROR_MESSAGES.CATEGORY_CREATE_FAILED;
      }
      if (error.status === 409) return ERROR_MESSAGES.CATEGORY_DELETE_FAILED;
      break;
      
    case 'form':
      if (error.isValidationError && error.validationErrors) {
        // Return first validation error
        const firstError = Object.values(error.validationErrors)[0];
        return Array.isArray(firstError) ? firstError[0] : firstError;
      }
      break;
  }
  
  return baseMessage;
};

// Validation error field mapper
export const mapValidationErrors = (validationErrors) => {
  const fieldErrors = {};
  
  if (!validationErrors) return fieldErrors;
  
  Object.keys(validationErrors).forEach(field => {
    const errors = validationErrors[field];
    fieldErrors[field] = Array.isArray(errors) ? errors[0] : errors;
  });
  
  return fieldErrors;
};

// Error logging utility
export const logError = (error, context = 'general', additionalInfo = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    status: error.status,
    isNetworkError: error.isNetworkError,
    isValidationError: error.isValidationError,
    path: error.path,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalInfo
  };
  
  // In development, log to console
  if (import.meta.env.DEV) {
    console.group(`🚨 Error in ${context}`);
    console.error('Error details:', errorInfo);
    console.error('Original error:', error.originalError || error);
    console.groupEnd();
  }
  
  // In production, you might want to send to an error tracking service
  // Example: sendToErrorTracking(errorInfo);
  
  return errorInfo;
};

// Retry utility for transient errors
export const shouldRetry = (error, attempt = 1, maxAttempts = 3) => {
  if (attempt >= maxAttempts) return false;
  
  // Retry network errors and server errors (5xx)
  return error.isNetworkError || error.isServerError || error.status >= 500;
};

// Create user-friendly error for display
export const createDisplayError = (error, context = 'general') => {
  const message = getContextualErrorMessage(error, context);
  const displayError = {
    message,
    type: getErrorType(error),
    canRetry: shouldRetry(error),
    timestamp: new Date().toISOString(),
    technical: import.meta.env.DEV ? {
      status: error.status,
      originalMessage: error.message,
      path: error.path
    } : null
  };
  
  // Log the error
  logError(error, context);
  
  return displayError;
};

// Determine error type from error object
const getErrorType = (error) => {
  if (error.isNetworkError) return ERROR_TYPES.NETWORK;
  if (error.isValidationError) return ERROR_TYPES.VALIDATION;
  if (error.isAuthenticationError) return ERROR_TYPES.AUTHENTICATION;
  if (error.isAuthorizationError) return ERROR_TYPES.AUTHORIZATION;
  if (error.isNotFoundError) return ERROR_TYPES.NOT_FOUND;
  if (error.isServerError) return ERROR_TYPES.SERVER;
  if (error.code === 'ECONNABORTED') return ERROR_TYPES.TIMEOUT;
  if (error.status === 409) return ERROR_TYPES.CONFLICT;
  
  return ERROR_TYPES.UNKNOWN;
};

// Toast notification helpers for different error types
export const createErrorToast = (error, context = 'general') => {
  const displayError = createDisplayError(error, context);
  
  return {
    type: 'error',
    title: getErrorTitle(displayError.type),
    message: displayError.message,
    duration: displayError.type === ERROR_TYPES.NETWORK ? 10000 : 5000, // Longer for network errors
    actions: displayError.canRetry ? [
      { label: 'Retry', action: 'retry' }
    ] : null
  };
};

// Error title mapping
const getErrorTitle = (errorType) => {
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return 'Connection Error';
    case ERROR_TYPES.VALIDATION:
      return 'Invalid Input';
    case ERROR_TYPES.AUTHENTICATION:
      return 'Authentication Required';
    case ERROR_TYPES.AUTHORIZATION:
      return 'Access Denied';
    case ERROR_TYPES.NOT_FOUND:
      return 'Not Found';
    case ERROR_TYPES.CONFLICT:
      return 'Data Conflict';
    case ERROR_TYPES.SERVER:
      return 'Server Error';
    case ERROR_TYPES.TIMEOUT:
      return 'Request Timeout';
    default:
      return 'Error';
  }
};

// Export default error handler
export default {
  createDisplayError,
  createErrorToast,
  getContextualErrorMessage,
  mapValidationErrors,
  logError,
  shouldRetry,
  ERROR_TYPES,
  ERROR_MESSAGES
};