import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import RepoList from '../components/RepoList';
import LoadingFallback from '../components/LoadingFallback';

// Supplementary Problem #1: Lazy-loaded heavy chart component
const AnalyticsChart = lazy(() => import('../components/AnalyticsChart'));

/**
 * Modern Projects Page Component
 * Dynamically fetches and displays GitHub repositories using REST API.
 * Features username controls, preset chips, language filters, sorting, search filtering, and analytics stats.
 */
function Projects() {
  const [username, setUsername] = useState('octocat');
  const [showChart, setShowChart] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('stars'); // 'stars', 'updated', 'name'

  // Preset GitHub Accounts for quick testing
  const presetUsers = ['octocat', 'facebook', 'vercel', 'gaearon', 'jainamkamani'];

  // Function to fetch GitHub repositories
  const fetchRepos = (targetUser = username) => {
    setLoading(true);
    setError(null);
    setSelectedLanguage('all');

    const apiTarget =
      targetUser === 'INVALID_TEST_USER'
        ? 'https://api.github.com/users/invalid_user_xyz_99999_test/repos'
        : `https://api.github.com/users/${targetUser}/repos?per_page=100`;

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

  // Trigger preset account click
  const handlePresetClick = (user) => {
    setUsername(user);
    fetchRepos(user);
  };

  // Trigger error simulation
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

  // Compute Repository Analytics
  const analytics = useMemo(() => {
    const total = repos.length;
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

    // Count languages
    const langCounts = {};
    repos.forEach((r) => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    // Find top language
    let topLang = 'N/A';
    let maxCount = 0;
    Object.entries(langCounts).forEach(([lang, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topLang = lang;
      }
    });

    return { total, totalStars, totalForks, topLang, langCounts };
  }, [repos]);

  // Compute Filtered and Sorted Repositories
  const processedRepos = useMemo(() => {
    let result = repos.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLang =
        selectedLanguage === 'all' ? true : repo.language === selectedLanguage;

      return matchesSearch && matchesLang;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      if (sortBy === 'updated') {
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  return (
    <div className="page-wrapper">
      <section className="section-card">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 className="section-title">
              <span className="title-icon">🚀</span> GitHub Repositories Explorer
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Explore real-time GitHub repositories, language metrics, and star analytics via GitHub REST API.
            </p>
          </div>
        </div>

        {/* Toolbar & Account Selector Card */}
        <div className="form-container" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                GitHub Username
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username..."
                  className="username-input"
                  style={{ flex: 1 }}
                />
                <button onClick={() => fetchRepos(username)} className="fetch-btn">
                  📥 Fetch Repos
                </button>
              </div>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button onClick={handleSimulateError} className="retry-btn" style={{ height: '42px' }}>
                ⚠️ Test Error & Retry
              </button>
            </div>
          </div>

          {/* Preset User Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Presets:</span>
            {presetUsers.map((user) => (
              <button
                key={user}
                onClick={() => handlePresetClick(user)}
                className={`filter-btn ${username === user ? 'active' : ''}`}
                style={{ padding: '3px 10px', fontSize: '12px' }}
              >
                @{user}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Stats Overview Bar */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon total">📦</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.total}</div>
              <div className="stat-label">Total Repositories</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⭐</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.totalStars}</div>
              <div className="stat-label">Total Stars</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">🍴</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.totalForks}</div>
              <div className="stat-label">Total Forks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon high">💻</div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {analytics.topLang}
              </div>
              <div className="stat-label">Top Language</div>
            </div>
          </div>
        </div>

        {/* Supplementary #1: Toggle Heavy Component Lazy Chunk */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <button
            onClick={() => setShowChart(!showChart)}
            className="fetch-btn"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              background: showChart
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            {showChart ? '📊 Hide Performance Analytics Chart' : '📊 Lazy-Load Heavy Analytics Chart'}
          </button>
        </div>

        {showChart && (
          <Suspense fallback={<LoadingFallback pageName="Heavy Analytics Chart Chunk" />}>
            <AnalyticsChart />
          </Suspense>
        )}

        {/* Search, Language Filter & Sort Controls */}
        <div className="live-preview-container" style={{ padding: '20px' }}>
          <div className="live-preview-header">
            {/* Search Input Bar */}
            <div className="search-input-wrapper" style={{ maxWidth: '380px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Filter repositories by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="repo-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="username-input"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="stars">⭐ Most Stars</option>
                <option value="updated">📅 Recently Updated</option>
                <option value="name">🔤 Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Language Filter Tabs */}
          {Object.keys(analytics.langCounts).length > 0 && (
            <div className="filter-bar" style={{ marginTop: '8px' }}>
              <button
                className={`filter-btn ${selectedLanguage === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedLanguage('all')}
              >
                All ({repos.length})
              </button>
              {Object.entries(analytics.langCounts).map(([lang, count]) => (
                <button
                  key={lang}
                  className={`filter-btn ${selectedLanguage === lang ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang} ({count})
                </button>
              ))}
            </div>
          )}

          {/* Conditionally Render Content */}
          {loading ? (
            <Spinner message={`Fetching repositories for '@${username}' from GitHub API...`} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : (
            <RepoList data={processedRepos} searchQuery={searchQuery} />
          )}
        </div>
      </section>
    </div>
  );
}

export default Projects;
