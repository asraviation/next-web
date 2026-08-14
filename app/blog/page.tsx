// Blog index.
//
// Ported from New-ASR-Client/src/pages/Blog.jsx. Posts have no ids in the
// source data, so they are addressed by array index — same as the original.

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
// @ts-expect-error — plain JS data module ported from the ASR client
import blogData from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog — ASR Aviation",
  description:
    "Insights on private jet travel, business aviation and air ambulance services from ASR Aviation.",
};

interface Post {
  title: string;
  date: string;
  summary: string;
  content: string;
  image: string;
}

export default function BlogPage() {
  const posts = blogData as Post[];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Blog</span>
          </nav>

          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Insights on private aviation, business travel and emergency air services.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={index}
                href={`/blog/${index}`}
                className="group flex flex-col rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow bg-white"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs uppercase tracking-wide text-yellow-600 font-semibold mb-2">
                    {post.date}
                  </p>
                  <h2 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-yellow-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 flex-1">{post.summary}</p>
                  <span className="mt-4 text-sm font-semibold text-yellow-700 inline-flex items-center gap-1">
                    Read more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
