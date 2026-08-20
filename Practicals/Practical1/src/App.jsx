import React from 'react';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';

/**
 * Practical 1: Core Component Architecture
 * Renders Header, About, Skills, and Footer components in a single portfolio layout.
 */
function App() {
  return (
    <div className="portfolio-container">
      <Header />
      <main>
        <About />
        <Skills />
      </main>
      <Footer />
    </div>
  );
}

export default App;
