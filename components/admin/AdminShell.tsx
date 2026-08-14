"use client";

// Admin chrome: sidebar, header, sign-out. The sidebar is generated from
// ADMIN_SECTIONS, so adding a section to that registry is all it takes to
// appear here.

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_SECTIONS } from "@/lib/admin-nav";

interface Props {
  user: { email: string; name: string };
  devBypass: boolean;
  children: React.ReactNode;
}

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function AdminShell({ user, devBypass, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {});
    router.refresh();
  };

  const isActive = (slug: string) => {
    const href = `/admin/${slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = (
    <nav className="space-y-1">
      <Link
        href="/admin"
        onClick={() => setNavOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          pathname === "/admin"
            ? "bg-yellow-50 text-yellow-800 font-semibold"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <NavIcon path="M3 12l9-9 9 9M5 10v10h14V10" />
        Overview
      </Link>

      {ADMIN_SECTIONS.map((section) => {
        const disabled = section.enabled === false;

        if (disabled) {
          return (
            <span
              key={section.slug}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed"
              title="Coming soon"
            >
              <NavIcon path={section.icon} />
              {section.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>
            </span>
          );
        }

        return (
          <Link
            key={section.slug}
            href={`/admin/${section.slug}`}
            onClick={() => setNavOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(section.slug)
                ? "bg-yellow-50 text-yellow-800 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <NavIcon path={section.icon} />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {devBypass && (
        <div className="bg-amber-100 border-b-2 border-amber-500 text-amber-900 px-4 py-2 text-sm font-medium text-center">
          ⚠️ Sign-in is bypassed (<code>NEXT_PUBLIC_ADMIN_DEV_BYPASS=1</code> in
          .env.local). Local development only.
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white min-h-screen sticky top-0">
          <div className="px-6 py-5 border-b border-gray-200">
            <Link href="/admin" className="text-lg font-bold text-gray-900">
              ASR Admin
            </Link>
          </div>

          <div className="flex-1 px-3 py-4">{nav}</div>

          <div className="border-t border-gray-200 px-4 py-4">
            <p className="text-xs text-gray-500 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-800 truncate" title={user.email}>
              {user.email}
            </p>
            {!devBypass && (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-3 w-full text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}
            <Link
              href="/"
              className="mt-2 block text-center text-xs text-gray-500 hover:text-gray-700"
            >
              ← Back to site
            </Link>
          </div>
        </aside>

        {/* Mobile header + drawer */}
        <div className="flex-1 min-w-0">
          <div className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <Link href="/admin" className="font-bold text-gray-900">
              ASR Admin
            </Link>
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle navigation"
              aria-expanded={navOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {navOpen && (
            <div className="md:hidden border-b border-gray-200 bg-white px-3 py-3">
              {nav}
              {!devBypass && (
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="mt-3 w-full text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              )}
            </div>
          )}

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
