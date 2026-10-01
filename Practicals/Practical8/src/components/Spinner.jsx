import React from 'react';

/**
 * Spinner Component
 * Displays a loading spinner while the API request is in progress.
 */
function Spinner({ message = 'Fetching GitHub repositories...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
}

export default Spinner;
