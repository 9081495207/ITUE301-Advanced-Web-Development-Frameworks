import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoadingFallback from './components/LoadingFallback';
import { lazyWithMinDelay } from './utils/lazyWithMinDelay';

// Practical 8: Route-Based Code Splitting with React.lazy() & Minimum Delay Fallback (Supplementary #2)
const Home = lazyWithMinDelay(() => import('./pages/Home'), 300);
const Projects = lazyWithMinDelay(() => import('./pages/Projects'), 300);
const TaskManager = lazyWithMinDelay(() => import('./pages/TaskManager'), 300);
const Contact = lazyWithMinDelay(() => import('./pages/Contact'), 300);
const NotFound = lazyWithMinDelay(() => import('./pages/NotFound'), 300);

/**
 * Main App Component (Practical 8 Optimized)
 * Uses React.lazy() and Suspense for route-based code splitting
 * Reduces main bundle size and loads route chunks on demand.
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
          <Suspense fallback={<LoadingFallback />}>
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
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/contact" element={<Contact contactData={contactData} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer contactData={contactData} />
      </div>
    </Router>
  );
}

export default App;
