"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function PlaneAnimation() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const planeRef = useRef<HTMLDivElement | null>(null);
  const planeWRef = useRef(0); // cached plane width in px for calculations

  const [progress, setProgress] = useState(0); // 0..1 within this section
  const [cutVW, setCutVW] = useState(0);       // moving vertical cut in vw%
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial calculation is done
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    let raf = 0;

    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm breakpoint
      setIsTablet(width >= 640 && width < 1024); // sm to lg
    };

    const measurePlane = () => {
      planeWRef.current = planeRef.current?.offsetWidth ?? 0;
    };

    const onResize = () => {
      checkDeviceType();
      measurePlane();
      onScroll(); // recalc cut with new sizes
    };

    const onScroll = () => {
      if (raf) return; // throttle to 1 frame
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sectionRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        // Only start animation when section top reaches screen top (rect.top <= 0)
        // Progress 0 when section just reaches top, 1 when section exits bottom
        const totalScrollable = Math.max(rect.height - vh, 1);
        const scrolledInside = Math.min(Math.max(-rect.top, 0), totalScrollable);
        const p = scrolledInside / totalScrollable;

        // Enhanced easing for smoother movement
        const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
        const smoothstep = (t: number) => t * t * (3 - 2 * t);
        const pe = smoothstep(clamp01(p));

        // Adjust travel range based on device type
        let START_VW, END_VW;
        if (vw < 640) { // Mobile
          START_VW = -90; // Start more off-screen on mobile
          END_VW = 110;   // End more off-screen on mobile
        } else if (vw < 1024) { // Tablet
          START_VW = -75;
          END_VW = 95;
        } else { // Desktop
          START_VW = -65;
          END_VW = 85;
        }

        const planeXvw = START_VW + pe * (END_VW - START_VW);

        const V = window.innerWidth;
        const PLANE_W = planeWRef.current || 0.8 * V;
        // Adjust nose offset for better sync with content wipe
        const NOSE_OFFSET_PX = PLANE_W * 0.1; // 10% of plane width from center to nose

        // Calculate the wipe position based on plane's nose position
        const centerPx = V / 2 + (planeXvw / 100) * V;
        const nosePx = centerPx + PLANE_W / 2 - NOSE_OFFSET_PX;
        const cut = Math.min(Math.max((nosePx / V) * 100, 0), 100);

        setProgress(p);
        setCutVW(cut);
        setIsInitialized(true); // Mark as initialized after first calculation
      });
    };

    // Initial setup
    checkDeviceType();
    const img = planeRef.current?.querySelector("img");
    if (img && (img as any).complete) {
      planeWRef.current = planeRef.current?.offsetWidth ?? 0;
    } else {
      img?.addEventListener("load", () => {
        planeWRef.current = planeRef.current?.offsetWidth ?? 0;
        onScroll();
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Calculate opacity based on cutVW (plane nose position)
  // This ensures text only changes when plane actually touches it
  const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
  const p = clamp01(progress);
  
  // Adjust opacity thresholds based on device
  let fadeStartThreshold = 30;
  let fadeEndThreshold = 70;
  
  if (isMobile) {
    fadeStartThreshold = 20;
    fadeEndThreshold = 80;
  } else if (isTablet) {
    fadeStartThreshold = 25;
    fadeEndThreshold = 75;
  }
  
  // First content - starts fully visible, fades as plane passes over it
  let introOpacity = 1.0;
  if (cutVW > fadeStartThreshold && cutVW < fadeEndThreshold) {
    introOpacity = Math.max(0, 1 - ((cutVW - fadeStartThreshold) / (fadeEndThreshold - fadeStartThreshold)));
  } else if (cutVW >= fadeEndThreshold) {
    introOpacity = 0;
  }
  
  // Second content - starts hidden, fades in as plane reveals it
  let paraOpacity = 0.0;
  if (cutVW > fadeStartThreshold && cutVW < fadeEndThreshold) {
    paraOpacity = Math.min(1, (cutVW - fadeStartThreshold) / (fadeEndThreshold - fadeStartThreshold));
  } else if (cutVW >= fadeEndThreshold) {
    paraOpacity = 1.0;
  }

  // Plane transform calculation
  const smoothstep = (t: number) => t * t * (3 - 2 * t);
  const pe = smoothstep(p);
  
  // Adjust travel range based on current window width
  let START_VW, END_VW;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (vw < 640) { // Mobile
    START_VW = -90;
    END_VW = 110;
  } else if (vw < 1024) { // Tablet
    START_VW = -75;
    END_VW = 95;
  } else { // Desktop
    START_VW = -65;
    END_VW = 85;
  }
  
  const planeXvw = START_VW + pe * (END_VW - START_VW);

  // Get responsive plane size
  const getPlaneSize = () => {
    if (isMobile) return "w-[100vw] max-w-[400px]";
    if (isTablet) return "w-[90vw] max-w-[600px]";
    return "w-[80vw] max-w-[900px]";
  };

  // Don't render content until initial calculation is done to prevent flash
  if (!isInitialized) {
    return (
      <section ref={sectionRef} className="relative min-h-[250vh] bg-white">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Plane - render immediately to get measurements */}
          <div
            ref={planeRef}
            className="absolute top-1/2 z-20 will-change-transform pointer-events-none select-none opacity-0"
            style={{
              left: "50%",
              transform: `translate3d(-50%, -50%, 0) translateX(-65vw)`,
            }}
          >
            <Image
              src="/plane_scroll.png"
              alt="ASR Aviation Aircraft"
              width={900}
              height={380}
              priority
              className={`${getPlaneSize()} h-auto object-contain`}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative min-h-[200vh] sm:min-h-[225vh] lg:min-h-[250vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        
        {/* First content - gets "eaten" by plane (starts visible, gets hidden from left to right) */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:px-16 lg:px-24 text-center z-10"
          style={{
            opacity: introOpacity,
            // Hide from the LEFT as plane moves right (keep showing what's to the right of the cut)
            clipPath: cutVW < 100 ? `polygon(${cutVW}% 0%, 100% 0%, 100% 100%, ${cutVW}% 100%)` : `polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)`,
          }}
        >
          <div className="max-w-3xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6 leading-tight">
              Ultimate Luxury Aviation
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed px-2 sm:px-0">
              <span className="block sm:inline">Experience ultimate luxury travel with ASR Aviation, where opulence meets convenience.</span>
              <span className="hidden sm:inline"> Our premium fleet of private jets and helicopters ensures a journey tailored to exceed expectations.</span>
              <span className="hidden md:inline"> From sophisticated comfort to seamless service, every moment is designed for distinction.</span>
              <span className="hidden lg:inline"> Discover a new standard of aviation that transforms travel into an extraordinary experience.</span>
              {/* Mobile-optimized shorter version */}
              <span className="inline sm:hidden"> Our premium fleet ensures journeys that exceed expectations with sophisticated comfort and seamless service.</span>
            </p>
          </div>
        </div>

        {/* Second content - gets "revealed" by plane (starts hidden, gets shown from left to right) */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:px-8 text-center z-10"
          style={{
            opacity: paraOpacity,
            // Reveal from the LEFT as plane moves right (show what's to the left of the cut)
            clipPath: cutVW > 0 ? `polygon(0% 0%, ${cutVW}% 0%, ${cutVW}% 100%, 0% 100%)` : `polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)`,
          }}
        >
          <div className="max-w-5xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight px-2 sm:px-0">
              <span className="block sm:hidden">Experience Travel with</span>
              <span className="block sm:hidden">ASR Aviation</span>
              <span className="hidden sm:block">Experience Travel with ASR Aviation</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 font-light">
              Where luxury meets the sky
            </p>
            
          </div>
        </div>

        {/* Plane - always on top with enhanced styling */}
        <div
          ref={planeRef}
          className="absolute z-20 will-change-transform pointer-events-none select-none"
          style={{
            left: "50%",
            top: isMobile ? "45%" : "50%", // Slightly higher on mobile for better text visibility
            transform: `translate3d(-50%, -50%, 0) translateX(${planeXvw}vw)`,
            filter: isMobile 
              ? "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25))" 
              : "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3))",
          }}
        >
          <Image
            src="/plane_scroll.png"
            alt="ASR Aviation Aircraft"
            width={900}
            height={380}
            priority
            className={`${getPlaneSize()} h-auto object-contain`}
          />
        </div>

        {/* Progress indicator - smaller on mobile */}
        {/*<div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="w-20 sm:w-24 md:w-32 h-0.5 sm:h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>/*}

        {/* Optional: Mobile scroll hint (only shows at the start) */}
        {progress < 0.05 && isMobile && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}