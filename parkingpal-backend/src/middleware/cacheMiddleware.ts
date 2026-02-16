import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { generateCacheKey } from '../utils/cache';

interface CachedResponse {
  body: any;
  contentType?: string;
}

/**
 * Cache middleware factory
 *
 * Creates an Express middleware that caches responses using the provided cache instance
 * Works with both res.json() and res.send() responses
 *
 * @param cache - NodeCache instance to use
 * @param keyPrefix - Prefix for cache keys (e.g., 'legal:terms')
 * @param includeQueryParams - Whether to include query parameters in cache key
 */
export function cacheMiddleware(
  cache: NodeCache,
  keyPrefix: string,
  includeQueryParams: boolean = false
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate cache key
    const cacheKey = includeQueryParams
      ? generateCacheKey(keyPrefix, req.query as Record<string, any>)
      : keyPrefix;

    // Try to get cached response
    const cachedResponse = cache.get<CachedResponse>(cacheKey);

    if (cachedResponse !== undefined) {
      // Cache hit - return cached response with original content type
      if (cachedResponse.contentType) {
        res.type(cachedResponse.contentType);
      }
      return res.send(cachedResponse.body);
    }

    // Cache miss - intercept res.send and res.json to cache the response
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    res.send = function (body: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          body,
          contentType: res.get('Content-Type'),
        });
      }
      return originalSend(body);
    };

    res.json = function (body: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          body,
          contentType: 'application/json',
        });
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 *
 * Use this middleware on POST/PUT/DELETE routes to invalidate related cache entries
 *
 * @param cache - Cache instance to invalidate from
 * @param pattern - Pattern to match keys for deletion (uses cache.keys() and filters)
 */
export function invalidateCacheMiddleware(cache: NodeCache, pattern: string) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(pattern));

    if (keysToDelete.length > 0) {
      cache.del(keysToDelete);
    }

    next();
  };
}
