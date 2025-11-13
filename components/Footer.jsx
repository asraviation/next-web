"use client";

import Link from "next/link";
import Head from "next/head";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Aboreto, Raleway } from "next/font/google";

const aboreto = Aboreto({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aboreto",
});
const raleway = Raleway({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-raleway",
});

export default function Footer() {
  const footerSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ASR Aviation",
    url: "https://asraviation.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+91-9829538079",
      email: "ceo@asraviation.com",
    },
    sameAs: [
      "https://www.linkedin.com/company/asr-aviation/",
      "https://www.instagram.com/asr.aviation/",
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(footerSchema) }}
        />
      </Head>

      <footer
        className={`${raleway.className} bg-[#2B2B2B] text-white`}
        style={{
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: "26.4px",
          letterSpacing: "0%",
        }}
      >
        <div className="px-4 md:px-8 py-8 md:pt-16 md:pb-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Desktop logo (top-left) */}
            <div className="hidden lg:block absolute top-16 left-8">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bd5679a296c2d74506e4e1cd2f187d17ee78eb34"
                className="w-16 h-14"
                alt="ASR Aviation Logo"
              />
            </div>

            {/* Wordmark */}
            <div className="text-center mb-8 md:mb-12">
              <div className="flex flex-col items-center">
                {/* Mobile logo */}
                <div className="lg:hidden mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/bd5679a296c2d74506e4e1cd2f187d17ee78eb34"
                    className="w-12 h-10 mx-auto"
                    alt="ASR Aviation Logo"
                  />
                </div>

                <span
                  className={`${aboreto.className} text-[#DAA520]`}
                  style={{
                    fontWeight: 400,
                    fontSize: "93.83px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                  }}
                >
                  ASR
                </span>
                <span className="text-lg md:text-2xl lg:text-3xl text-[#DAA520] tracking-[6px] md:tracking-[8px] lg:tracking-[10px] -mt-1 md:-mt-2">
                  Aviation
                </span>
              </div>
            </div>

            {/* Grid links */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 md:gap-8 items-start">
              <div className="flex flex-col space-y-3 md:space-y-4 text-center lg:text-left">
                <Link href="/" className="hover:text-[#DAA520] transition-colors">
                  Home
                </Link>
                <Link href="http://localhost:3001/" className="hover:text-[#DAA520] transition-colors">
                  Fleet
                </Link>
                <Link href="http://localhost:3001/about" className="hover:text-[#DAA520] transition-colors">
                  About Us
                </Link>
              </div>

              <div className="flex flex-col space-y-3 md:space-y-4 text-center lg:text-left">
                <Link href="/faq" className="hover:text-[#DAA520] transition-colors">
                  FAQ
                </Link>
                <Link href="http://localhost:3001/contact" className="hover:text-[#DAA520] transition-colors">
                  Contact Us
                </Link>
                <Link href="/terms" className="hover:text-[#DAA520] transition-colors">
                  Terms and condition
                </Link>
              </div>

              {/* Contact + Community */}
              <div className="text-center lg:col-span-2 order-first lg:order-none">
                {/* Contact split */}
                <div className="mb-6 md:mb-8">
                  <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start lg:gap-8">
                    <div className="mb-4 lg:text-sm lg:mb-0">
                      <div className="space-y-1">
                        <div className="flex flex-col">
                          <span className="mb-1">Email:</span>
                          <a
                            href="mailto:ceo@asraviation.com"
                            className="hover:text-[#DAA520] transition-colors break-all ml-1"
                          >
                            ceo@asraviation.com
                          </a>
                        </div>
                        <div>
                          <a
                            href="mailto:ceo.asr.aviation@gmail.com"
                            className="hover:text-[#DAA520] transition-colors break-all"
                          >
                            ceo.asr.aviation@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block w-px bg-white h-16" />

                    <div className="lg:text-sm">
                      <div className="flex flex-col">
                        <span className="mb-1">Phone:</span>
                        <a href="tel:+919829538079" className="hover:text-[#DAA520] transition-colors">
                          +919829538079
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community link (Aboreto) */}
                <div className="text-center">
                  <a
                    href="https://chat.whatsapp.com/KiOiQr6pVKf44DMu8vUe6X"
                    className={`${aboreto.className} text-gray-100 hover:text-[#DAA520] transition-colors`}
                  >
                    JOIN COMMUNITY TO STAY UPDATED
                  </a>
                </div>
              </div>

              <div className="flex flex-col space-y-3 md:space-y-4 text-center lg:text-right">
                <Link href="/blog" className="hover:text-[#DAA520] transition-colors">
                  Blog
                </Link>
                <Link href="/careers" className="hover:text-[#DAA520] transition-colors">
                  Career
                </Link>
                <Link href="/leg-deals" className="hover:text-[#DAA520] transition-colors">
                  Leg Deals
                </Link>
              </div>

              {/* Social icons */}
              <div className="flex justify-center">
                <div className="flex">
                  <a
                    href="https://www.linkedin.com/company/asr-aviation/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DAA520] transition-colors p-2"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin size={24} />
                  </a>
                  <a
                    href="https://www.instagram.com/asr.aviation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DAA520] transition-colors p-2"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 md:py-6">
          <div className="px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-center items-center text-gray-400 text-center">
              <span>© 2025 ASR Aviation. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
