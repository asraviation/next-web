// The single-purpose deals admin moved into the centralised panel.
// Kept as a permanent redirect so existing links and bookmarks keep working.

import { redirect } from "next/navigation";

export default function LegDealsAdminRedirect() {
  redirect("/admin/deals");
}
