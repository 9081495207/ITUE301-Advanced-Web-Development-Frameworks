import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import RepoList from '../components/RepoList';

/**
 * Projects Page Component
 * Dynamically fetches and displays GitHub repositories using REST API.
 * Features username controls, test error simulation, real-time search filtering, and retry fetch capabilities.
 */
function Projects() {
  const [username, setUsername] = useState('octocat');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch GitHub repositories with retry support
  const fetchRepos = (targetUser = username) => {
    setLoading(true);
    setError(null);
    const apiTarget = targetUser === 'INVALID_TEST_USER' 
      ? 'https://api.github.com/users/invalid_user_xyz_99999_test/repos'
      : `https://api.github.com/users/${targetUser}/repos`;

    fetch(apiTarget)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch repositories for '${targetUser}' (Status: ${res.status})`);
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
  };

  // useEffect hook to fetch data on initial component mount
  useEffect(() => {
    fetchRepos('octocat');
  }, []);

  // Trigger error simulation to easily test ErrorMessage & Retry button
  const handleSimulateError = () => {
    setUsername('INVALID_TEST_USER');
    fetchRepos('INVALID_TEST_USER');
  };

  // Handle manual retry action
  const handleRetry = () => {
    const activeUser = username === 'INVALID_TEST_USER' ? 'octocat' : username;
    setUsername(activeUser);
    fetchRepos(activeUser);
  };

  // Filter repositories dynamically by name based on searchQuery
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Conditionally render loading state
  if (loading) return <Spinner message="Loading GitHub Repositories..." />;

  // Conditionally render error state with Retry button
  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  // Render successful state with search bar and filtered RepoList
  return (
    <div className="page-wrapper">
      <section className="section-card">
        <h2 className="section-title">
          <span className="title-icon">🚀</span> GitHub Repositories
        </h2>

        {/* Account & Test Error Controls */}
        <div className="repo-controls">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username (e.g. octocat)..."
            className="username-input"
          />
          <button onClick={() => fetchRepos(username)} className="fetch-btn">
            📥 Fetch Repos
          </button>
          <button onClick={handleSimulateError} className="retry-btn" style={{ background: '#f59e0b', color: '#000' }}>
            ⚠️ Test Error & Retry Button
          </button>
        </div>

        {/* Real-Time Search Filter Bar */}
        <div className="repo-search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search repositories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="repo-search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✖
              </button>
            )}
          </div>
          <span className="repo-count-badge">
            Showing {filteredRepos.length} of {repos.length} repositories
          </span>
        </div>

        <RepoList data={filteredRepos} searchQuery={searchQuery} />
      </section>
    </div>
  );
}

export default Projects;
