import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';

/**
 * Home Page Component
 * Renders student header, biography, academic coursework, and skills.
 */
function Home({ studentInfo, bioData, skillsData }) {
  const courses = [
    { code: 'IT301', name: 'Advanced Web Frameworks', grade: 'A+' },
    { code: 'IT305', name: 'Data Structures & Algorithms', grade: 'A' },
    { code: 'IT410', name: 'Software Engineering Principles', grade: 'A' },
    { code: 'IT425', name: 'Database Management Systems', grade: 'A-' },
  ];

  return (
    <div className="page-wrapper">
      <Header studentInfo={studentInfo} />
      <About bioData={bioData} />

      {/* Permanently displayed Academic Coursework Section */}
      <div className="section-card toggle-card">
        <h3 className="section-title">
          🎓 Academic Coursework & Honors
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
          Key Information Technology courses and academic achievements at CHARUSAT.
        </p>

        <div className="course-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-badge">
              {course.code} {course.name}- Grade {course.grade}
            </div>
          ))}
        </div>
      </div>

      <Skills skillsData={skillsData} />
    </div>
  );
}

export default Home;
