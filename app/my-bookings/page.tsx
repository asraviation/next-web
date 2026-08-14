// Customer booking tracker.
//
// Shows the signed-in customer their own requests and current status. The
// server filters by the Google-verified session email, so one customer can
// never see another's.

import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import MyBookingsClient from "@/components/MyBookingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Bookings — ASR Aviation",
  robots: { index: false, follow: false },
};

export default function MyBookingsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      {/* pt clears the fixed navbar — no hero on this page */}
      <main className="flex-1 pt-24">
        <MyBookingsClient />
      </main>
      <Footer />
    </div>
  );
}
