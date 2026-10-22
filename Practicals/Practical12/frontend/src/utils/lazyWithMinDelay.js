import { lazy } from 'react';

/**
 * Lazy loading helper with a configurable minimum delay.
 * Prevents flickering of loading fallback states on fast network connections.
 * 
 * @param {Function} importFn - Dynamic import function, e.g. () => import('./pages/Projects')
 * @param {number} minDelayMs - Minimum duration to show fallback in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithMinDelay(importFn, minDelayMs = 300) {
  return lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelayMs))
    ]).then(([moduleExports]) => moduleExports)
  );
}

export default lazyWithMinDelay;
