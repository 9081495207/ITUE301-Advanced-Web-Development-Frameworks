import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * NavBar Component
 * Provides responsive client-side routing navigation using NavLink
 * and a Light/Dark Theme toggle button.
 */
function NavBar({ theme, toggleTheme }) {
  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Jainam Kamani</span>
        </NavLink>

        <div className="navbar-actions">
          <div className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Projects
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Contact
            </NavLink>
          </div>

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
