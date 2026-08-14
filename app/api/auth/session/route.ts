// Current admin session.
//
// Lets the dashboard restore state on reload without the browser ever holding
// a credential. Returns identity only — never the session token itself.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { DEV_BYPASS_USER, isAllowedEmail, isDevBypassEnabled } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDevBypassEnabled()) {
    return NextResponse.json({
      authenticated: true,
      devBypass: true,
      email: DEV_BYPASS_USER.email,
      name: DEV_BYPASS_USER.name,
    });
  }

  const jar = await cookies();
  const session = await readSessionToken(jar.get(SESSION_COOKIE)?.value);

  if (!session || !isAllowedEmail(session.email)) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    devBypass: false,
    email: session.email,
    name: session.name,
  });
}
