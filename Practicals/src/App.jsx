import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';

/**
 * Main App Component
 * Wraps layout in BrowserRouter, manages Light/Dark theme state,
 * and sets up multi-page routes:
 * "/" -> Home
 * "/projects" -> Projects
 * "/contact" -> Contact
 * "*" -> NotFound (404 Error Page)
 */
function App() {
  // Theme state management (Light & Dark mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const studentInfo = {
    name: 'Jainam Kamani',
    role: 'Information Technology Student & Web Developer',
    university: 'Charotar University of Science and Technology (CHARUSAT)',
    degree: 'B.Tech Information Technology',
    statusTag: 'Open for IT & Software Engineering Internships',
    avatar: '/profile.jpg',
  };

  const bioData = {
    title: 'About Me',
    bioText:
      'I am an Information Technology student at Charotar University of Science and Technology, originally from Junagadh, Gujarat. I am passionate about building modern, interactive web applications using technologies like React, JavaScript, and Vite, and constantly expanding my software development skills.',
    highlights: [
      { value: '7.7 / 10', label: 'Cumulative CGPA' },
      { value: '2', label: 'Projects Built' },
      { value: 'CHARUSAT', label: 'University' },
      { value: 'Junagadh', label: 'Hometown (Gujarat)' },
    ],
  };

  const skillsData = {
    title: 'Skills & Expertise',
    categories: [
      {
        categoryName: 'Frontend Development',
        items: ['React.js', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Vite', 'Tailwind CSS', 'Bootstrap'],
      },
      {
        categoryName: 'Backend & Databases',
        items: ['Node.js', 'Express.js', 'RESTful APIs', 'SQL', 'MongoDB'],
      },
      {
        categoryName: 'Tools & Workflows',
        items: ['Git & GitHub', 'VS Code', 'Npm/Vite', 'Postman'],
      },
      {
        categoryName: 'Core Competencies',
        items: ['Web Development Frameworks', 'Data Structures', 'OOP', 'Responsive Web Design'],
      },
    ],
  };

  const contactData = {
    studentName: 'Jainam Kamani',
    email: 'jainamkamani95@gmail.com',
    github: 'github.com/jainamkamani',
    linkedin: 'linkedin.com/in/jainamkamani',
    location: 'Junagadh, Gujarat, India',
    copyrightYear: 2026,
  };

  return (
    <Router>
      <div className="portfolio-container">
        <NavBar theme={theme} toggleTheme={toggleTheme} />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  studentInfo={studentInfo}
                  bioData={bioData}
                  skillsData={skillsData}
                />
              }
            />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact contactData={contactData} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer contactData={contactData} />
      </div>
    </Router>
  );
}

export default App;
