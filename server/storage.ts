import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR, DEFAULT_UPLOADS_DIR } from "./_core/env";

export { UPLOADS_DIR, DEFAULT_UPLOADS_DIR };

export function ensureUploadsDir(subPath?: string): string {
  const targetDir = subPath ? path.dirname(path.join(UPLOADS_DIR, subPath)) : UPLOADS_DIR;

  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (err) {
      console.error(
        `[Storage Error] Failed to create uploads directory at ${targetDir}:`,
        err
      );
      throw new Error(
        `Uploads directory cannot be created at ${targetDir}. Please verify filesystem permissions or Docker volume configuration.`
      );
    }
  }

  try {
    fs.accessSync(targetDir, fs.constants.W_OK);
  } catch (err) {
    console.error(
      `[Storage Error] Uploads directory is not writable: ${targetDir}. If using Coolify or Docker, ensure the mounted volume has write permissions (e.g. chmod 775 or chown 1000:1000).`,
      err
    );
    throw new Error(
      `Uploads directory at ${targetDir} is not writable. Please check Docker volume permissions.`
    );
  }

  return targetDir;
}

export function initUploadsStorage(): { uploadsDir: string; isCustom: boolean; isWritable: boolean } {
  const isCustom = UPLOADS_DIR !== DEFAULT_UPLOADS_DIR;
  let isWritable = false;

  try {
    ensureUploadsDir();
    isWritable = true;
    console.log(
      `[Storage] Uploads directory ready at: ${UPLOADS_DIR}${isCustom ? " (custom persistent volume)" : " (default local folder)"}`
    );
  } catch (err) {
    console.error(
      `[Storage Warning] Uploads directory ${UPLOADS_DIR} is currently NOT writable. Uploading new files will fail until permissions are corrected:`,
      (err as Error).message
    );
  }

  return { uploadsDir: UPLOADS_DIR, isCustom, isWritable };
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
  const primaryPath = path.join(UPLOADS_DIR, key);
  if (fs.existsSync(primaryPath)) {
    return primaryPath;
  }
  const fallbackPath = path.join(DEFAULT_UPLOADS_DIR, key);
  if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }
  return primaryPath;
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

  try {
    await fs.promises.writeFile(filePath, buffer);
  } catch (err) {
    console.error(`[Storage Error] Failed to write file to ${filePath}:`, err);
    throw new Error(`Failed to save uploaded file: ${(err as Error).message}`);
  }

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
