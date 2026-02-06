/**
 * Rate Limiting Middleware for API Protection
 * 
 * Implements a sliding window rate limiter with:
 * - Per-IP and per-user limits
 * - Configurable limits per endpoint
 * - Tenant-aware rate limiting
 * - Burst handling
 */

import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
  burstUsed: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  burstLimit?: number;   // Additional burst allowance
  keyGenerator?: (req: Request) => string;
  skipFailedRequests?: boolean;
  skip?: (req: Request) => boolean;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private readonly config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.limits = new Map();
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      burstLimit: config.burstLimit || 0,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipFailedRequests: config.skipFailedRequests || false,
      skip: config.skip || (() => false),
    };

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private defaultKeyGenerator(req: Request): string {
    // Combine IP + user ID for more granular limiting
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.limits.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Check if request should be skipped
      if (this.config.skip(req)) {
        return next();
      }

      const key = this.config.keyGenerator(req);
      const now = Date.now();
      
      let entry = this.limits.get(key);
      
      // Reset if window expired
      if (!entry || now > entry.resetAt) {
        entry = {
          count: 0,
          resetAt: now + this.config.windowMs,
          burstUsed: 0,
        };
        this.limits.set(key, entry);
      }

      const totalLimit = this.config.maxRequests + this.config.burstLimit;
      const remaining = totalLimit - entry.count;
      
      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", String(this.config.maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, remaining)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

      // Check if over limit
      if (entry.count >= totalLimit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        res.setHeader("Retry-After", String(retryAfter));
        
        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter,
        });
        return;
      }

      // Increment count
      entry.count++;
      
      // Track burst usage
      if (entry.count > this.config.maxRequests) {
        entry.burstUsed++;
      }

      next();
    };
  }

  // Get current usage for a key
  getUsage(key: string): { count: number; limit: number; remaining: number } | null {
    const entry = this.limits.get(key);
    if (!entry) return null;
    
    const limit = this.config.maxRequests + this.config.burstLimit;
    return {
      count: entry.count,
      limit,
      remaining: Math.max(0, limit - entry.count),
    };
  }

  // Reset a specific key (e.g., after successful CAPTCHA)
  reset(key: string): void {
    this.limits.delete(key);
  }
}

// Pre-configured rate limiters for different use cases

// Standard API rate limit: 100 requests per minute
export const standardLimiter = new RateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,
  burstLimit: 20,
});

// Strict rate limit for auth endpoints: 10 requests per minute
export const authLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  burstLimit: 5,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `auth:${ip}`;
  },
});

// AI/OpenAI rate limit: 20 requests per minute (expensive operations)
export const aiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  burstLimit: 5,
});

// Search/query rate limit: 50 requests per minute
export const searchLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 50,
  burstLimit: 10,
});

// Upload rate limit: 10 requests per minute
export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  burstLimit: 2,
});

// Export/report generation: 5 requests per minute
export const exportLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  burstLimit: 1,
});

// Tenant-aware rate limiter factory
export function createTenantRateLimiter(config: Omit<RateLimitConfig, "keyGenerator">) {
  return new RateLimiter({
    ...config,
    keyGenerator: (req) => {
      const tenantId = (req as any).user?.tenantId || "global";
      const userId = (req as any).user?.id || req.ip;
      return `tenant:${tenantId}:user:${userId}`;
    },
  });
}

// Rate limit statistics
export function getRateLimitStats() {
  return {
    standard: standardLimiter,
    auth: authLimiter,
    ai: aiLimiter,
    search: searchLimiter,
    upload: uploadLimiter,
    export: exportLimiter,
  };
}
