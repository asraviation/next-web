// Admin overview.
//
// Cards are generated from ADMIN_SECTIONS, so a new section appears here
// without touching this file.

import Link from "next/link";
import { ADMIN_SECTIONS } from "@/lib/admin-nav";
import { listDeals } from "@/lib/deals";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

/** Live counts shown on a section card. Extend as sections are added. */
async function getSectionStat(slug: string): Promise<string | null> {
  try {
    if (slug === "deals") {
      const deals = await listDeals();
      const available = deals.filter((d) => !d.booked).length;
      return `${deals.length} active · ${available} available`;
    }

    if (slug === "leads") {
      const leads = await listLeads();
      const fresh = leads.filter((l) => l.status === "new").length;
      return `${leads.length} total · ${fresh} new`;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function AdminOverview() {
  const sections = await Promise.all(
    ADMIN_SECTIONS.map(async (section) => ({
      ...section,
      stat: section.enabled === false ? null : await getSectionStat(section.slug),
    }))
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
      <p className="text-gray-500 mb-8">
        Manage the content that powers the public ASR Aviation site.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const disabled = section.enabled === false;

          const card = (
            <div
              className={`h-full rounded-xl border bg-white p-5 transition-all ${
                disabled
                  ? "border-gray-200 opacity-60"
                  : "border-gray-200 hover:border-yellow-400 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900">
                    {section.label}
                    {disabled && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400">
                        Coming soon
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  {section.stat && (
                    <p className="text-xs text-gray-400 mt-2">{section.stat}</p>
                  )}
                </div>
              </div>
            </div>
          );

          return disabled ? (
            <div key={section.slug}>{card}</div>
          ) : (
            <Link key={section.slug} href={`/admin/${section.slug}`} className="block">
              {card}
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        To add a section: add an entry to <code>lib/admin-nav.ts</code> and create{" "}
        <code>app/admin/&lt;slug&gt;/page.tsx</code>. Authentication is inherited
        from the admin layout.
      </p>
    </div>
  );
}
