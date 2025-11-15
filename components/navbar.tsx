'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Aboreto, Raleway } from 'next/font/google';
import { useAuth } from '../shared/AuthProvider'; // ⬅️ IMPORTANT

// ⬇️ Load the exact same fonts used in the Footer
const aboreto = Aboreto({
  weight: '400',
  subsets: ['latin'],
});
const raleway = Raleway({
  weight: '400',
  subsets: ['latin'],
});

type AnyUser = {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  profile?: string;
  [k: string]: unknown;
};

const taxipage = "https://asr-taxipage.vercel.app/"; // ✅ base URL

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  // ⬇️ Read current auth state from context
  const { user: rawUser, authLoaded } = useAuth() as {
    user: AnyUser | null | undefined;
    authLoaded: boolean;
  };

  const displayName =
    (rawUser?.name as string) ||
    (rawUser?.fullName as string) ||
    (rawUser?.username as string) ||
    (rawUser?.email as string) ||
    '';

  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Solid gray when hovering desktop links; otherwise your original backgrounds
  const navBgClass = isHoveringLink
    ? 'bg-gray-700 shadow-lg' // clearly gray (not black)
    : scrolled
    ? 'bg-black/40 backdrop-blur-md shadow-lg'
    : 'bg-black/20 backdrop-blur-md';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ease-in-out ${navBgClass}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Brand (stacked: ASR on top in Aboreto, Aviation below in Raleway) */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ASR Logo"
                width={40}
                height={40}
                className="w-15 h-15"
                priority
              />
              <div className="flex flex-col leading-none">
                {/* ASR: Aboreto, golden, elegant */}
                <span
                  className={`${aboreto.className} text-[#DAA520] text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-none`}
                >
                  ASR
                </span>
                {/* Aviation: Raleway, uppercase, wide tracking */}
                <span
                  className={`${raleway.className} uppercase text-[#DAA520] tracking-[0.35em] text-[10px] sm:text-xs md:text-sm -mt-1`}
                >
                  Aviation
                </span>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div
              className="hidden md:flex items-center gap-8"
              onMouseEnter={() => setIsHoveringLink(true)}
              onMouseLeave={() => setIsHoveringLink(false)}
            >
              <Link
                href="/"
                className="text-yellow-500 font-medium hover:text-yellow-400 transition-colors tracking-wide text-sm md:text-base"
              >
                HOME
              </Link>
              <Link
                href={`${taxipage}fleet`}
                className="text-white font-medium hover:text-yellow-500 transition-colors tracking-wide text-sm md:text-base"
              >
                FLEET
              </Link>
              <Link
                href={`${taxipage}about`}
                className="text-white font-medium hover:text-yellow-500 transition-colors tracking-wide text-sm md:text-base"
              >
                ABOUT
              </Link>
              <Link
                href={`${taxipage}contact`}
                className="text-white font-medium hover:text-yellow-500 transition-colors tracking-wide text-sm md:text-base"
              >
                CONTACT
              </Link>

              {/* 🔒 Auth-aware slot — only decide after authLoaded to avoid hydration mismatch */}
              {!authLoaded ? (
                <div className="w-16 h-6" />
              ) : rawUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-[#DAA520] grid place-items-center text-white text-sm">
                    {initial}
                  </div>
                  <span className="text-white/90 text-sm md:text-base font-medium tracking-wide">
                    {displayName}
                  </span>
                </div>
              ) : (
                <Link
                  href={`${taxipage}login`}
                  className="text-white font-medium hover:text-yellow-500 transition-colors tracking-wide text-sm md:text-base"
                >
                  LOGIN
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-yellow-400 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed top-0 bottom-0 right-0 w-3/4 max-w-xs bg-gray-900/95 backdrop-blur-xl shadow-2xl p-8 transition-transform duration-500 ease-in-out transform ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Logo inside dropdown (same stacked brand treatment) */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="ASR Logo" width={40} height={40} className="w-10 h-10" />
                <div className="flex flex-col leading-none">
                  <span className={`${aboreto.className} text-[#DAA520] text-2xl leading-none`}>ASR</span>
                  <span className={`${raleway.className} uppercase text-[#DAA520] tracking-[0.35em] text-[11px] -mt-1`}>
                    Aviation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Close mobile menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-6 pt-6">
              <Link
                href="/"
                className="text-gray-50 text-lg font-semibold hover:text-yellow-400 transition-colors tracking-wide border-b border-gray-700 pb-4"
              >
                HOME
              </Link>
              <Link
                href={`${taxipage}fleet`}
                className="text-gray-50 text-lg font-semibold hover:text-yellow-400 transition-colors tracking-wide border-b border-gray-700 pb-4"
              >
                FLEET
              </Link>
              <a
                href={`${taxipage}about`}
                className="text-gray-50 text-lg font-semibold hover:text-yellow-400 transition-colors tracking-wide border-b border-gray-700 pb-4"
                rel="noopener"
              >
                ABOUT
              </a>
              <a
                href={`${taxipage}contact`}
                className="text-gray-50 text-lg font-semibold hover:text-yellow-400 transition-colors tracking-wide border-b border-gray-700 pb-4"
                rel="noopener"
              >
                CONTACT
              </a>

              {/* Auth-aware slot (mobile) */}
              {!authLoaded ? (
                <div className="h-6 border-b border-gray-700 pb-4" />
              ) : rawUser ? (
                <div className="flex items-center gap-3 border-b border-gray-700 pb-4">
                  <div className="w-9 h-9 rounded-full border border-[#DAA520] grid place-items-center text-white text-base">
                    {initial}
                  </div>
                  <span className="text-gray-50 text-lg font-semibold tracking-wide">{displayName}</span>
                </div>
              ) : (
                <a
                  href={`${taxipage}login`}
                  className="text-gray-50 text-lg font-semibold hover:text-yellow-400 transition-colors tracking-wide border-b border-gray-700 pb-4"
                  rel="noopener"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
