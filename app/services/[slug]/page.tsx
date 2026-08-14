// Individual service page.
//
// Generated from lib/services.ts, so adding a service there creates its page
// and its carousel link at the same time.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import ServiceEnquiryForm from "@/components/ServiceEnquiryForm";
import { SERVICES, getService } from "@/lib/services";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found — ASR Aviation" };

  return {
    title: `${service.title} — ASR Aviation`,
    description: service.intro.slice(0, 155),
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={service.image}
          alt={service.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: service.obj }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="max-w-6xl mx-auto">
            <nav className="text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{service.title}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{service.title}</h1>
            <p className="text-white/90 mt-2 max-w-2xl">{service.desc}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="text-lg text-gray-700 leading-relaxed">{service.intro}</p>

            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">What's included</h2>
            <ul className="space-y-3">
              {service.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl bg-yellow-50 border border-yellow-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Best suited for</h3>
              <p className="text-gray-700">{service.suitedFor}</p>
            </div>
          </div>

          {/* Lead form */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <ServiceEnquiryForm serviceSlug={service.slug} serviceTitle={service.title} />
            </div>
          </div>
        </div>

        {/* Other services */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Other services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/services/${other.slug}`}
                className="group relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <img
                  src={other.image}
                  alt={other.alt}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: other.obj }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-white font-semibold">{other.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
