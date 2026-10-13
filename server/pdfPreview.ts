import type { Express, Request, Response } from "express";
import fs from "node:fs";
import * as db from "./db";
import { getLocalStoragePath, storageGetSignedUrl } from "./storage";

export function storageKeyFromUrl(url: string | null | undefined) {
  if (!url) return null;
  let key: string | null = null;
  if (url.startsWith("/storage/")) {
    key = url.slice("/storage/".length);
  } else if (url.startsWith("/manus-storage/")) {
    key = url.slice("/manus-storage/".length);
  }
  return key && !key.includes("..") ? key : null;
}

function sendPreviewError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

async function streamPdfPreview(req: Request, res: Response) {
  const documentId = Number(req.params.id);
  if (!Number.isSafeInteger(documentId) || documentId <= 0) {
    sendPreviewError(res, 400, "Invalid document id");
    return;
  }

  const document = await db.getPublishedDocumentById(documentId);
  const storageKey = storageKeyFromUrl(document?.imageUrl);
  if (!document || !storageKey || !/\.pdf$/i.test(storageKey)) {
    sendPreviewError(res, 404, "PDF document not found");
    return;
  }

  // Check if file exists in local storage
  const localFilePath = getLocalStoragePath(storageKey);
  if (fs.existsSync(localFilePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, max-age=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.sendFile(localFilePath);
  }

  const signedUrl = await storageGetSignedUrl(storageKey);
  const requestedRange = typeof req.headers.range === "string" ? req.headers.range : undefined;
  const upstream = await fetch(signedUrl, {
    headers: requestedRange ? { Range: requestedRange } : undefined,
  });

  if (!upstream.ok || !upstream.body) {
    console.error("[PDF Preview] Storage fetch failed", { documentId, status: upstream.status });
    sendPreviewError(res, 502, "PDF source unavailable");
    return;
  }

  const passThroughHeaders = ["content-length", "content-range", "accept-ranges", "etag", "last-modified"] as const;
  for (const header of passThroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) res.setHeader(header, value);
  }

  res.status(upstream.status);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", "private, max-age=60");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(Buffer.from(await upstream.arrayBuffer()));
}

export function registerPdfPreviewRoute(app: Express) {
  app.get("/api/documents/:id/preview", (req, res) => {
    void streamPdfPreview(req, res).catch(error => {
      console.error("[PDF Preview] Unexpected preview error", error);
      if (!res.headersSent) sendPreviewError(res, 500, "Unable to prepare PDF preview");
      else res.end();
    });
  });
}
