"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/services";

const SCROLL_SPEED = 60; // px/second

// Cards come from the shared catalogue so a card and its page never drift.
const serviceCards = SERVICES.map((s) => ({
  slug: s.slug,
  img: s.image,
  alt: s.alt,
  title: s.title,
  desc: s.desc,
  obj: s.obj,
}));

export default function ExclusiveServices() {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicated for the infinite-marquee effect. The second copy is hidden from
  // assistive tech so the same links are not announced twice.
  const renderCards = (copy) => (
    <>
      {serviceCards.map((card) => (
        <Link
          key={`${copy}-${card.slug}`}
          href={`/services/${card.slug}`}
          aria-hidden={copy === "clone"}
          tabIndex={copy === "clone" ? -1 : undefined}
          className="service-card group relative block w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer select-none"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={card.img}
            alt={card.alt}
            className="w-full h-full object-cover object-left group-hover:scale-110 transition-transform duration-700 pointer-events-none"
            style={{ objectPosition: card.obj }}
            draggable={false}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-sm opacity-90">{card.desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </>
  );

  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = null;
    const container = scrollRef.current;
    if (!container) return;

    // Only one set width (since duplicated)
    const totalWidth = container.scrollWidth / 2;

    // Scroll logic
    const smoothScroll = (timestamp) => {
      if (isHovered || !container) return;
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const increment = (SCROLL_SPEED * elapsed) / 1000;
      let newScrollLeft = container.scrollLeft + increment;

      if (newScrollLeft >= totalWidth) {
        newScrollLeft = newScrollLeft - totalWidth;
      }

      container.scrollLeft = newScrollLeft;

      animationFrameId = requestAnimationFrame(smoothScroll);
    };

    animationFrameId = requestAnimationFrame(smoothScroll);

    // Prevent manual scroll (wheel, touch)
    const preventScroll = (e) => {
      e.preventDefault();
    };
    container.addEventListener("wheel", preventScroll, { passive: false });
    container.addEventListener("touchstart", preventScroll, { passive: false });
    container.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimestamp = null;
      container.removeEventListener("wheel", preventScroll);
      container.removeEventListener("touchstart", preventScroll);
      container.removeEventListener("touchmove", preventScroll);
    };
  }, [isHovered]);

  return (
    <div className="relative isolate z-0">
      {/* OUTER SHADOWS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-6 h-12 z-[100]"
        style={{ boxShadow: "0 -50px 70px -20px rgba(0,0,0,0.85)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 h-12 z-[100]"
        style={{ boxShadow: "0 50px 70px -20px rgba(0,0,0,0.85)" }}
      />

      {/* SECTION CONTENT */}
      <div className="relative z-0 bg-gray-50 overflow-hidden py-20 font-sans">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-600 mb-4">
            Exclusive Services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto px-4">
            Discover our premium aviation services tailored for luxury, convenience, and unforgettable experiences
          </p>
        </div>

        {/* Horizontal infinite marquee, scroll is disabled */}
        <div
          className="horizontal-scroll-container pb-8 overflow-hidden" // overflow-x-auto removed, now overflow-hidden
          ref={scrollRef}
          // Hover for pause if you want (can remove)
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            scrollBehavior: "auto",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap",
            cursor: "default",
            userSelect: "none",
          }}
        >
          <div className="flex space-x-8 px-8 min-w-max" style={{ display: "inline-flex" }}>
            {renderCards("main")}
            {renderCards("clone")}
          </div>
        </div>
      </div>
    </div>
  );
}
