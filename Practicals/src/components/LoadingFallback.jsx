import React from 'react';

/**
 * LoadingFallback Component
 * Displayed inside React Suspense boundary during route chunk loading.
 */
function LoadingFallback({ pageName = 'Page' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          border: '4px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: '#6366f1',
          borderRightColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '20px'
        }}
      />
      
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
        Loading {pageName}...
      </h3>
      
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', maxWidth: '360px' }}>
        Fetching code-split JavaScript chunk using <code>React.lazy()</code> &amp; <code>Suspense</code>...
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default React.memo(LoadingFallback);
