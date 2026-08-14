// Admin panel shell + authentication gate.
//
// Every route under /admin inherits this layout, so a new section is gated
// automatically just by existing. The check runs on the server: an
// unauthenticated visitor is served the sign-in card and never receives the
// admin markup at all.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import {
  DEV_BYPASS_USER,
  isAllowedEmail,
  isDevBypassEnabled,
} from "@/lib/admin-auth";
import AdminSignIn from "@/components/admin/AdminSignIn";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ASR Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const devBypass = isDevBypassEnabled();

  let user: { email: string; name: string } | null = null;

  if (devBypass) {
    user = DEV_BYPASS_USER;
  } else {
    const jar = await cookies();
    const session = await readSessionToken(jar.get(SESSION_COOKIE)?.value);
    if (session && isAllowedEmail(session.email)) {
      user = { email: session.email, name: session.name };
    }
  }

  if (!user) return <AdminSignIn />;

  return (
    <AdminShell user={user} devBypass={devBypass}>
      {children}
    </AdminShell>
  );
}
