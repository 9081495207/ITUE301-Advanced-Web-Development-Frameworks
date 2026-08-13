import React from 'react';

/**
 * About Component
 * Displays short biography text and key highlights/metrics.
 * Receives `bioData` object via props.
 */
function About({ bioData }) {
  const { title, bioText, highlights } = bioData || {};

  return (
    <section className="section-card">
      <h2 className="section-title">
        <span className="title-icon">✦</span> {title || 'About Me'}
      </h2>
      
      <div className="about-content">
        <p>
          {bioText ||
            'Passionate Computer Science student with a focus on modern web engineering, cloud-native applications, and human-centric software architecture. Constantly learning and building responsive, accessible, and high-performance applications.'}
        </p>

        {highlights && highlights.length > 0 && (
          <div className="about-highlights">
            {highlights.map((item, index) => (
              <div key={index} className="highlight-card">
                <div className="highlight-val">{item.value}</div>
                <div className="highlight-lbl">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default About;
