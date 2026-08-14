// Terms & Conditions.
//
// Ported from New-ASR-Client/src/pages/Terms.jsx; the content itself is
// lifted verbatim into lib/terms-data.js so wording cannot drift.

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
// @ts-expect-error — plain JS data module ported from the ASR client
import termsData from "@/lib/terms-data";

export const metadata: Metadata = {
  title: "Terms & Conditions — ASR Aviation",
  description:
    "Terms and conditions for ASR Aviation charter, joyride, air ambulance and related services.",
};

interface Section {
  title: string;
  content: string | string[];
}

export default function TermsPage() {
  const sections = termsData as Section[];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Terms &amp; Conditions</span>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-600">
              Please read these terms carefully before booking any ASR Aviation service.
            </p>
          </div>

          {/* Jump links */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-12">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
              On this page
            </p>
            <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm list-decimal list-inside">
              {sections.map((section) => (
                <li key={section.title}>
                  <a
                    href={`#${slugify(section.title)}`}
                    className="text-gray-700 hover:text-yellow-700 hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={section.title} id={slugify(section.title)} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-baseline gap-3">
                  <span className="text-yellow-600 text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>

                {Array.isArray(section.content) ? (
                  <ul className="space-y-2 list-disc list-outside pl-5">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-gray-700 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-xl bg-yellow-50 border border-yellow-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Questions about these terms?</h2>
            <p className="text-gray-700 text-sm mb-4">
              Our team is happy to clarify anything before you book.
            </p>
            <Link
              href="/contact"
              className="inline-block px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
