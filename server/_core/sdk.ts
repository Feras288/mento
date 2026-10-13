import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

export type AuthenticatedUser = User & {
  taskUid?: string;
  isCron?: boolean;
};

export class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId)
      ) {
        return null;
      }

      return {
        openId,
        appId,
        name: typeof name === "string" ? name : "",
      };
    } catch {
      return null;
    }
  }

  async loginWithCredentials(
    usernameOrEmail: string,
    password: string
  ): Promise<AuthenticatedUser | null> {
    const normalizedInput = usernameOrEmail.trim().toLowerCase();
    const adminEmail = ENV.adminEmail.toLowerCase();
    const adminPassword = ENV.adminPassword;

    const isAdminMatch =
      (normalizedInput === adminEmail ||
        normalizedInput === "admin" ||
        normalizedInput === "admin@acsd.sa" ||
        normalizedInput === "info@acsd.sa") &&
      password === adminPassword;

    if (!isAdminMatch) {
      return null;
    }

    const now = new Date();
    const adminUser: AuthenticatedUser = {
      id: 1,
      openId: "admin",
      name: "مدير الجمعية",
      email: ENV.adminEmail,
      loginMethod: "local",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };

    try {
      await db.upsertUser({
        openId: "admin",
        name: "مدير الجمعية",
        email: ENV.adminEmail,
        loginMethod: "local",
        role: "admin",
        lastSignedIn: now,
      });
    } catch {
      // Ignored if DB is not available in mock/offline mode
    }

    return adminUser;
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);

    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }

    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const now = new Date();

    if (sessionUserId === "admin" || sessionUserId === ENV.adminEmail) {
      return {
        id: 1,
        openId: sessionUserId,
        name: session.name || "مدير الجمعية",
        email: ENV.adminEmail,
        loginMethod: "local",
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      };
    }

    const user = await db.getUserByOpenId(sessionUserId);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    return user as AuthenticatedUser;
  }

  // Backwards compatibility stubs
  async exchangeCodeForToken(_code: string, _state: string): Promise<any> {
    return { accessToken: "local_access_token" };
  }

  async getUserInfo(_accessToken: string): Promise<any> {
    return {
      openId: "admin",
      name: "مدير الجمعية",
      email: ENV.adminEmail,
      platform: "local",
      loginMethod: "local",
    };
  }
}

export const sdk = new SDKServer();
