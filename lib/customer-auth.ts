// Customer authentication.
//
// Distinct from admin auth in lib/admin-auth.ts: any Google account may sign
// in as a customer (there is no allowlist), and the session lives in its own
// cookie so a customer session can never be mistaken for an admin one.
//
// Signing/verification is shared with lib/session.ts, so the same HMAC secret
// and expiry rules apply, and the cookie is equally httpOnly.

import { cookies } from "next/headers";
import { readSessionToken } from "@/lib/session";

export const CUSTOMER_COOKIE = "asr_customer_session";

export interface Customer {
  email: string;
  name: string;
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const, // lax: customer may arrive via an external link
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days — long enough to track a booking
  };
}

/** Current customer, or null. */
export async function getCustomer(): Promise<Customer | null> {
  const jar = await cookies();
  const session = await readSessionToken(jar.get(CUSTOMER_COOKIE)?.value, "customer");
  if (!session?.email) return null;

  return { email: session.email, name: session.name };
}

export async function requireCustomer(): Promise<
  { ok: true; customer: Customer } | { ok: false; status: number; error: string }
> {
  const customer = await getCustomer();
  if (!customer) {
    return { ok: false, status: 401, error: "Please sign in to continue" };
  }
  return { ok: true, customer };
}
