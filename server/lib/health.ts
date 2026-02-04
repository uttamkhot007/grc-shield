/**
 * Health Check & Monitoring Endpoints
 * 
 * Provides comprehensive health monitoring for:
 * - Database connectivity
 * - Cache status
 * - Rate limit statistics
 * - System metrics
 */

import type { Express, Request, Response } from "express";
import { checkDatabaseHealth, getPoolStats } from "../db";
import { getAllCacheStats } from "./cache";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  components: {
    database: ComponentHealth;
    cache: ComponentHealth;
    memory: ComponentHealth;
  };
}

interface ComponentHealth {
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, any>;
  latency?: number;
}

const startTime = Date.now();

async function checkComponentHealth(): Promise<HealthStatus> {
  const now = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  // Check database
  const dbStartTime = Date.now();
  const dbHealthy = await checkDatabaseHealth();
  const dbLatency = Date.now() - dbStartTime;
  const poolStats = getPoolStats();
  
  const database: ComponentHealth = {
    status: dbHealthy ? "healthy" : "unhealthy",
    latency: dbLatency,
    details: {
      pool: poolStats,
    },
  };

  // Check cache
  const cacheStats = getAllCacheStats();
  const cache: ComponentHealth = {
    status: "healthy",
    details: cacheStats,
  };

  // Check memory
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapPercentage = Math.round((heapUsedMB / heapTotalMB) * 100);
  
  const memory: ComponentHealth = {
    status: heapPercentage > 90 ? "degraded" : "healthy",
    details: {
      heapUsedMB,
      heapTotalMB,
      heapPercentage: `${heapPercentage}%`,
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
      externalMB: Math.round(memUsage.external / 1024 / 1024),
    },
  };

  // Overall status
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (!dbHealthy) {
    overallStatus = "unhealthy";
  } else if (heapPercentage > 90) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: now,
    uptime,
    version: process.env.npm_package_version || "1.0.0",
    components: {
      database,
      cache,
      memory,
    },
  };
}

export function registerHealthRoutes(app: Express): void {
  // Simple liveness probe (for load balancer)
  app.get("/health/live", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Readiness probe (full health check)
  app.get("/health/ready", async (_req: Request, res: Response) => {
    try {
      const health = await checkComponentHealth();
      const statusCode = health.status === "unhealthy" ? 503 : 200;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Detailed health status (for monitoring dashboards)
  app.get("/health", async (_req: Request, res: Response) => {
    try {
      const health = await checkComponentHealth();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: "Failed to collect health metrics",
      });
    }
  });

  // Metrics endpoint (Prometheus-compatible format)
  app.get("/metrics", async (_req: Request, res: Response) => {
    try {
      const health = await checkComponentHealth();
      const cacheStats = getAllCacheStats();
      const poolStats = getPoolStats();
      const memUsage = process.memoryUsage();
      
      let metrics = "";
      
      // Application info
      metrics += `# HELP app_info Application information\n`;
      metrics += `# TYPE app_info gauge\n`;
      metrics += `app_info{version="${health.version}"} 1\n\n`;
      
      // Uptime
      metrics += `# HELP app_uptime_seconds Application uptime in seconds\n`;
      metrics += `# TYPE app_uptime_seconds counter\n`;
      metrics += `app_uptime_seconds ${health.uptime}\n\n`;
      
      // Database pool
      metrics += `# HELP db_pool_total Total database connections\n`;
      metrics += `# TYPE db_pool_total gauge\n`;
      metrics += `db_pool_total ${poolStats.totalCount}\n\n`;
      
      metrics += `# HELP db_pool_idle Idle database connections\n`;
      metrics += `# TYPE db_pool_idle gauge\n`;
      metrics += `db_pool_idle ${poolStats.idleCount}\n\n`;
      
      metrics += `# HELP db_pool_waiting Waiting database queries\n`;
      metrics += `# TYPE db_pool_waiting gauge\n`;
      metrics += `db_pool_waiting ${poolStats.waitingCount}\n\n`;
      
      // Cache metrics
      metrics += `# HELP cache_size Current cache size\n`;
      metrics += `# TYPE cache_size gauge\n`;
      metrics += `cache_size{cache="data"} ${cacheStats.data.size}\n`;
      metrics += `cache_size{cache="query"} ${cacheStats.query.size}\n`;
      metrics += `cache_size{cache="session"} ${cacheStats.session.size}\n\n`;
      
      metrics += `# HELP cache_hits Total cache hits\n`;
      metrics += `# TYPE cache_hits counter\n`;
      metrics += `cache_hits{cache="data"} ${cacheStats.data.hits}\n`;
      metrics += `cache_hits{cache="query"} ${cacheStats.query.hits}\n`;
      metrics += `cache_hits{cache="session"} ${cacheStats.session.hits}\n\n`;
      
      // Memory metrics
      metrics += `# HELP nodejs_heap_size_used_bytes Node.js heap used\n`;
      metrics += `# TYPE nodejs_heap_size_used_bytes gauge\n`;
      metrics += `nodejs_heap_size_used_bytes ${memUsage.heapUsed}\n\n`;
      
      metrics += `# HELP nodejs_heap_size_total_bytes Node.js heap total\n`;
      metrics += `# TYPE nodejs_heap_size_total_bytes gauge\n`;
      metrics += `nodejs_heap_size_total_bytes ${memUsage.heapTotal}\n\n`;
      
      metrics += `# HELP nodejs_rss_bytes Node.js RSS\n`;
      metrics += `# TYPE nodejs_rss_bytes gauge\n`;
      metrics += `nodejs_rss_bytes ${memUsage.rss}\n\n`;
      
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send(metrics);
    } catch (error) {
      res.status(500).send("# Error collecting metrics\n");
    }
  });
}
