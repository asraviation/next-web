"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK_AIRPORTS = [
  { code: "BOM", city: "Mumbai",        name: "Chhatrapati Shivaji Intl" },
  { code: "DEL", city: "Delhi",         name: "Indira Gandhi Intl" },
  { code: "BLR", city: "Bengaluru",     name: "Kempegowda Intl" },
  { code: "HYD", city: "Hyderabad",     name: "Rajiv Gandhi Intl" },
  { code: "MAA", city: "Chennai",       name: "Chennai Intl" },
  { code: "CCU", city: "Kolkata",       name: "Netaji Subhas Chandra Bose Intl" },
  { code: "PNQ", city: "Pune",          name: "Pune Airport" },
  { code: "GOI", city: "Goa",           name: "Manohar Intl (Mopa)" },
  { code: "COK", city: "Kochi",         name: "Cochin Intl" },
  { code: "DXB", city: "Dubai",         name: "Dubai Intl" },
  { code: "DOH", city: "Doha",          name: "Hamad Intl" },
  { code: "LHR", city: "London",        name: "Heathrow" },
];

export default function AirportAutosuggest({
  placeholder = "Airport, city or code",
  value,
  onChange,             // (string) -> void
  inputRef,             // optional external ref
  apiUrl,               // optional: e.g. "/api/airports" -> returns [{code, city, name}]
  className = "",
  maxItems = 8,
}) {
  const internalRef = useRef(null);
  const ref = inputRef || internalRef;

  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [airports, setAirports] = useState(FALLBACK_AIRPORTS);
  const [loading, setLoading] = useState(false);

  // Fetch airports if apiUrl provided
  useEffect(() => {
    let abort = false;
    const fetchAirports = async () => {
      if (!apiUrl) return;
      try {
        setLoading(true);
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch airports");
        const data = await res.json();
        if (!abort && Array.isArray(data) && data.length) {
          // normalize keys if needed
          const mapped = data.map((a) => ({
            code: a.code || a.iata || a.IATA || "",
            city: a.city || a.City || a.location || "",
            name: a.name || a.airport || a.label || "",
          })).filter(a => a.code || a.city || a.name);
          setAirports(mapped);
        }
      } catch (e) {
        // fall back silently
      } finally {
        !abort && setLoading(false);
      }
    };
    fetchAirports();
    return () => { abort = true; };
  }, [apiUrl]);

  // Filter
  const items = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return airports.slice(0, maxItems);
    return airports
      .filter(a =>
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.city && a.city.toLowerCase().includes(q)) ||
        (a.name && a.name.toLowerCase().includes(q))
      )
      .slice(0, maxItems);
  }, [value, airports, maxItems]);

  // Open dropdown on focus/type; close on click-away/blur
  useEffect(() => {
    const handleClickAway = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target) && !listRef.current?.contains(e.target)) {
        setOpen(false);
        setCursor(-1);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [ref]);

  const commit = (airport) => {
    const label = displayText(airport);
    onChange?.(label);
    setOpen(false);
    setCursor(-1);
    // move focus back to input
    setTimeout(() => ref.current?.focus(), 0);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      if (open && cursor >= 0 && items[cursor]) {
        e.preventDefault();
        commit(items[cursor]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setCursor(-1);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => { onChange?.(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full h-12 px-4 bg-white rounded-xl border focus:border-emerald-400 outline-none"
        autoComplete="off"
      />
      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-auto"
          role="listbox"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading airports…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
          )}
          {!loading && items.map((a, i) => (
            <button
              key={`${a.code}-${i}`}
              type="button"
              role="option"
              onMouseDown={(e) => e.preventDefault()} // avoid input blur before click
              onClick={() => commit(a)}
              onMouseEnter={() => setCursor(i)}
              className={`w-full text-left px-4 py-2.5 text-sm ${
                i === cursor ? "bg-emerald-50" : "bg-white"
              } hover:bg-emerald-50 transition`}
            >
              <div className="font-medium text-gray-900">
                {a.city}{a.city && a.name ? " — " : ""}{a.name}
              </div>
              <div className="text-xs text-gray-500">{a.code}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function displayText(a) {
  // What gets written into the input after selection:
  // "City — Airport Name (CODE)"
  const city = a.city ? a.city : "";
  const name = a.name ? a.name : "";
  const sep = city && name ? " — " : "";
  const code = a.code ? ` (${a.code})` : "";
  return `${city}${sep}${name}${code}`.trim();
}
