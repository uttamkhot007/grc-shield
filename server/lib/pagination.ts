/**
 * Pagination Utilities for Large Dataset Handling
 * 
 * Implements efficient pagination strategies:
 * - Offset-based pagination for simple use cases
 * - Cursor-based pagination for large datasets
 * - Consistent API response format
 */

import type { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 25,
  maxLimit: 100,
  defaultSortOrder: "desc" as const,
};

/**
 * Extract pagination parameters from request query
 */
export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION_DEFAULTS.page);
  const requestedLimit = parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.limit;
  const limit = Math.min(Math.max(1, requestedLimit), PAGINATION_DEFAULTS.maxLimit);
  const offset = (page - 1) * limit;
  
  const sortBy = req.query.sortBy as string | undefined;
  const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

  return { page, limit, offset, sortBy, sortOrder };
}

/**
 * Build paginated response with metadata
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

/**
 * Build cursor-based paginated response
 * More efficient for large datasets as it doesn't require counting total
 */
export function buildCursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  limit: number,
  cursorField: keyof T = "id"
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  
  const nextCursor = hasMore && items.length > 0 
    ? encodeURIComponent(String(items[items.length - 1][cursorField]))
    : null;

  return {
    data: items,
    pagination: {
      limit,
      nextCursor,
      prevCursor: null, // Can be implemented if needed
      hasMore,
    },
  };
}

/**
 * Decode cursor for cursor-based pagination
 */
export function decodeCursor(cursor: string | undefined): string | null {
  if (!cursor) return null;
  try {
    return decodeURIComponent(cursor);
  } catch {
    return null;
  }
}

/**
 * Build SQL LIMIT/OFFSET clause
 */
export function buildLimitOffset(params: PaginationParams): { limit: number; offset: number } {
  return {
    limit: params.limit,
    offset: params.offset,
  };
}

/**
 * Calculate pagination info from count query result
 */
export function calculatePaginationInfo(
  total: number,
  params: PaginationParams
): { totalPages: number; hasNext: boolean; hasPrev: boolean } {
  const totalPages = Math.ceil(total / params.limit);
  return {
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  };
}

/**
 * Validate and sanitize sort field against allowed fields
 */
export function validateSortField(
  field: string | undefined,
  allowedFields: string[],
  defaultField: string
): string {
  if (!field) return defaultField;
  return allowedFields.includes(field) ? field : defaultField;
}

/**
 * Build order by configuration for Drizzle
 */
export function buildOrderBy(
  params: PaginationParams,
  allowedFields: string[],
  defaultField: string
) {
  const field = validateSortField(params.sortBy, allowedFields, defaultField);
  return { field, order: params.sortOrder };
}
