const NodeCache = require('node-cache');

// Step 2 from Lab Session Step-by-Step:
// Initialize a cache instance in a shared module with default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Extended Cache Manager with Hit/Miss Metrics Tracking (Supplementary Problem)
let cacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
  deletions: 0
};

/**
 * Custom get method wrapping node-cache get to track hit/miss statistics
 * @param {string} key
 * @returns {any}
 */
const getFromCache = (key) => {
  const value = cache.get(key);
  if (value !== undefined) {
    cacheStats.hits++;
  } else {
    cacheStats.misses++;
  }
  return value;
};

/**
 * Custom set method wrapping node-cache set
 * @param {string} key
 * @param {any} value
 * @param {number} [ttl]
 */
const setToCache = (key, value, ttl) => {
  cacheStats.writes++;
  if (ttl !== undefined) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
};

/**
 * Custom del method wrapping node-cache del
 * @param {string|string[]} keys
 */
const deleteFromCache = (keys) => {
  cacheStats.deletions++;
  return cache.del(keys);
};

/**
 * Flush all cache entries
 */
const flushCache = () => {
  cache.flushAll();
};

/**
 * Get cache metrics and health information
 */
const getCacheMetrics = () => {
  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRate = totalRequests > 0 ? ((cacheStats.hits / totalRequests) * 100).toFixed(2) + '%' : '0.00%';
  
  return {
    stdTTL: cache.options.stdTTL,
    keysCount: cache.keys().length,
    keys: cache.keys(),
    stats: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      totalRequests,
      hitRate,
      writes: cacheStats.writes,
      deletions: cacheStats.deletions
    },
    nodeCacheStats: cache.getStats()
  };
};

/**
 * Reset metric counters
 */
const resetCacheMetrics = () => {
  cacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    deletions: 0
  };
};

module.exports = {
  cache,
  getFromCache,
  setToCache,
  deleteFromCache,
  flushCache,
  getCacheMetrics,
  resetCacheMetrics
};
