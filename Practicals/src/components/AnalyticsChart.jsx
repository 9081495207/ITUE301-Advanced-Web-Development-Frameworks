import React, { useState } from 'react';

/**
 * Heavy Third-Party Style Analytics & Performance Chart Component
 * Practical 8 - Supplementary Problem #1: Code-split heavy component loaded lazily on demand.
 */
function AnalyticsChart() {
  const [selectedMetric, setSelectedMetric] = useState('bundle');

  // Simulated heavy dataset
  const metricsData = {
    bundle: [
      { month: 'P1', size: 480, label: 'Unoptimized Monolith' },
      { month: 'P2', size: 520, label: 'Single Bundle' },
      { month: 'P3', size: 590, label: 'API Added' },
      { month: 'P4', size: 650, label: 'Express Backend' },
      { month: 'P5', size: 710, label: 'Mongoose Added' },
      { month: 'P6', size: 780, label: 'Full-Stack Integration' },
      { month: 'P7', size: 840, label: 'JWT Auth Pipeline' },
      { month: 'P8 (Optimized)', size: 210, label: 'Lazy Chunked (60% ↓)' },
    ],
    loadTime: [
      { month: 'P1', size: 1200, label: '1.2s' },
      { month: 'P2', size: 1350, label: '1.35s' },
      { month: 'P3', size: 1500, label: '1.5s' },
      { month: 'P4', size: 1650, label: '1.65s' },
      { month: 'P5', size: 1800, label: '1.8s' },
      { month: 'P6', size: 1950, label: '1.95s' },
      { month: 'P7', size: 2100, label: '2.1s' },
      { month: 'P8 (Optimized)', size: 420, label: '0.42s (Fast 3G)' },
    ]
  };

  const activeData = metricsData[selectedMetric];

  return (
    <div
      className="section-card"
      style={{
        marginTop: '28px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.6))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            📊 Application Performance Analytics (Heavy Component Chunk)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Supplementary #1: Code-split heavy component loaded lazily only when clicked/requested.
          </p>
        </div>

        <div className="filter-bar">
          <button
            className={`filter-btn ${selectedMetric === 'bundle' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('bundle')}
          >
            📦 Bundle Size (KB)
          </button>
          <button
            className={`filter-btn ${selectedMetric === 'loadTime' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('loadTime')}
          >
            ⚡ Initial Load Time (ms)
          </button>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 10px 10px 10px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        {activeData.map((item, idx) => {
          const isOptimized = idx === activeData.length - 1;
          const maxVal = Math.max(...activeData.map((d) => d.size));
          const heightPct = (item.size / maxVal) * 100;

          return (
            <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: isOptimized ? '#10b981' : 'var(--text-secondary)', marginBottom: '6px' }}>
                {selectedMetric === 'bundle' ? `${item.size} KB` : `${item.size} ms`}
              </div>
              <div
                style={{
                  width: '100%',
                  maxHeight: '140px',
                  height: `${heightPct}%`,
                  background: isOptimized
                    ? 'linear-gradient(180deg, #10b981, #059669)'
                    : 'linear-gradient(180deg, #6366f1, #4f46e5)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease-out',
                  boxShadow: isOptimized ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              />
              <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: isOptimized ? 700 : 500, color: isOptimized ? '#10b981' : 'var(--text-muted)' }}>
                {item.month}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span>🎯 Chunk optimization reducing initial JS payload by over <strong>60%</strong></span>
        <span>⚡ Lazy-loaded via <code>React.lazy()</code></span>
      </div>
    </div>
  );
}

export default React.memo(AnalyticsChart);
