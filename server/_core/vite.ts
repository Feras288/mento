import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    typeof import.meta.dirname !== "undefined"
      ? path.resolve(import.meta.dirname, "public")
      : null,
    typeof import.meta.dirname !== "undefined"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : null,
  ].filter((p): p is string => Boolean(p));

  const distPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static Serving] Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { maxAge: "1d" }));

  // fall through to index.html for client-side SPA routing
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application client build not found. Please build the client first.");
    }
  });
}
