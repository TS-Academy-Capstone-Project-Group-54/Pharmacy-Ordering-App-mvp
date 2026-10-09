import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import type { SessionPayload } from "@/types";

const secret = process.env.JWT_SECRET ?? "dev_insecure_secret_change_me";
const key = new TextEncoder().encode(secret);

const COOKIE_NAME = "group54_session";
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  try {
    const store = await cookies();
    const hdrs = await headers();
    const proto = hdrs.get("x-forwarded-proto") ?? "";
    const isHttps = proto.includes("https") || (typeof window !== "undefined" && window.location.protocol === "https:") || isProduction;

    store.set(COOKIE_NAME, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // Fallback if cookies cannot be mutated in current context
  }
}

export async function clearSessionCookie() {
  try {
    const store = await cookies();
    store.delete(COOKIE_NAME, { path: "/" });
  } catch {
    // Ignore
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const hdrs = await headers();
    const authHeader = hdrs.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const bearerToken = authHeader.slice(7).trim();
      if (bearerToken) {
        const verified = await verifyToken(bearerToken);
        if (verified) return verified;
      }
    }

    const xToken = hdrs.get("x-auth-token");
    if (xToken) {
      const verified = await verifyToken(xToken);
      if (verified) return verified;
    }

    const store = await cookies();
    const cookieToken = store.get(COOKIE_NAME)?.value;
    if (cookieToken) {
      return verifyToken(cookieToken);
    }
  } catch {
    return null;
  }

  return null;
}
