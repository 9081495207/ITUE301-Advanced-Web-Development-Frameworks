import React from 'react';

/**
 * RepoList Component
 * Renders the fetched list of GitHub repositories with name, URL, description, stars, and details.
 */
function RepoList({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-repos">
        <p>No public repositories found for this account.</p>
      </div>
    );
  }

  return (
    <div className="repo-grid">
      {data.map((repo) => (
        <div key={repo.id || repo.name} className="repo-card">
          <div className="repo-card-header">
            <h3 className="repo-name">
              <span className="repo-icon">📦</span> {repo.name}
            </h3>
            {repo.private ? (
              <span className="repo-badge private">Private</span>
            ) : (
              <span className="repo-badge public">Public</span>
            )}
          </div>

          <p className="repo-description">
            {repo.description || 'No description provided for this repository.'}
          </p>

          <div className="repo-meta">
            {repo.language && (
              <span className="repo-meta-item">
                <span className="language-dot"></span> {repo.language}
              </span>
            )}
            {repo.stargazers_count !== undefined && (
              <span className="repo-meta-item">⭐ {repo.stargazers_count}</span>
            )}
            {repo.forks_count !== undefined && (
              <span className="repo-meta-item">🍴 {repo.forks_count}</span>
            )}
          </div>

          <div className="repo-actions">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link primary"
            >
              🔗 View Repository ({repo.html_url})
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RepoList;
