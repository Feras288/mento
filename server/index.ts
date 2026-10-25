import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public"),
  ];

  const staticPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

  app.use(express.static(staticPath, { maxAge: "1d" }));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application client build not found. Please build the client first.");
    }
  });

  const port = parseInt(process.env.PORT || "3002", 10);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/ (PORT=${port})`);
  });
}

startServer().catch(console.error);
