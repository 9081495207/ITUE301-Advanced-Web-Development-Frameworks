import React from 'react';

/**
 * Skills Component
 * Displays structured technical and soft skills grouped into categories.
 * Receives `skillsData` object via props.
 */
function Skills({ skillsData }) {
  const { title, categories } = skillsData || {};

  return (
    <section className="section-card">
      <h2 className="section-title">
        <span className="title-icon">⚡</span> {title || 'Technical Skills'}
      </h2>

      <div className="skills-grid">
        {categories && categories.map((cat, index) => (
          <div key={index} className="skill-category">
            <div className="category-header">{cat.categoryName}</div>
            <div className="skill-tags">
              {cat.items.map((skill, skillIdx) => (
                <span key={skillIdx} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
