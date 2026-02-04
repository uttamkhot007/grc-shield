/**
 * In-Memory Cache Layer for High-Performance Data Access
 * 
 * Implements a multi-tier caching strategy:
 * - L1: In-memory LRU cache for ultra-fast access
 * - TTL-based expiration for data freshness
 * - Tenant-aware cache keys for multi-tenancy isolation
 * - Statistics tracking for monitoring
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private stats: CacheStats;

  constructor(maxSize: number = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, evictions: 0 };
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // LRU: Move to end (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);
    this.stats.hits++;
    
    return entry.value;
  }

  set(key: string, value: T, ttlSeconds: number = 300): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      hits: 0,
    });
    this.stats.sets++;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  // Delete all keys matching a pattern (for cache invalidation)
  deletePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    const keys = Array.from(this.cache.keys());
    
    for (let i = 0; i < keys.length; i++) {
      if (regex.test(keys[i])) {
        this.cache.delete(keys[i]);
        count++;
      }
    }
    
    this.stats.deletes += count;
    return count;
  }

  // Clear all entries for a tenant
  clearTenant(tenantId: string): number {
    return this.deletePattern(`^tenant:${tenantId}:`);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats & { size: number; maxSize: number; hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + "%" : "N/A";
    
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
    };
  }

  // Cleanup expired entries (run periodically)
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    const entries = Array.from(this.cache.entries());
    
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  // Short-lived (30s-1m) - frequently changing data
  USER_SESSION: 60,
  ACTIVITY_LOG: 30,
  
  // Medium-lived (5-15m) - moderately changing data
  DASHBOARD_STATS: 300,
  TENANT_CONFIG: 300,
  USER_PERMISSIONS: 300,
  
  // Long-lived (30m-1h) - rarely changing data
  FRAMEWORKS: 1800,
  POLICIES: 1800,
  CONTROLS_CATALOG: 1800,
  RISK_CATALOG: 1800,
  
  // Very long-lived (2h+) - static reference data
  REGIONS: 7200,
  INDUSTRIES: 7200,
  STATIC_CONFIG: 7200,
} as const;

// Cache key builders for consistency
export const cacheKeys = {
  // Tenant-scoped keys
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  tenantConfig: (tenantId: string) => `tenant:${tenantId}:config`,
  tenantUsers: (tenantId: string, page?: number) => 
    page ? `tenant:${tenantId}:users:page:${page}` : `tenant:${tenantId}:users`,
  tenantRisks: (tenantId: string, page?: number) => 
    page ? `tenant:${tenantId}:risks:page:${page}` : `tenant:${tenantId}:risks`,
  tenantPolicies: (tenantId: string, page?: number) => 
    page ? `tenant:${tenantId}:policies:page:${page}` : `tenant:${tenantId}:policies`,
  tenantControls: (tenantId: string, page?: number) => 
    page ? `tenant:${tenantId}:controls:page:${page}` : `tenant:${tenantId}:controls`,
  tenantVendors: (tenantId: string) => `tenant:${tenantId}:vendors`,
  tenantFrameworks: (tenantId: string) => `tenant:${tenantId}:frameworks`,
  tenantDashboard: (tenantId: string) => `tenant:${tenantId}:dashboard`,
  
  // User-scoped keys
  user: (userId: string) => `user:${userId}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  userSession: (sessionId: string) => `session:${sessionId}`,
  
  // Global keys (not tenant-specific)
  frameworks: () => "global:frameworks",
  frameworkById: (id: string) => `global:framework:${id}`,
  controlsCatalog: (page?: number) => 
    page ? `global:controls:page:${page}` : "global:controls",
  riskCatalog: () => "global:risk-catalog",
  regions: () => "global:regions",
  industries: () => "global:industries",
  
  // Stats and metrics
  globalStats: () => "global:stats",
  tenantStats: (tenantId: string) => `tenant:${tenantId}:stats`,
};

// Singleton cache instances
export const dataCache = new LRUCache<any>(10000);  // General data cache
export const queryCache = new LRUCache<any>(5000);  // Query result cache
export const sessionCache = new LRUCache<any>(20000); // Session/auth cache

// Start periodic cleanup
setInterval(() => {
  dataCache.cleanup();
  queryCache.cleanup();
  sessionCache.cleanup();
}, 60000); // Every minute

// Cache wrapper function for easy caching
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.DASHBOARD_STATS
): Promise<T> {
  // Try cache first
  const cached = dataCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch and cache
  const result = await fetcher();
  dataCache.set(key, result, ttlSeconds);
  return result;
}

// Get all cache statistics
export function getAllCacheStats() {
  return {
    data: dataCache.getStats(),
    query: queryCache.getStats(),
    session: sessionCache.getStats(),
  };
}
