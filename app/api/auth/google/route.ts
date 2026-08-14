// Google sign-in exchange.
//
// The ID token arrives once in the POST body, is verified server-side, and is
// then discarded — it is never written to the response, so the browser has
// nothing to store. Authority afterwards lives in an httpOnly cookie.

import { NextResponse } from "next/server";
import { isAllowedEmail, isSameOrigin, verifyGoogleToken } from "@/lib/admin-auth";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";
import { checkRateLimit, clientIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import { ValidationError, readJsonBody } from "@/lib/validate-deal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 }
    );
  }

  const limit = checkRateLimit(clientIdentifier(request), "auth");
  const headers = rateLimitHeaders(limit);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await readJsonBody(request);

    if (!body?.token || typeof body.token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 400, headers });
    }

    const userData = await verifyGoogleToken(body.token);
    if (!userData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401, headers });
    }

    const { email, name } = userData;

    // Authenticated but not staff: say so without minting a session.
    if (!isAllowedEmail(email)) {
      return NextResponse.json(
        { message: "User authenticated", email, name, authorized: false },
        { status: 403, headers }
      );
    }

    const response = NextResponse.json(
      { message: "User authenticated", email, name, authorized: true },
      { headers }
    );

    response.cookies.set(
      SESSION_COOKIE,
      await createSessionToken(email, name),
      sessionCookieOptions()
    );

    return response;
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status, headers });
    }
    console.error("Auth Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
