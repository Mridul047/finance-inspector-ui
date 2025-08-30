import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Enhanced error handling with user-friendly messages
    const enhancedError = parseApiError(error);
    console.error('API Response Error:', enhancedError);
    return Promise.reject(enhancedError);
  }
);

// Enhanced error parsing function
const parseApiError = (error) => {
  // Default error structure
  const parsedError = {
    message: 'An unexpected error occurred',
    status: error.response?.status || 0,
    code: error.code || 'UNKNOWN_ERROR',
    details: null,
    isNetworkError: false,
    isValidationError: false,
    isAuthenticationError: false,
    isAuthorizationError: false,
    isNotFoundError: false,
    isServerError: false,
    originalError: error
  };

  // Network errors (no response)
  if (!error.response) {
    parsedError.isNetworkError = true;
    parsedError.message = error.code === 'ECONNABORTED'
      ? 'Request timed out. Please check your connection and try again.'
      : 'Network error. Please check your internet connection.';
    parsedError.code = error.code || 'NETWORK_ERROR';
    return parsedError;
  }

  const { status, data } = error.response;
  parsedError.status = status;

  // Parse backend error response
  if (data) {
    // Spring Boot error format
    if (data.message) {
      parsedError.message = data.message;
    }
    if (data.error) {
      parsedError.details = data.error;
    }
    if (data.timestamp) {
      parsedError.timestamp = data.timestamp;
    }
    if (data.path) {
      parsedError.path = data.path;
    }
    // Validation errors
    if (data.validationErrors) {
      parsedError.validationErrors = data.validationErrors;
      parsedError.isValidationError = true;
    }
  }

  // Categorize errors by status code
  switch (status) {
    case 400:
      parsedError.isValidationError = true;
      parsedError.message = data?.message || 'Invalid request. Please check your input and try again.';
      break;
    case 401:
      parsedError.isAuthenticationError = true;
      parsedError.message = 'Authentication required. Please log in and try again.';
      break;
    case 403:
      parsedError.isAuthorizationError = true;
      parsedError.message = 'You do not have permission to perform this action.';
      break;
    case 404:
      parsedError.isNotFoundError = true;
      parsedError.message = data?.message || 'The requested resource was not found.';
      break;
    case 409:
      parsedError.message = data?.message || 'Conflict with existing data. Please refresh and try again.';
      break;
    case 422:
      parsedError.isValidationError = true;
      parsedError.message = data?.message || 'Validation failed. Please check your input.';
      break;
    case 500:
      parsedError.isServerError = true;
      parsedError.message = 'Internal server error. Please try again later.';
      break;
    case 502:
      parsedError.isServerError = true;
      parsedError.message = 'Service temporarily unavailable. Please try again later.';
      break;
    case 503:
      parsedError.isServerError = true;
      parsedError.message = 'Service unavailable. Please try again later.';
      break;
    default:
      if (status >= 500) {
        parsedError.isServerError = true;
        parsedError.message = 'Server error occurred. Please try again later.';
      } else if (status >= 400) {
        parsedError.message = data?.message || 'Client error occurred. Please check your request.';
      }
  }

  return parsedError;
};

// Export the error parser for use in services
export { parseApiError };

export default api;