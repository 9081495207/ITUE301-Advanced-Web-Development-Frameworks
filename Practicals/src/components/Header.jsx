import React from 'react';

/**
 * Header Component
 * Displays profile photo avatar, student name, current title/role, degree details, and availability status badge.
 * Receives `studentInfo` object via props.
 */
function Header({ studentInfo }) {
  const { name, role, degree, university, statusTag, avatar } = studentInfo || {};

  return (
    <header className="section-card header-card">
      <div className="header-top">
        <div className="header-badge">
          <span className="pulse-dot"></span>
          <span>{statusTag || 'Available for Internships'}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          🎓 Student Portfolio
        </div>
      </div>

      <div className="header-main-layout">
        {/* Profile Photo Avatar */}
        <div className="avatar-wrapper">
          <img
            src={avatar || '/profile.png'}
            alt={name || 'Student Profile'}
            className="profile-avatar-img"
          />
          <div className="avatar-glow-ring"></div>
        </div>

        <div className="header-info">
          <h1 className="student-title">
            Hello, I'm <span className="gradient-text">{name || 'Alex Rivers'}</span>
          </h1>
          <p className="student-role">{role || 'Full-Stack Developer & CS Student'}</p>

          <div className="header-meta">
            <span className="meta-item">
              🏫 {university || 'Tech University'}
            </span>
            <span className="meta-item">
              📜 {degree || 'B.S. Computer Science'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
