import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center">
        <div className={`animate-spin rounded-full border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
        {text && (
          <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Variant for inline loading with text
export const InlineLoading = ({ text = 'Loading...', size = 'sm', color = 'blue' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`animate-spin rounded-full border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

// Variant for button loading states
export const ButtonSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    <span>{text}</span>
  </div>
);

// Variant for page loading
export const PageLoader = ({ message = 'Loading, please wait...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Variant for table row loading
export const TableRowLoader = ({ colSpan = 1 }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-8 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </td>
  </tr>
);

// Variant for card loading
export const CardLoader = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="animate-pulse">
      <div className="flex space-x-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;