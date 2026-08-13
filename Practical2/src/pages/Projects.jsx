import React, { useState } from 'react';

/**
 * Practical 2: Interactive Projects Page Component
 * Renders completed projects with interactive category filtering using useState.
 */
function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');

  const projects = [
    {
      id: 1,
      title: 'AI Healthcare Management System',
      category: 'AI & Healthcare',
      description:
        'An intelligent healthcare platform leveraging AI for automated patient diagnostics, appointment scheduling, digital medical record management, and health risk assessment.',
      tags: ['React', 'Node.js', 'Python', 'Machine Learning', 'Tailwind CSS', 'MongoDB'],
      github: 'github.com/jainamkamani/ai-healthcare-management',
      live: 'ai-healthcare.vercel.app',
      featured: true,
    },
    {
      id: 2,
      title: 'MarketLens: Unified Market Screener & Risk Analyzer',
      category: 'FinTech & Analytics',
      description:
        'A unified financial market screening and risk analysis dashboard that evaluates stock metrics, algorithmic risk indicators, portfolio volatility, and real-time data visualization.',
      tags: ['React.js', 'Vite', 'Python / FastAPI', 'Financial APIs', 'Chart.js', 'PostgreSQL'],
      github: 'github.com/jainamkamani/marketlens-screener',
      live: 'marketlens.vercel.app',
      featured: true,
    },
  ];

  const categories = ['All', 'AI & Healthcare', 'FinTech & Analytics'];

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div className="page-wrapper">
      <section className="section-card">
        <h2 className="section-title">
          <span className="title-icon">🚀</span> My Featured Projects
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Explore my completed software projects in AI Healthcare and Financial Analytics.
        </p>

        {/* Filter buttons using useState */}
        <div className="filter-container">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <span className="project-category">{project.category}</span>
                {project.featured && <span className="featured-badge">★ Featured Project</span>}
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>

              <div className="project-tags">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="project-links">
                {project.github && (
                  <a
                    href={`https://${project.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    💻 Code Repository
                  </a>
                )}
                {project.live && (
                  <a
                    href={`https://${project.live}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link primary"
                  >
                    🌐 Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Projects;
