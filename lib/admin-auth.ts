// Admin authentication.
//
// Ported from New-ASR-Client/backend/src/utils/googleAuth.ts, with the trust
// model tightened: the browser no longer holds the Google ID token. It is
// exchanged once for an httpOnly session cookie (lib/session.ts), so page JS
// — and anything injected into it — cannot read the credential.

import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

/**
 * Allowlist. Prefer ADMIN_ALLOWED_EMAILS (comma-separated, server-only) so
 * access changes do not require a deploy and staff emails stay out of git.
 */
export const ALLOWED_EMAILS: string[] = (
  process.env.ADMIN_ALLOWED_EMAILS ||
  [
    "vedic20052005@gmail.com",
    "kanishkvalecha76@gmail.com",
    "asrofficial18@gmail.com",
    "work.asraviation@gmail.com",
    "sales@asraviation.com",
    "sales.asraviation@gmail.com",
  ].join(",")
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "301746401915-5u22scfem88dqr28f208g3ehu52knmr5.apps.googleusercontent.com";

export interface GoogleUser {
  email: string;
  name: string;
}

/**
 * Local escape hatch for working on the dashboard before the OAuth client has
 * localhost in its authorized origins. Double-guarded: the flag must be set
 * AND the build must not be production, so it cannot reach a deployed site.
 */
export function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === "1"
  );
}

export const DEV_BYPASS_USER: GoogleUser = {
  email: "dev-bypass@localhost",
  name: "Local Dev (auth bypassed)",
};

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

/** Verify a Google ID token. Returns null when the token is invalid. */
export async function verifyGoogleToken(
  token: string
): Promise<GoogleUser | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      // Deliberately not logging the response body — it echoes the token.
      console.error("Google token verification failed:", response.status);
      return null;
    }

    const data = (await response.json()) as {
      aud?: string;
      email?: string;
      name?: string;
      email_verified?: string | boolean;
      exp?: string;
    };

    if (!data || data.aud !== GOOGLE_CLIENT_ID) return null;
    if (!data.email) return null;
    if (data.email_verified === false || data.email_verified === "false") return null;
    if (data.exp && Number(data.exp) * 1000 < Date.now()) return null;

    return { email: data.email, name: data.name || data.email };
  } catch (error) {
    console.error("Google Auth Error:", error);
    return null;
  }
}

/**
 * Reject cross-site mutations. SameSite=Strict already stops the cookie being
 * attached cross-origin; this is the belt-and-braces check for clients that
 * ignore it.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true; // same-origin fetches may omit Origin
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type AdminResult =
  | { ok: true; user: GoogleUser }
  | { ok: false; status: number; error: string };

/** Gate a mutating request on a valid, allowlisted admin session cookie. */
export async function requireAdmin(request: Request): Promise<AdminResult> {
  if (!isSameOrigin(request)) {
    return { ok: false, status: 403, error: "Cross-origin request rejected" };
  }

  if (isDevBypassEnabled()) {
    console.warn("[admin-auth] DEV BYPASS ACTIVE — mutation allowed without sign-in");
    return { ok: true, user: DEV_BYPASS_USER };
  }

  const jar = await cookies();
  const session = await readSessionToken(jar.get(SESSION_COOKIE)?.value);

  if (!session) return { ok: false, status: 401, error: "Not signed in" };
  if (!isAllowedEmail(session.email)) {
    return { ok: false, status: 403, error: "Email is not authorized" };
  }

  return { ok: true, user: { email: session.email, name: session.name } };
}
