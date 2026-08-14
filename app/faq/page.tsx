import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import FaqClient from "@/components/FaqClient";

export const metadata: Metadata = {
  title: "FAQ — ASR Aviation",
  description:
    "Answers to common questions about ASR Aviation's private charters, business flights, air ambulance and aircraft management services.",
};

export default function FaqPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <FaqClient />
      </main>
      <Footer />
    </div>
  );
}
