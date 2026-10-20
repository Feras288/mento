import { describe, expect, it } from "vitest";
import { storageKeyFromUrl } from "./pdfPreview";

describe("storageKeyFromUrl", () => {
  it("يستخرج مفتاح وثيقة مخزنة من المسار الداخلي", () => {
    expect(storageKeyFromUrl("/manus-storage/governance-documents/acsd-sop-com-001-integrity-compliance.pdf")).toBe("governance-documents/acsd-sop-com-001-integrity-compliance.pdf");
    expect(storageKeyFromUrl("/storage/governance-documents/acsd-sop-com-001-integrity-compliance.pdf")).toBe("governance-documents/acsd-sop-com-001-integrity-compliance.pdf");
  });

  it("يرفض الروابط الخارجية والمسارات غير الآمنة", () => {
    expect(storageKeyFromUrl("https://example.com/report.pdf")).toBeNull();
    expect(storageKeyFromUrl("/manus-storage/governance-documents/../secret.pdf")).toBeNull();
    expect(storageKeyFromUrl(null)).toBeNull();
  });
});
