// Customer sign-in.
//
// Same exchange as the admin flow — the Google ID token is POSTed once,
// verified server-side and swapped for an httpOnly cookie — but with no
// allowlist: any verified Google account may book and track a booking.

import { NextResponse } from "next/server";
import { isSameOrigin, verifyGoogleToken } from "@/lib/admin-auth";
import { createSessionToken } from "@/lib/session";
import { CUSTOMER_COOKIE, customerCookieOptions, getCustomer } from "@/lib/customer-auth";
import { checkRateLimit, clientIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import { ValidationError, readJsonBody } from "@/lib/validate-deal";

export const dynamic = "force-dynamic";

/** Who is signed in right now. */
export async function GET() {
  const customer = await getCustomer();
  return NextResponse.json(
    customer
      ? { authenticated: true, email: customer.email, name: customer.name }
      : { authenticated: false }
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
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

    const user = await verifyGoogleToken(body.token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401, headers });
    }

    const response = NextResponse.json(
      { authenticated: true, email: user.email, name: user.name },
      { headers }
    );

    response.cookies.set(
      CUSTOMER_COOKIE,
      await createSessionToken(user.email, user.name, "customer", 30 * 24 * 60 * 60),
      customerCookieOptions()
    );

    return response;
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status, headers });
    }
    console.error("Customer auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}

/** Sign out. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(CUSTOMER_COOKIE, "", { ...customerCookieOptions(), maxAge: 0 });
  return response;
}
