/**
 * Pagination Utilities
 * Provides standardized pagination for API endpoints
 */

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string; // For cursor-based pagination
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/**
 * Default pagination limits
 */
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePaginationParams(query: any): {
  limit: number;
  offset: number;
  cursor?: string;
} {
  let limit = parseInt(query.limit) || DEFAULT_PAGE_LIMIT;
  let offset = parseInt(query.offset) || 0;
  const cursor = query.cursor as string | undefined;

  // Validate and clamp limit
  if (limit < 1) {
    limit = DEFAULT_PAGE_LIMIT;
  }
  if (limit > MAX_PAGE_LIMIT) {
    limit = MAX_PAGE_LIMIT;
  }

  // Validate offset
  if (offset < 0) {
    offset = 0;
  }

  return { limit, offset, cursor };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  nextCursor?: string
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
      ...(nextCursor && { nextCursor }),
    },
  };
}

/**
 * Generate cursor for cursor-based pagination
 * Cursor is a base64-encoded ID of the last item
 */
export function generateCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

/**
 * Parse cursor to get the ID
 */
export function parseCursor(cursor: string): string | null {
  try {
    return Buffer.from(cursor, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}
