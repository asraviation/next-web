"use client";
import { useEffect, useRef, useState } from "react";

import AirportAutosuggest from "@/components/AirportAutosuggest";
import Calendar from "@/components/Calender";
import Portal from "@/components/Portal";

/* Segmented toggles (unchanged) */
function Segmented({ options, value, onChange, className = "", ariaLabel }) {
  return (
    <div className={`inline-flex rounded-xl border bg-white p-1 ${className}`} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <label
            key={o.key}
            className={`cursor-pointer px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
              ${active ? (o.activeClass || "bg-emerald-600 text-white shadow") : "text-gray-700 hover:bg-gray-100"}`}
          >
            <input type="radio" className="sr-only" name={ariaLabel} value={o.key} checked={active} onChange={() => onChange(o.key)} />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
const AircraftTypeToggle = (p) => (
  <Segmented {...p} ariaLabel="Aircraft type" options={[
    { key: "jet", label: "Jet", activeClass: "bg-black text-white shadow" },
    { key: "helicopter", label: "Helicopter", activeClass: "bg-black text-white shadow" },
  ]}/>
);
const BookingTypeToggle = (p) => (
  <Segmented {...p} ariaLabel="Booking type" options={[
    { key: "charter", label: "Charter" },
    { key: "seat", label: "Seat" },
  ]}/>
);
const TripTypeToggle = (p) => (
  <Segmented {...p} ariaLabel="Trip type" options={[
    { key: "one-way", label: "One Way" },
    { key: "round-trip", label: "Round Trip" },
    { key: "multi-trip", label: "Multi Trip" },
  ]}/>
);

export default function HeroDocking({
  ctaText = "Book Flight",
  onSubmit,
  revealTopThresholdVH = -0.1,
  revealBottomThresholdVH = 0.75,
}) {
  const heroRef = useRef(null);
  const [showForm, setShowForm] = useState(false);

  const [aircraftType, setAircraftType] = useState("jet");
  const [bookingType, setBookingType] = useState("charter");
  const [tripType, setTripType] = useState("one-way");

  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [dateValue, setDateValue] = useState("");

  // Calendar portal
  const [showCalendar, setShowCalendar] = useState(false);
  const dateInputRef = useRef(null);
  const calPortalRef = useRef(null);
  const [calPos, setCalPos] = useState({ top: 0, left: 0, width: 320 });

  // Reveal logic
  useEffect(() => {
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const reveal = rect.top < vh * revealTopThresholdVH || rect.bottom < vh * revealBottomThresholdVH;
      setShowForm(reveal);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [revealTopThresholdVH, revealBottomThresholdVH]);

  const handleSwap = () => {
    const a = fromValue, b = toValue;
    setFromValue(b);
    setToValue(a);
  };

  const handleDateSelected = (y, m, d) => {
    const dt = new Date(y, m, d);
    const label = dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    setDateValue(label);
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    onSubmit?.({
      aircraftType,
      bookingType,
      tripType,
      from: fromValue,
      to: toValue,
      dateLabel: dateValue,
      dateISO: dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "",
    });
  };

  // Portal calendar positioning
  const positionCalendar = () => {
    const el = dateInputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCalPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 320) });
  };
  useEffect(() => {
    if (!showCalendar) return;
    positionCalendar();
    const onWin = () => positionCalendar();
    const onKey = (e) => { if (e.key === "Escape") setShowCalendar(false); };
    const onClickAway = (e) => {
      const input = dateInputRef.current;
      const panel = calPortalRef.current;
      if (!panel || !input) return;
      if (!panel.contains(e.target) && !input.contains(e.target)) setShowCalendar(false);
    };
    window.addEventListener("scroll", onWin, { passive: true });
    window.addEventListener("resize", onWin);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickAway);
    return () => {
      window.removeEventListener("scroll", onWin);
      window.removeEventListener("resize", onWin);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickAway);
    };
  }, [showCalendar]);

  return (
    <div
      ref={heroRef}
      /* MOBILE: give extra height & allow overflow so the form never clips.
         DESKTOP: keep your old behavior. No high z here so Navbar is safe. */
      className="relative bg-cover bg-center bg-no-repeat overflow-visible md:overflow-hidden min-h-[120vh] md:min-h-screen"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      {/* Plane layer (kept behind) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="animate-float">
          <img src="/plane.png" alt="ASR Private Jet" className="w-[1500px] h-auto drop-shadow-2xl" />
        </div>
      </div>

      {/* CENTER: on mobile this container is in normal flow;
         on ≥md it becomes absolute overlay like before */}
      <div className="relative z-10 flex flex-col items-center md:absolute md:inset-0 md:flex md:items-center md:justify-center">
        {/* Tagline (mobile: margin pushes it down; desktop: same look) */}
        <div
          className={`transition-opacity duration-300 ease-out will-change-[opacity] ${
            showForm ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          /* MOBILE offset roughly matches your old 32rem feel without pushing out of view */
          style={{ marginTop: "28rem" }}
        >
          <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wide drop-shadow-lg text-center">
            {/*ASR Aviation – Elevating Luxury, Redefining Air Travel.*/}
          </h1>
        </div>

        {/* Docked form:
            - MOBILE: static block (no absolute), margin-top pulls it into view and never clips
            - ≥MD: absolute at your old 64% position */}
        <div
          className={`w-full px-4 transition-all duration-300 ease-out will-change-[opacity,transform]
            ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
            mt-10 md:mt-0 md:absolute md:top-[64%]`}
        >
          <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-4 md:p-6">
            {/* Toggles row */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
              <AircraftTypeToggle value={aircraftType} onChange={setAircraftType} />
              <BookingTypeToggle value={bookingType} onChange={setBookingType} />
              <TripTypeToggle value={tripType} onChange={setTripType} />
            </div>

            {/* From | Swap | To */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-start">
              <AirportAutosuggest placeholder="From" value={fromValue} onChange={setFromValue} />

              <div className="flex items-center justify-center">
                <button
                  onClick={handleSwap}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full border bg-white shadow flex items-center justify-center"
                  aria-label="Swap From and To" title="Swap"
                >
                  ⇅
                </button>
              </div>

              <AirportAutosuggest placeholder="To" value={toValue} onChange={setToValue} />
            </div>

            {/* Date + CTA */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4">
              <div className="relative">
                <input
                  ref={dateInputRef}
                  data-date-input
                  readOnly
                  value={dateValue}
                  placeholder="Select date"
                  onClick={() => {
                    setShowCalendar((v) => !v);
                    if (!showCalendar) setTimeout(positionCalendar, 0);
                  }}
                  className="w-full h-12 px-4 bg-white rounded-xl border focus:border-emerald-400 outline-none"
                />
                {showCalendar && (
                  <Portal>
                    <div
                      ref={calPortalRef}
                      className="fixed z-[99999]"
                      style={{ top: calPos.top, left: calPos.left, width: calPos.width }}
                    >
                      <Calendar onSelectDate={handleDateSelected} />
                    </div>
                  </Portal>
                )}
              </div>

              <div className="flex md:justify-end">
                <button
                  onClick={handleSubmit}
                  className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 transition"
                >
                  {ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE padding bottom so the static form never gets cut by viewport end */}
        <div className="h-16 md:hidden" />
      </div>

      {/* Very light overlay for readability (kept behind center stack) */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
    </div>
  );
}
