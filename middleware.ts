// Admin route guard.
//
// WHY THIS EXISTS RATHER THAN JUST THE LAYOUT:
// A Next.js layout is not a security boundary. Next evaluates a child server
// page to produce `children` BEFORE the layout decides whether to render it,
// so a layout-only gate still runs the page's data fetching and can emit its
// output into the RSC payload. This was observed: an unauthenticated request
// to /admin executed listDeals() and leaked the deal count.
//
// Middleware runs before any rendering, so every current and future route
// under /admin is protected by default — nothing to remember per page.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

const ALLOWED_EMAILS = (
  process.env.ADMIN_ALLOWED_EMAILS ||
  [
    "asrofficial18@gmail.com",
    "work.asraviation@gmail.com",
    "sales@asraviation.com",
    "sales.asraviation@gmail.com",
  ].join(",")
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function devBypass() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === "1"
  );
}

export async function middleware(request: NextRequest) {
  if (devBypass()) return NextResponse.next();

  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  const authorized =
    session && ALLOWED_EMAILS.includes(session.email.toLowerCase());

  if (authorized) return NextResponse.next();

  // Rewrite (not redirect) so the URL is preserved: signing in and refreshing
  // lands the admin on the page they originally asked for.
  const url = request.nextUrl.clone();
  url.pathname = "/admin-signin";
  url.search = "";

  const response = NextResponse.rewrite(url);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
