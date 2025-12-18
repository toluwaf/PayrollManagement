// src/components/common/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
    
    // Log to error tracking service
    console.error('Payroll Settings Error:', error, errorInfo);
    
    // Send to monitoring service (optional)
    if (window.analytics) {
      window.analytics.track('component_error', {
        component: 'PayrollSettings',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Trigger parent retry if available
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleResetSettings = () => {
    if (window.confirm('Reset settings to defaults and retry?')) {
      // Clear settings from localStorage if they exist there
      localStorage.removeItem('payroll_settings_cache');
      sessionStorage.removeItem('payroll_settings_form_state');
      
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const maxRetries = 3;
      
      if (this.state.retryCount >= maxRetries) {
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Critical Error</h3>
                <p className="text-red-700">
                  Unable to load payroll settings after multiple attempts.
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white border border-red-100 rounded text-sm">
              <p className="font-medium mb-1">Error Details:</p>
              <code className="text-xs text-gray-600 block overflow-x-auto p-2 bg-gray-50 rounded">
                {this.state.error?.toString() || 'Unknown error'}
              </code>
              
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View technical details
                  </summary>
                  <pre className="mt-1 p-2 bg-gray-50 text-xs overflow-auto max-h-40 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={this.handleResetSettings}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Settings & Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Something went wrong</h3>
              <p className="text-yellow-700">
                Failed to load payroll settings. Please try again.
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={this.handleRetry}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Try Again ({this.state.retryCount}/{maxRetries})
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;