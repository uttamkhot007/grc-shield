import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupAuth } from "./auth";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

import { seedDatabase, syncNewTenants } from "./seed";
import { seedAllControls } from "./seed-controls";
import { seedBCPCatalog } from "./seed-bcp-catalog";
import { db } from "./db";
import { riskRegisterTemplates } from "@shared/schema";
import { sql } from "drizzle-orm";

// Database maintenance: Fix legacy ASRY template names (runs on every startup)
async function fixLegacyTemplates() {
  try {
    const templates = await db.select().from(riskRegisterTemplates);
    const asryTemplate = templates.find(t => 
      t.code === "TMPL-IT-ASRY" || 
      (t.name && t.name.includes("ASRY")) ||
      (t.standard && t.standard.includes("ASRY"))
    );
    if (asryTemplate) {
      console.log("Fixing legacy ASRY template references...");
      await db.update(riskRegisterTemplates)
        .set({
          code: "TMPL-IT-001",
          name: "IT Risk Assessment",
          standard: "ISO 27001",
          description: "Comprehensive IT risk assessment template with CIA scoring, threat/vulnerability analysis, and residual risk tracking. Based on ISO 27001 standard methodology for systematic IT risk identification and assessment.",
        })
        .where(sql`${riskRegisterTemplates.id} = ${asryTemplate.id}`);
      console.log("Fixed ASRY template - renamed to IT Risk Assessment");
    }
  } catch (error) {
    console.error("Failed to fix legacy templates:", error);
  }
}

(async () => {
  // Seed database with initial data (works for both dev and production)
  // Core application data (frameworks, controls, policies, risk catalog) is seeded
  // Demo tenants are seeded but require proper login credentials to access
  try {
    await seedDatabase();
    // Sync new tenants (adds additional tenants if missing)
    await syncNewTenants();
    // Fix any legacy ASRY template references (runs every startup)
    await fixLegacyTemplates();
    // Seed all comprehensive controls (1000+ controls across all frameworks)
    console.log("Seeding comprehensive controls...");
    await seedAllControls();
    // Seed BC/DR Plan Catalog and Test Templates
    console.log("Seeding BC/DR catalogs...");
    await seedBCPCatalog();
  } catch (error) {
    console.error("Failed to seed database:", error);
  }

  // Setup authentication BEFORE other routes
  await setupAuth(app);

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
