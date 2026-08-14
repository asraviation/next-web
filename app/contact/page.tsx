// Contact Us.
//
// Layout ported from New-ASR-Client/src/pages/ContactUs.jsx, minus the Google
// sign-in gate — the form is open to everyone.

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — ASR Aviation",
  description:
    "Contact ASR Aviation for private jet charter inquiries, quotes, and bookings. Get in touch with our team for personalized aviation solutions.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <Navbar />

      {/* pt clears the fixed navbar — this page has no hero to sit under it */}
      <section className="pt-32 pb-20 font-sans font-thin">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Contact Us</span>
          </nav>
        </div>

        <div className="text-center mb-12 px-4">
          <h1 className="font-sans text-center text-4xl md:text-5xl mb-6">CONTACT US</h1>
          <p className="text-lg md:text-xl text-black max-w-2xl mx-auto">
            Reach out to us with your queries or requests, and our team will get
            back to you promptly.
          </p>
        </div>

        <div className="px-4">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
