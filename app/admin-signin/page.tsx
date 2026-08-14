// Sign-in page for the admin panel.
//
// Middleware rewrites unauthenticated /admin/* requests here, so the address
// bar keeps the originally requested path. Deliberately OUTSIDE /admin so the
// rewrite target is not itself gated.

import type { Metadata } from "next";
import AdminSignIn from "@/components/admin/AdminSignIn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ASR Admin — Sign in",
  robots: { index: false, follow: false },
};

export default function AdminSignInPage() {
  return <AdminSignIn />;
}
