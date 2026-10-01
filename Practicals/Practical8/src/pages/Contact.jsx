import React, { useState } from 'react';

/**
 * Modern Contact Page Component
 * Implements a controlled form using useState and displays user input in real-time.
 */
function Contact({ contactData }) {
  const { email, github, linkedin, location } = contactData || {};

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Project Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle controlled input changes in real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'Project Inquiry',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <div className="page-wrapper">
      <section className="section-card">
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title">
            <span className="title-icon">📬</span> Get In Touch & Let's Connect
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Have a question, project inquiry, or internship opportunity? Send a message below or reach out directly.
          </p>
        </div>

        {/* 50/50 Balanced Split: Controlled Form & Real-time Live Preview */}
        <div className="contact-grid">
          {/* Controlled Form Section */}
          <div className="form-container">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✉️</span> Send a Direct Message
            </h3>

            {submitted ? (
              <div className="submission-success" style={{ padding: '24px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '20px' }}>Message Sent Successfully!</h3>
                <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  Thank you, <strong>{formData.name}</strong>. Your message regarding <em>"{formData.subject}"</em> has been received. I will respond to <strong>{formData.email}</strong> shortly.
                </p>
                <button onClick={handleReset} className="fetch-btn">
                  🔄 Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="username-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. jane@example.com"
                    className="username-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject / Purpose</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="username-input"
                  >
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Internship / Hiring">Internship / Hiring Opportunity</option>
                    <option value="Collaboration">Open Source Collaboration</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your detailed message here..."
                    className="username-input"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '8px' }}>
                  🚀 Send Message Now
                </button>
              </form>
            )}
          </div>

          {/* Real-time Controlled Input Live Preview Container */}
          <div className="live-preview-container">
            <div className="live-preview-header">
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Real-Time Live Preview
              </h3>
              <span className="badge badge-completed">
                useState Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
              <div className="preview-field-box">
                <span className="field-label-tag">From Name</span>
                <div className="field-value-text">
                  {formData.name || <em style={{ opacity: 0.6 }}>(Awaiting name input...)</em>}
                </div>
              </div>

              <div className="preview-field-box">
                <span className="field-label-tag">Email Address</span>
                <div className="field-value-text">
                  {formData.email || <em style={{ opacity: 0.6 }}>(Awaiting email input...)</em>}
                </div>
              </div>

              <div className="preview-field-box">
                <span className="field-label-tag">Subject / Purpose</span>
                <div className="field-value-text">
                  <span className="badge badge-priority-high">{formData.subject}</span>
                </div>
              </div>

              <div className="preview-field-box" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="field-label-tag">Message Content</span>
                <div
                  className="preview-message-box"
                  style={{
                    flexGrow: 1,
                    minHeight: '110px',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: formData.message ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  {formData.message ? formData.message : '(Type in the form to watch message text update here live)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
