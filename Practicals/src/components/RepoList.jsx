import React from 'react';

// GitHub Language Color Map
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  Vue: '#41b883',
  Swift: '#F05138'
};

/**
 * Modern RepoList Component
 * Renders an elevated, responsive grid of GitHub repositories
 * featuring language colors, stars badges, fork counts, and links.
 */
function RepoList({ data, searchQuery = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className="preview-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
          {searchQuery ? `No repositories matching "${searchQuery}"` : 'No public repositories found'}
        </h4>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          {searchQuery ? 'Try searching for a different keyword or language filter.' : 'Enter a different GitHub username above to fetch repositories.'}
        </p>
      </div>
    );
  }

  return (
    <div className="repo-grid">
      {data.map((repo) => {
        const langColor = (repo.language && LANGUAGE_COLORS[repo.language]) || '#6366f1';
        const formattedDate = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

        return (
          <div key={repo.id || repo.name} className="repo-card">
            {/* Header: Title + Visibility Badge */}
            <div>
              <div className="repo-card-header">
                <h3 className="repo-name">
                  <span className="repo-icon">📦</span>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-title-link">
                    {repo.name}
                  </a>
                </h3>

                <span className={`repo-badge ${repo.private ? 'private' : 'public'}`}>
                  {repo.private ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>

              {/* Description */}
              <p className="repo-description">
                {repo.description || 'No description provided for this repository.'}
              </p>
            </div>

            {/* Repository Metadata & Footer */}
            <div>
              <div className="repo-meta">
                {repo.language && (
                  <span className="repo-meta-item" style={{ fontWeight: 600 }}>
                    <span className="language-dot" style={{ backgroundColor: langColor }}></span>
                    {repo.language}
                  </span>
                )}

                <span className="repo-stars-badge" title={`${repo.stargazers_count ?? 0} stars`}>
                  ⭐ {repo.stargazers_count ?? 0}
                </span>

                {repo.forks_count !== undefined && repo.forks_count > 0 && (
                  <span className="repo-meta-item" style={{ opacity: 0.85 }}>
                    🍴 {repo.forks_count}
                  </span>
                )}

                {formattedDate && (
                  <span className="repo-meta-item" style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    📅 {formattedDate}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="repo-actions">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fetch-btn"
                  style={{ width: '100%', textDecoration: 'none', fontSize: '13px', padding: '8px 14px' }}
                >
                  🔗 View Repository on GitHub
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RepoList;
