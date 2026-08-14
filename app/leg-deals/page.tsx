// Ferry / empty-leg deals.
//
// Ported from New-ASR-Client/src/pages/LegDeals.jsx (hero wording from its
// LegDeals/Hero.jsx). Unlike the ASR original this reads the same /api/deals
// the admin publishes to, so the page and the homepage strip never disagree.

import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import LegDealsClient from "@/components/LegDealsClient";

export const metadata: Metadata = {
  title: "Ferry Deals — ASR Aviation",
  description:
    "Exclusive empty-leg private jet deals. Fly in comfort and privacy for a fraction of the usual cost with ASR Aviation.",
};

export default function LegDealsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <LegDealsClient />
      </main>
      <Footer />
    </div>
  );
}
