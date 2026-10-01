import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * NotFound Component (Custom 404 Error Page)
 * Rendered when a user navigates to an unknown path.
 */
function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="section-card not-found-card">
        <div className="not-found-badge">404 ERROR</div>
        <div className="not-found-header">
          <span className="not-found-icon" role="img" aria-label="Search icon">
            🔍
          </span>
          <h2 className="not-found-title">Page Not Found</h2>
        </div>
        <p className="not-found-description">
          Oops! The page path <code className="not-found-path">{location.pathname}</code> could not be found on this server.
        </p>
        <p className="not-found-subtext">
          It might have been moved, renamed, or perhaps it never existed.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            🏠 Return to Home
          </Link>
          <button onClick={() => navigate(-1)} className="not-found-btn secondary">
            ⬅️ Go Back
          </button>
          <Link to="/projects" className="not-found-btn outline">
            🚀 View Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
