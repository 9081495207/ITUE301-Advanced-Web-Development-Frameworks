import React from 'react';

/**
 * Footer Component
 * Displays contact channels, social links, location, and dynamic copyright info.
 * Receives `contactData` object via props.
 */
function Footer({ contactData }) {
  const { email, github, linkedin, location, copyrightYear, studentName } = contactData || {};

  return (
    <footer className="section-card footer-card">
      <div className="footer-top">
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            Let's Connect
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Feel free to reach out for collaborations or project inquiries.
          </p>
        </div>

        <div className="footer-contacts">
          {email && (
            <a href={`mailto:${email}`} className="contact-link" target="_blank" rel="noopener noreferrer">
              ✉️ {email}
            </a>
          )}
          {github && (
            <a href={`https://${github}`} className="contact-link" target="_blank" rel="noopener noreferrer">
              💻 GitHub
            </a>
          )}
          {linkedin && (
            <a href={`https://${linkedin}`} className="contact-link" target="_blank" rel="noopener noreferrer">
              🔗 LinkedIn
            </a>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {copyrightYear || new Date().getFullYear()} {studentName || 'Alex Rivers'}. All rights reserved.
        </div>
        <div>
          📍 {location || 'San Francisco, CA'}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
