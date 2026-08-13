import React, { useState } from 'react';

/**
 * Contact Page Component
 * Implements a controlled form using useState and displays user input in real-time.
 */
function Contact({ contactData }) {
  // useState variable #2: Managing controlled form state for real-time capture
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
        <h2 className="section-title">
          <span className="title-icon">📬</span> Get In Touch
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Have a question or want to work together? Fill out the form below to send a direct message.
        </p>

        <div className="contact-grid">
          {/* Controlled Form Section */}
          <div className="form-container">
            {submitted ? (
              <div className="submission-success">
                <div className="success-icon">🎉</div>
                <h3>Message Sent Successfully!</h3>
                <p>
                  Thank you, <strong>{formData.name}</strong>. I will get back to you shortly at{' '}
                  <span style={{ color: 'var(--cyan-accent)' }}>{formData.email}</span>.
                </p>
                <button onClick={handleReset} className="toggle-button" style={{ marginTop: '1.25rem' }}>
                  Send Another Message
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. jane@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Internship / Hiring">Internship / Hiring</option>
                    <option value="Collaboration">Collaboration</option>
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
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message 🚀
                </button>
              </form>
            )}
          </div>

          {/* Real-time Controlled Input Live Preview Card */}
          <div className="live-preview-container">
            <div className="preview-card">
              <div className="preview-card-header">
                <span className="live-badge">⚡ Real-Time Live Preview</span>
                <span className="state-badge">useState Active</span>
              </div>

              <div className="preview-field">
                <span className="field-label">From Name:</span>
                <span className="field-value">{formData.name || '(Awaiting name...)'}</span>
              </div>

              <div className="preview-field">
                <span className="field-label">Email Address:</span>
                <span className="field-value">{formData.email || '(Awaiting email...)'}</span>
              </div>

              <div className="preview-field">
                <span className="field-label">Subject:</span>
                <span className="field-value tag-pill">{formData.subject}</span>
              </div>

              <div className="preview-field message-field">
                <span className="field-label">Message Content:</span>
                <div className="preview-message-box">
                  {formData.message ? formData.message : '(Type in the form to watch text update here live)'}
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
