import React, { useState } from 'react';

/**
 * High-Performance Modern Analytics & Performance Chart Component
 * Showcases route code-splitting, lazy chunking, and bundle size reduction.
 */
function AnalyticsChart() {
  const [selectedMetric, setSelectedMetric] = useState('bundle');
  const [hoveredItem, setHoveredItem] = useState(null);

  // Simulated performance metrics dataset
  const metricsData = {
    bundle: {
      unit: 'KB',
      title: 'Bundle Size Impact',
      subtitle: 'JavaScript payload size across development phases',
      target: 300,
      baseline: 840,
      optimized: 210,
      data: [
        { phase: 'P1', val: 480, label: 'Unoptimized Monolith', details: 'Initial single bundle architecture' },
        { phase: 'P2', val: 520, label: 'Single Bundle', details: 'Added router & shared state manager' },
        { phase: 'P3', val: 590, label: 'API Integration', details: 'Axios & REST clients compiled in root' },
        { phase: 'P4', val: 650, label: 'Express Backend', details: 'Full stack utility libraries attached' },
        { phase: 'P5', val: 710, label: 'Database Schemas', details: 'Validation & ORM helper utilities' },
        { phase: 'P6', val: 780, label: 'Full-Stack Integration', details: 'Comprehensive features enabled' },
        { phase: 'P7', val: 840, label: 'JWT Auth Pipeline', details: 'Peak payload before optimization' },
        { phase: 'P8', val: 210, label: 'Lazy Chunked (Optimized)', details: 'Code-split via React.lazy() & dynamic import', isOptimized: true },
      ]
    },
    loadTime: {
      unit: 'ms',
      title: 'Initial Load Time',
      subtitle: 'Time to Interactive (TTI) measured on simulated Fast 3G',
      target: 800,
      baseline: 2100,
      optimized: 420,
      data: [
        { phase: 'P1', val: 1200, label: '1.20s TTI', details: 'Synchronous script evaluation' },
        { phase: 'P2', val: 1350, label: '1.35s TTI', details: 'Large parse & execute overhead' },
        { phase: 'P3', val: 1500, label: '1.50s TTI', details: 'Blocking main loop initialization' },
        { phase: 'P4', val: 1650, label: '1.65s TTI', details: 'Heavy main bundle download delay' },
        { phase: 'P5', val: 1800, label: '1.80s TTI', details: 'Increased DOM hydration time' },
        { phase: 'P6', val: 1950, label: '1.95s TTI', details: 'Slow network bottlenecking' },
        { phase: 'P7', val: 2100, label: '2.10s TTI', details: 'Unoptimized entry bundle limit' },
        { phase: 'P8', val: 420, label: '0.42s TTI (Optimized)', details: 'Instant entry chunk + parallel lazy load', isOptimized: true },
      ]
    },
    memory: {
      unit: 'MB',
      title: 'Heap Memory Allocation',
      subtitle: 'V8 engine JavaScript heap usage during initial render',
      target: 25,
      baseline: 68,
      optimized: 18,
      data: [
        { phase: 'P1', val: 32, label: '32 MB Heap', details: 'Standard baseline heap usage' },
        { phase: 'P2', val: 38, label: '38 MB Heap', details: 'Component tree mounting memory' },
        { phase: 'P3', val: 44, label: '44 MB Heap', details: 'State cache allocation' },
        { phase: 'P4', val: 52, label: '52 MB Heap', details: 'Heavy chart library object graph' },
        { phase: 'P5', val: 59, label: '59 MB Heap', details: 'Unused component instantiation' },
        { phase: 'P6', val: 64, label: '64 MB Heap', details: 'Memory footprint peak pre-split' },
        { phase: 'P7', val: 68, label: '68 MB Heap', details: 'Maximum retained heap memory' },
        { phase: 'P8', val: 18, label: '18 MB Heap (Optimized)', details: 'Deferred component memory footprint', isOptimized: true },
      ]
    }
  };

  const currentConfig = metricsData[selectedMetric];
  const activeData = currentConfig.data;
  const maxVal = Math.max(...activeData.map((d) => d.val)) * 1.15;

  // Grid lines values
  const gridTicks = [1, 0.75, 0.5, 0.25, 0].map(ratio => Math.round(maxVal * ratio));

  const activeHover = hoveredItem !== null ? activeData[hoveredItem] : null;

  return (
    <div
      className="analytics-dashboard-card"
      style={{
        marginTop: '24px',
        marginBottom: '32px',
        padding: '28px',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.75))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.15)',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top glowing ambient accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #10b981)'
        }}
      />

      {/* Card Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                fontSize: '18px'
              }}
            >
              📈
            </span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Application Performance & Bundle Analytics
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            {currentConfig.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            gap: '4px'
          }}
        >
          <button
            onClick={() => { setSelectedMetric('bundle'); setHoveredItem(null); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: selectedMetric === 'bundle'
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'transparent',
              color: selectedMetric === 'bundle' ? '#ffffff' : '#94a3b8',
              boxShadow: selectedMetric === 'bundle' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            📦 Bundle Size
          </button>
          <button
            onClick={() => { setSelectedMetric('loadTime'); setHoveredItem(null); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: selectedMetric === 'loadTime'
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'transparent',
              color: selectedMetric === 'loadTime' ? '#ffffff' : '#94a3b8',
              boxShadow: selectedMetric === 'loadTime' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            ⚡ Load Speed
          </button>
          <button
            onClick={() => { setSelectedMetric('memory'); setHoveredItem(null); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: selectedMetric === 'memory'
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'transparent',
              color: selectedMetric === 'memory' ? '#ffffff' : '#94a3b8',
              boxShadow: selectedMetric === 'memory' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            🧠 Memory Heap
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* KPI 1 */}
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Unoptimized Peak</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {currentConfig.baseline} {currentConfig.unit}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>P7 Monolith Build</div>
        </div>

        {/* KPI 2 */}
        <div
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Optimized Current</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentConfig.optimized} {currentConfig.unit}
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontWeight: 700
              }}
            >
              -{Math.round(((currentConfig.baseline - currentConfig.optimized) / currentConfig.baseline) * 100)}%
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>P8 Lazy Chunked</div>
        </div>

        {/* KPI 3 */}
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Optimization Strategy</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#6366f1', marginTop: '6px' }}>
            React.lazy() Code-Split
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>On-Demand Module Chunking</div>
        </div>
      </div>

      {/* Dynamic Hover Details Bar / Tooltip Banner */}
      <div
        style={{
          minHeight: '44px',
          padding: '10px 16px',
          background: activeHover ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
          border: activeHover ? '1px solid rgba(99, 102, 241, 0.35)' : '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        {activeHover ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: activeHover.isOptimized ? '#10b981' : '#6366f1',
                  color: '#ffffff'
                }}
              >
                Phase {activeHover.phase}
              </span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>
                {activeHover.label}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>— {activeHover.details}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: activeHover.isOptimized ? '#34d399' : '#818cf8' }}>
              {activeHover.val} {currentConfig.unit}
            </div>
          </>
        ) : (
          <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
            💡 Hover over any bar below to view detailed breakdown and architectural release metrics.
          </div>
        )}
      </div>

      {/* Graph Visual Canvas */}
      <div
        style={{
          position: 'relative',
          height: '240px',
          padding: '20px 16px 30px 48px',
          background: 'rgba(10, 15, 30, 0.5)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Y-Axis Grid Lines & Labels */}
        <div style={{ position: 'absolute', top: '20px', bottom: '30px', left: 0, right: 0, pointerEvents: 'none' }}>
          {gridTicks.map((tickVal, i) => {
            const topPct = (i / (gridTicks.length - 1)) * 100;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ position: 'absolute', left: '8px', fontSize: '10px', fontWeight: 600, color: '#64748b', transform: 'translateY(-50%)' }}>
                  {tickVal}
                </span>
                <div style={{ marginLeft: '44px', width: '100%', borderTop: i === gridTicks.length - 1 ? '1px solid rgba(255, 255, 255, 0.15)' : '1px dashed rgba(255, 255, 255, 0.06)' }} />
              </div>
            );
          })}
        </div>

        {/* Target Threshold Reference Line */}
        <div
          style={{
            position: 'absolute',
            bottom: `${(currentConfig.target / maxVal) * 100}%`,
            left: '44px',
            right: 0,
            borderTop: '1px dashed rgba(16, 185, 129, 0.5)',
            zIndex: 1,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '12px'
          }}
        >
          <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(15, 23, 42, 0.8)', padding: '0 6px', borderRadius: '4px', transform: 'translateY(-50%)', fontWeight: 600 }}>
            Target Baseline ≤ {currentConfig.target} {currentConfig.unit}
          </span>
        </div>

        {/* Bar Series */}
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '16px', zIndex: 2, position: 'relative' }}>
          {activeData.map((item, idx) => {
            const isOptimized = !!item.isOptimized;
            const isHovered = hoveredItem === idx;
            const heightPct = (item.val / maxVal) * 100;

            return (
              <div
                key={item.phase}
                onMouseEnter={() => setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
              >
                {/* Floating Value Pill */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '6px',
                    transition: 'all 0.2s ease',
                    background: isOptimized
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isHovered
                      ? 'rgba(99, 102, 241, 0.3)'
                      : 'transparent',
                    color: isOptimized ? '#34d399' : isHovered ? '#ffffff' : '#94a3b8',
                    transform: isHovered ? 'translateY(-2px)' : 'none'
                  }}
                >
                  {item.val}
                </div>

                {/* Animated Vertical Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: isOptimized
                      ? 'linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)'
                      : isHovered
                      ? 'linear-gradient(180deg, #818cf8 0%, #6366f1 50%, #4338ca 100%)'
                      : 'linear-gradient(180deg, rgba(99, 102, 241, 0.7) 0%, rgba(79, 70, 229, 0.5) 100%)',
                    borderRadius: '8px 8px 3px 3px',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'scaleY(1.03) translateY(-4px)' : 'none',
                    boxShadow: isOptimized
                      ? '0 0 20px rgba(16, 185, 129, 0.5), 0 0 10px rgba(16, 185, 129, 0.3)'
                      : isHovered
                      ? '0 0 16px rgba(99, 102, 241, 0.5)'
                      : 'none',
                    border: isOptimized
                      ? '1px solid rgba(52, 211, 153, 0.6)'
                      : isHovered
                      ? '1px solid rgba(165, 180, 252, 0.8)'
                      : '1px solid rgba(99, 102, 241, 0.2)',
                    position: 'relative'
                  }}
                >
                  {/* Glass Shine overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '35%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                      borderRadius: '7px 7px 0 0',
                      pointerEvents: 'none'
                    }}
                  />
                </div>

                {/* X-Axis Label */}
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '11.5px',
                    fontWeight: isOptimized || isHovered ? 700 : 500,
                    color: isOptimized ? '#34d399' : isHovered ? '#ffffff' : '#64748b',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.phase}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Optimization Badges & Feature Summary */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: '#94a3b8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <strong style={{ color: '#f1f5f9' }}>Lazy Chunking Active</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
            Baseline Monolith
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
            ⚡ Code Splitting via <code>React.lazy()</code>
          </span>
          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
            🚀 -60% Initial Payload
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AnalyticsChart);
