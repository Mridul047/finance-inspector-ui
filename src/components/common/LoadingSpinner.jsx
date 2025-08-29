import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

// Inline loading spinner for buttons
export const InlineSpinner = ({ className = '' }) => (
  <div className={`inline-block w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent ${className}`}></div>
);

// Full page loading overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <LoadingSpinner size="lg" message={message} />
    </div>
  </div>
);

// Skeleton loading placeholder
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`bg-gray-200 rounded h-4 mb-2 ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export default LoadingSpinner;