// Sign out — clears the admin session cookie.

import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin-auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
