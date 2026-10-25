import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  ensureUploadsDir,
  getLocalStoragePath,
  storagePut,
  storageGet,
  storageGetSignedUrl,
  initUploadsStorage,
  DEFAULT_UPLOADS_DIR,
  UPLOADS_DIR,
} from "./storage";

describe("Persistent Storage Module", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "acsd-storage-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("exports valid DEFAULT_UPLOADS_DIR pointing to project uploads", () => {
    expect(DEFAULT_UPLOADS_DIR).toBe(path.resolve(process.cwd(), "uploads"));
    expect(typeof UPLOADS_DIR).toBe("string");
  });

  it("creates directory if missing and verifies writability", () => {
    const testSubDir = path.join(tempDir, "nested", "deep", "folder");
    expect(fs.existsSync(testSubDir)).toBe(false);

    // Call ensureUploadsDir with target path
    const created = ensureUploadsDir(path.relative(UPLOADS_DIR, path.join(testSubDir, "sample.txt")));
    expect(fs.existsSync(created)).toBe(true);
    expect(() => fs.accessSync(created, fs.constants.W_OK)).not.toThrow();
  });

  it("stores and retrieves files preserving /storage/ public URL format", async () => {
    const sampleData = Buffer.from("test document content 12345");
    const result = await storagePut("test-docs/document.pdf", sampleData, "application/pdf");

    expect(result.url).toMatch(/^\/storage\/test-docs\/document_[a-f0-9]{8}\.pdf$/);
    expect(result.key).toMatch(/^test-docs\/document_[a-f0-9]{8}\.pdf$/);

    const storedPath = getLocalStoragePath(result.key);
    expect(fs.existsSync(storedPath)).toBe(true);
    expect(fs.readFileSync(storedPath).toString()).toBe("test document content 12345");

    // Clean up created file
    try {
      fs.unlinkSync(storedPath);
    } catch {
      // Ignore
    }
  });

  it("preserves URL formatting in storageGet and storageGetSignedUrl", async () => {
    const key = "governance-documents/report.pdf";
    const getRes = await storageGet(key);
    expect(getRes).toEqual({ key, url: `/storage/${key}` });

    const signedUrl = await storageGetSignedUrl(key);
    expect(signedUrl).toBe(`/storage/${key}`);
  });

  it("initializes storage cleanly via initUploadsStorage", () => {
    const status = initUploadsStorage();
    expect(status).toHaveProperty("uploadsDir");
    expect(status).toHaveProperty("isCustom");
    expect(status.isWritable).toBe(true);
  });
});
