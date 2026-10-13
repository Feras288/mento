import { describe, expect, it } from "vitest";
import { verifySmtpTransport } from "./email";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM;

describe("SMTP configuration", () => {
  it.skipIf(!smtpHost)("contains complete credentials and authenticates with the configured SMTP host", async () => {
    expect(smtpHost, "SMTP_HOST is required").toBeTruthy();
    expect(Number.isInteger(smtpPort) && smtpPort > 0, "SMTP_PORT must be a positive integer").toBe(true);
    expect(smtpUsername, "SMTP_USERNAME is required").toBeTruthy();
    expect(smtpPassword, "SMTP_PASSWORD is required").toBeTruthy();
    expect(smtpFrom, "SMTP_FROM is required").toBeTruthy();
    expect(smtpFrom, "SMTP_FROM must be a valid mailbox address").toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    await expect(verifySmtpTransport()).resolves.toBe(true);
  }, 15_000);
});
