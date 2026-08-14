// Admin session cookies.
//
// The browser never holds the Google ID token. It is POSTed once to
// /api/auth/google and exchanged for this cookie, which is httpOnly (so page
// JS cannot read it), signed with HMAC-SHA256 (so it cannot be forged), and
// carries its own expiry (so a stolen copy dies).
//
// Built on Web Crypto rather than node:crypto so the SAME implementation runs
// in middleware (Edge runtime) and in route handlers. Middleware is where the
// /admin gate lives, and duplicating signing logic there would be a liability.

export const SESSION_COOKIE = "asr_admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

/**
 * Which gate a session is for. Admin and customer sessions are signed with the
 * same secret, so without this an allowlisted staff member's *customer* token
 * would also be a valid *admin* token if moved between cookies. Binding the
 * audience makes the two non-interchangeable.
 */
export type SessionAudience = "admin" | "customer";

export interface SessionPayload {
  email: string;
  name: string;
  exp: number; // epoch seconds
  aud: SessionAudience;
}

/**
 * In production the secret must be supplied. In development we fall back to a
 * fixed dev-only string so the app runs out of the box — sessions signed with
 * it are worthless anywhere else, which is the point.
 */
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters in production"
    );
  }

  if (secret) {
    console.warn("[session] ADMIN_SESSION_SECRET is shorter than 32 chars — using it anyway (dev)");
    return secret;
  }

  return "dev-only-insecure-session-secret-do-not-use-in-production";
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(data: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

/** Length-safe, constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(
  email: string,
  name: string,
  audience: SessionAudience = "admin",
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> {
  const payload: SessionPayload = {
    email,
    name,
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await sign(body)}`;
}

/**
 * Verify signature, expiry and audience. Returns null on any problem.
 * A token minted for a different audience is rejected.
 */
export async function readSessionToken(
  token?: string | null,
  expectedAudience: SessionAudience = "admin"
): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  if (!body || !signature) return null;

  let expected: string;
  try {
    expected = await sign(body);
  } catch {
    return null;
  }

  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body))
    ) as SessionPayload;

    if (!payload?.email || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    if (payload.aud !== expectedAudience) return null;

    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,              // page JS cannot read it
    sameSite: "strict" as const, // not sent on cross-site requests -> CSRF defence
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
