import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";
const defaultJwtSecret = "acsd_agri_cooperative_secret_jwt_key_2026";
const defaultAdminPassword = "admin123";

if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultJwtSecret) {
    console.warn(
      "[Security Warning] Using default or unset JWT_SECRET in production! Please set a strong random JWT_SECRET in your Coolify environment variables."
    );
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === defaultAdminPassword) {
    console.warn(
      "[Security Warning] Using default ADMIN_PASSWORD in production! Please set a secure password in your Coolify environment variables."
    );
  }
}

export const DEFAULT_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : DEFAULT_UPLOADS_DIR;

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "acsd-agri",
  cookieSecret: process.env.JWT_SECRET || defaultJwtSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL || "info@acsd.sa",
  adminPassword: process.env.ADMIN_PASSWORD || defaultAdminPassword,
  isProduction,
  port: parseInt(process.env.PORT || "3002", 10),
  uploadsDir: UPLOADS_DIR,
};
