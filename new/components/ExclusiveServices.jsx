"use client";

import React, { useRef, useEffect, useState } from "react";

const SCROLL_SPEED = 60; // px/second

const serviceCards = [
  {
    img: "/Frame91.png",
    alt: "Luxury Private Jet Interior",
    title: "Luxury Travel",
    desc: "Experience ultimate comfort in our premium private jets",
    obj: "0% 50%",
  },
  {
    img: "/Frame90.png",
    alt: "Helicopter Wedding Service",
    title: "Wedding Services",
    desc: "Make your special day unforgettable with helicopter arrivals",
    obj: "20% 50%",
  },
  {
    img: "/Frame95.png",
    alt: "Helicopter Sightseeing Tours",
    title: "Sightseeing Tours",
    desc: "Discover breathtaking views from above",
    obj: "40% 50%",
  },
  {
    img: "/Frame93.png",
    alt: "Mountain Helicopter Services",
    title: "Mountain Adventures",
    desc: "Access remote destinations with ease and style",
    obj: "60% 50%",
  },
  {
    img: "/Frame92.png",
    alt: "Medical Helicopter Services",
    title: "Medical Services",
    desc: "Emergency medical transport when time matters most",
    obj: "80% 50%",
  },
  {
    img: "/Frame94.png",
    alt: "Aerial Photography Services",
    title: "Aerial Photography",
    desc: "Capture stunning aerial perspectives for any occasion",
    obj: "100% 50%",
  },
];

export default function ExclusiveServices() {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate service cards for infinity effect
  const cardContent = (
    <>
      {serviceCards.map((card, i) => (
        <div
          key={i}
          className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer select-none"
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
          </div>
        </div>
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
            {cardContent}
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}
