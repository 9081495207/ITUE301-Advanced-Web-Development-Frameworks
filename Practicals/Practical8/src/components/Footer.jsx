import React, { useState } from 'react';

/**
 * Modern Footer Component with Let's Connect Channel Cards & Social Links
 */
function Footer({ contactData }) {
  const { email, github, linkedin, location, copyrightYear, studentName } = contactData || {};
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    const targetEmail = email || 'jainamkamani95@gmail.com';
    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="section-card footer-card" style={{ marginTop: '36px', padding: '32px' }}>
      <div className="footer-connect-wrapper">
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤝</span> Let's Connect & Collaborate
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Open for software engineering internships, web development projects, and open-source collaborations.
          </p>
        </div>

        {/* 4 Interactive Contact Channels Cards */}
        <div className="connect-channels-grid">
          {/* Email Channel Card */}
          <div className="channel-card">
            <div className="channel-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
              ✉️
            </div>
            <div className="channel-info">
              <div className="channel-label">Email Direct</div>
              <a href={`mailto:${email || 'jainamkamani95@gmail.com'}`} className="channel-value-link">
                {email || 'jainamkamani95@gmail.com'}
              </a>
            </div>
            <button onClick={handleCopyEmail} className="channel-action-btn" title="Copy Email Address">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* GitHub Channel Card */}
          <div className="channel-card">
            <div className="channel-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              💻
            </div>
            <div className="channel-info">
              <div className="channel-label">GitHub Profile</div>
              <a href={`https://${github || 'github.com/jainamkamani'}`} target="_blank" rel="noopener noreferrer" className="channel-value-link">
                {github || 'github.com/jainamkamani'}
              </a>
            </div>
            <a href={`https://${github || 'github.com/jainamkamani'}`} target="_blank" rel="noopener noreferrer" className="channel-action-btn">
              🔗 Visit
            </a>
          </div>

          {/* LinkedIn Channel Card */}
          <div className="channel-card">
            <div className="channel-icon" style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
              💼
            </div>
            <div className="channel-info">
              <div className="channel-label">LinkedIn Network</div>
              <a href={`https://${linkedin || 'linkedin.com/in/jainamkamani'}`} target="_blank" rel="noopener noreferrer" className="channel-value-link">
                {linkedin || 'linkedin.com/in/jainamkamani'}
              </a>
            </div>
            <a href={`https://${linkedin || 'linkedin.com/in/jainamkamani'}`} target="_blank" rel="noopener noreferrer" className="channel-action-btn">
              🔗 Connect
            </a>
          </div>

          {/* Location / Campus Card */}
          <div className="channel-card">
            <div className="channel-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              📍
            </div>
            <div className="channel-info">
              <div className="channel-label">Location & University</div>
              <div className="channel-value-text">
                {location || 'Junagadh, Gujarat'} • CHARUSAT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Line */}
      <div className="footer-bottom-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          © {copyrightYear || 2026} {studentName || 'Jainam Kamani'}. All rights reserved.
        </div>
        <div>
          Built with ⚛️ React, Vite & Modern Web Frameworks (ITUE301)
        </div>
      </div>
    </footer>
  );
}

export default Footer;
