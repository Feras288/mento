import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir(subPath?: string) {
  const targetDir = subPath ? path.dirname(path.join(UPLOADS_DIR, subPath)) : UPLOADS_DIR;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export function getLocalStoragePath(relKey: string): string {
  const key = normalizeKey(relKey);
  return path.join(UPLOADS_DIR, key);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  ensureUploadsDir(key);

  const filePath = path.join(UPLOADS_DIR, key);
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  await fs.promises.writeFile(filePath, buffer);

  return { key, url: `/storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return `/storage/${key}`;
}
