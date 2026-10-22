import React from 'react';

/**
 * ErrorMessage Component
 * Displays an error alert message if the REST API call fails, with optional retry trigger.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h3 className="error-title">API Request Failed</h3>
      </div>
      <p className="error-text">
        {message || 'Unable to fetch data from the server. Please check your network connection.'}
      </p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          🔄 Retry Fetch
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
