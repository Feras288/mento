import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerPdfPreviewRoute } from "../pdfPreview";
import { initUploadsStorage, UPLOADS_DIR, DEFAULT_UPLOADS_DIR } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3002): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize persistent uploads storage (supports UPLOADS_DIR=/data/uploads)
  initUploadsStorage();

  // Primary static serving for uploaded files
  app.use("/storage", express.static(UPLOADS_DIR));
  app.use("/manus-storage", express.static(UPLOADS_DIR));

  // Fallback to project ./uploads directory if UPLOADS_DIR is custom and seed files reside in repository
  if (UPLOADS_DIR !== DEFAULT_UPLOADS_DIR && fs.existsSync(DEFAULT_UPLOADS_DIR)) {
    app.use("/storage", express.static(DEFAULT_UPLOADS_DIR));
    app.use("/manus-storage", express.static(DEFAULT_UPLOADS_DIR));
  }

  registerPdfPreviewRoute(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development mode uses Vite HMR, production mode serves built static assets
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const configuredPort = parseInt(process.env.PORT || "3002", 10);
  const host = "0.0.0.0";

  // In production (e.g. Coolify Railpack container), bind strictly to the configured PORT on 0.0.0.0
  if (process.env.NODE_ENV === "production") {
    server.listen(configuredPort, host, () => {
      console.log(`[Production] Server listening on http://${host}:${configuredPort} (PORT=${configuredPort})`);
    });
  } else {
    const port = await findAvailablePort(configuredPort);
    if (port !== configuredPort) {
      console.log(`Port ${configuredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`[Development] Server listening on http://localhost:${port}/`);
    });
  }
}

startServer().catch(console.error);
