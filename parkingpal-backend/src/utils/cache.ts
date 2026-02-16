import NodeCache from 'node-cache';

/**
 * Cache Configuration
 *
 * Multiple cache instances with different TTLs for different use cases
 */

// Legal documents cache - 30 days
export const legalCache = new NodeCache({
  stdTTL: 30 * 24 * 60 * 60, // 30 days in seconds
  checkperiod: 24 * 60 * 60, // Check for expired keys every 24 hours
  useClones: false, // Don't clone data for better performance
});

// OAuth configuration cache - 1 hour
export const oauthCache = new NodeCache({
  stdTTL: 60 * 60, // 1 hour
  checkperiod: 10 * 60, // Check every 10 minutes
  useClones: false,
});

// Public spot data cache - 5 minutes
export const spotCache = new NodeCache({
  stdTTL: 5 * 60, // 5 minutes
  checkperiod: 60, // Check every minute
  useClones: false,
});

// Review data cache - 1 hour
export const reviewCache = new NodeCache({
  stdTTL: 60 * 60, // 1 hour
  checkperiod: 10 * 60,
  useClones: false,
});

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');

  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
}

/**
 * Cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    legal: legalCache.getStats(),
    oauth: oauthCache.getStats(),
    spot: spotCache.getStats(),
    review: reviewCache.getStats(),
  };
}

/**
 * Clear all caches (useful for testing or manual cache invalidation)
 */
export function clearAllCaches() {
  legalCache.flushAll();
  oauthCache.flushAll();
  spotCache.flushAll();
  reviewCache.flushAll();
}

/**
 * Clear specific cache by type
 */
export function clearCache(type: 'legal' | 'oauth' | 'spot' | 'review') {
  switch (type) {
    case 'legal':
      legalCache.flushAll();
      break;
    case 'oauth':
      oauthCache.flushAll();
      break;
    case 'spot':
      spotCache.flushAll();
      break;
    case 'review':
      reviewCache.flushAll();
      break;
  }
}
