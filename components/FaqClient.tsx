"use client";

// FAQ — searchable accordion.
//
// Ported from New-ASR-Client/src/pages/Faq.jsx. react-helmet moved to Next
// metadata on the page, react-router's useNavigate to next/navigation.

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaSearch } from "react-icons/fa";
// @ts-expect-error — plain JS data module ported from the ASR client
import faqData from "@/lib/faq-data";

interface Question {
  question: string;
  answer: string;
}
interface Category {
  category: string;
  questions: Question[];
}

export default function FaqClient() {
  const categories = faqData as Category[];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const totalQuestions = useMemo(
    () => categories.reduce((sum, c) => sum + c.questions.length, 0),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [categories, query]);

  const matchCount = useMemo(
    () => filtered.reduce((sum, c) => sum + c.questions.length, 0),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50/30 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400/10 via-yellow-300/20 to-yellow-400/10 pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-yellow-500" />
            Support
            <span className="w-8 h-[2px] bg-yellow-500" />
          </p>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            Frequently Asked{" "}
            <em className="italic font-light text-gray-700">Questions</em>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about flying with ASR Aviation. Can&apos;t
            find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-yellow-700 underline hover:text-yellow-800">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200/50 p-6 sm:p-8 mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <FaSearch className="text-yellow-500 text-lg" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search frequently asked questions"
              className="w-full h-14 pl-12 pr-6 bg-gray-50 rounded-xl border-2 border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">
              {query
                ? `${matchCount} of ${totalQuestions} questions match`
                : `${totalQuestions} questions across ${categories.length} categories`}
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-yellow-500 text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">No matches</h2>
            <p className="text-gray-600 mb-6">
              Nothing matched &ldquo;{query}&rdquo;. Try a different term, or ask us directly.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact us
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {filtered.map((category) => (
              <section key={category.category}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-yellow-500" />
                  {category.category}
                  <span className="text-sm font-normal text-gray-400">
                    {category.questions.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {category.questions.map((item) => {
                    const key = `${category.category}::${item.question}`;
                    const isOpen = open === key;

                    return (
                      <div
                        key={key}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpen(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-yellow-50/50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{item.question}</span>
                          <FaChevronDown
                            className={`text-yellow-500 shrink-0 transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 -mt-1">
                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
