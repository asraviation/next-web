// About Us.
//
// Ported from New-ASR-Client/src/pages/AboutUs.jsx. Copy is carried over
// verbatim; bundled image imports became /public/asr paths.

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us — ASR Aviation",
  description:
    "Learn about ASR Aviation's commitment to excellence in private aviation. Meet our founder Anirudh Singh Chauhan and discover our expertise in aircraft charter services.",
};

const PILLARS = [
  {
    title: "Who We Are",
    body: "At ASR Aviation, we are a team of experienced aviation consultants, dedicated to providing top-tier consulting services. We pride ourselves on our attention to detail and our ability to deliver results that consistently exceed expectations.",
  },
  {
    title: "What We Do",
    body: "We offer a range of aviation services, including Private Charters, Business Flights, Air Joyrides, Air Ambulance, Aircraft Management, and Aviation Finance. By working closely with our clients, we gain a deep understanding of their needs and deliver customized solutions that meet their unique requirements with precision and care.",
  },
  {
    title: "Our Experience",
    body: "With decades of combined experience in the aviation industry, our team has worked with clients globally. We have a deep understanding of the aviation market and a proven track record of delivering successful results. Take a look at our community and see how we've made a difference.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">About Us</span>
          </nav>

          {/* Expertise & Approach */}
          <div className="grid gap-10 md:grid-cols-2 mb-20">
            <div>
              <img
                src="/asr/offer3.png"
                alt="Our Expertise"
                className="w-full h-56 object-cover rounded-2xl mb-6"
              />
              <h2 className="text-3xl font-semibold text-gray-800 mb-3">Our Expertise</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At ASR Aviation, we redefine travel with unparalleled private jet
                services tailored to your needs. Whether it&apos;s a luxurious
                joyride or a seamless business trip, we offer exclusive deals and
                a first-class experience that exceeds expectations.
              </p>
            </div>

            <div>
              <img
                src="/asr/offer2.png"
                alt="Our Approach"
                className="w-full h-56 object-cover rounded-2xl mb-6"
              />
              <h2 className="text-3xl font-semibold text-gray-800 mb-3">Our Approach</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                With deep aviation industry expertise, we understand the
                challenges our clients face. By combining industry knowledge with
                cutting-edge technology, we deliver innovative solutions that
                ensure efficiency, luxury, and success in every journey.
              </p>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-14">
            About ASR Aviation
          </h1>

          {/* Pillars */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-semibold text-[#9C7167] mb-4">{pillar.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{pillar.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-20">
            <a
              href="https://chat.whatsapp.com/KiOiQr6pVKf44DMu8vUe6X"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              JOIN OUR COMMUNITY
            </a>
          </div>

          {/* Founder */}
          <div className="border-t border-gray-200 pt-16">
            <h2 className="text-4xl font-semibold text-[#9C7167] text-center mb-12">
              About Founder
            </h2>

            <div className="grid gap-10 md:grid-cols-5 items-center">
              <div className="md:col-span-2">
                <img
                  src="/asr/anirudh.png"
                  alt="Anirudh Singh Chauhan, CEO & Director of ASR Aviation"
                  className="w-full rounded-2xl object-cover"
                />
              </div>

              <div className="md:col-span-3">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Anirudh Singh Chauhan | CEO &amp; Director
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Meet our founder, Anirudh Singh Chauhan, a visionary leader with
                  a deep-rooted passion for aviation. Trained by the Indian Air
                  Force, Anirudh brings unparalleled expertise, discipline, and
                  innovation to the global aviation industry. With a mission to
                  transform air travel worldwide, he is leveraging cutting-edge
                  technology and decades of experience to make private and
                  emergency air services more efficient, accessible and safe.
                </p>

                <Link
                  href="/contact"
                  className="mt-6 inline-block px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
