import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import RepoList from '../components/RepoList';

/**
 * Projects Page Component
 * Dynamically fetches and displays GitHub repositories using REST API.
 */
function Projects() {
  // 3 state variables for data, loading, and error
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch data on mount
  useEffect(() => {
    fetch('https://api.github.com/users/octocat/repos')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch repositories (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          throw new Error(data.message || 'Invalid response format received from GitHub API');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Conditionally render based on state
  if (loading) return <Spinner message="Loading GitHub Repositories..." />;
  if (error) return <ErrorMessage message={error} />;

  // Render successful state with RepoList mapping over repos
  return (
    <div className="page-wrapper">
      <section className="section-card">
        <h2 className="section-title">
          <span className="title-icon">🚀</span> GitHub Repositories
        </h2>
        <RepoList data={repos} />
      </section>
    </div>
  );
}

export default Projects;
