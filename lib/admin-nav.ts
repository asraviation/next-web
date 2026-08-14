// Admin panel section registry.
//
// ---------------------------------------------------------------------------
// TO ADD A NEW ADMIN SECTION:
//   1. Add an entry to ADMIN_SECTIONS below.
//   2. Create app/admin/<href-segment>/page.tsx exporting a React component.
// That is all — the sidebar, the overview cards, and the auth gate pick it up
// automatically, because the gate lives in app/admin/layout.tsx and wraps
// every route beneath it.
// ---------------------------------------------------------------------------

export interface AdminSection {
  /** URL under /admin — e.g. "deals" -> /admin/deals */
  slug: string;
  label: string;
  description: string;
  /** Inline SVG path data, drawn in a 24x24 viewBox. */
  icon: string;
  /** Set false to show the entry greyed out as "coming soon". */
  enabled?: boolean;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    slug: "deals",
    label: "Featured Deals",
    description:
      "Create, edit and remove empty-leg deals shown on the public site.",
    icon: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  },
  {
    slug: "leads",
    label: "Leads",
    description: "Enquiries submitted through the service pages.",
    icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
  },
  // Example of a future section — copy this shape:
  // {
  //   slug: "bookings",
  //   label: "Bookings",
  //   description: "Review and manage customer booking requests.",
  //   icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  //   enabled: false,
  // },
];

export const getSection = (slug: string) =>
  ADMIN_SECTIONS.find((section) => section.slug === slug);
