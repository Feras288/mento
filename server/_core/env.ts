export const ENV = {
  appId: process.env.VITE_APP_ID ?? "acsd-agri",
  cookieSecret: process.env.JWT_SECRET || "acsd_agri_cooperative_secret_jwt_key_2026",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL || "info@acsd.sa",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  isProduction: process.env.NODE_ENV === "production",
};
