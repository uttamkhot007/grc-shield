import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool sizing for high concurrency
  // Rule: (core_count * 2) + effective_spindle_count
  // For cloud deployments, typically 20-50 connections per node
  max: parseInt(process.env.DB_POOL_MAX || "50"),
  min: parseInt(process.env.DB_POOL_MIN || "5"),
  
  // Connection timeout - how long to wait for a connection
  connectionTimeoutMillis: 10000,
  
  // Idle timeout - release connections after 30s of inactivity  
  idleTimeoutMillis: 30000,
  
  // Statement timeout - prevent long-running queries
  statement_timeout: 30000,
  
  // Query timeout
  query_timeout: 30000,
  
  // Allow exit even if there are idle clients
  allowExitOnIdle: true,
  
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

export const pool = new pg.Pool(poolConfig);

// Pool error handling for reliability
pool.on("error", (err) => {
  console.error("[DB Pool] Unexpected error on idle client:", err);
});

pool.on("connect", () => {
  console.log("[DB Pool] New client connected");
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("[DB Pool] Health check failed:", error);
    return false;
  }
}

// Get pool statistics for monitoring
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
  console.log("[DB Pool] Connection pool closed");
}

export const db = drizzle(pool, { schema });
