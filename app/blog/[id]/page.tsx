// Blog post.
//
// Ported from New-ASR-Client/src/data/BlogDetailPage.jsx, which addressed
// posts by their index in blogData. Kept identical so existing links work.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
// @ts-expect-error — plain JS data module ported from the ASR client
import blogData from "@/lib/blog-data";

interface Post {
  title: string;
  date: string;
  summary: string;
  content: string;
  image: string;
}

const posts = blogData as Post[];

export function generateStaticParams() {
  return posts.map((_, index) => ({ id: String(index) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = posts[Number(id)];
  if (!post) return { title: "Post not found — ASR Aviation" };

  return { title: `${post.title} — ASR Aviation`, description: post.summary };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = Number(id);
  const post = Number.isInteger(index) ? posts[index] : undefined;
  if (!post) notFound();

  const others = posts.map((p, i) => ({ ...p, i })).filter((p) => p.i !== index).slice(0, 3);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-gray-800">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Article</span>
          </nav>

          <p className="text-xs uppercase tracking-wide text-yellow-600 font-semibold mb-3">
            {post.date}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-2xl mb-8 object-cover max-h-[420px]"
          />

          <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
            {post.summary}
          </p>
          <p className="text-gray-700 text-lg leading-relaxed tracking-wide whitespace-pre-line">
            {post.content}
          </p>
        </article>

        {others.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More articles</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.i}
                  href={`/blog/${other.i}`}
                  className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img src={other.image} alt={other.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <p className="text-xs text-yellow-600 font-semibold mb-1">{other.date}</p>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-yellow-700">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
