'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// IMPORTANT: For this import to work in TypeScript, enable `"resolveJsonModule": true` in tsconfig.json
import airportsData from '../airports.json';

type ProductType = 'charter' | 'seat' | 'helicopter';
type TripType = 'one' | 'round' | 'multi';

interface Airport {
  id: number | string;
  label: string;
}

/** Configure where the booking lands */
const BOOK_DEST =
  process.env.NEXT_PUBLIC_FLEET_URL /* e.g. https://asraviation.com/fleet-new */
  || 'http://localhost:3001/fleet-new';

/** Build a URL with encoded query params */
function buildBookingURL(base: string, payload: Record<string, string>) {
  const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== '') params.set(k, String(v).trim());
  });
  url.search = params.toString();
  return url.toString();
}

export default function ScriptlessBookingPanel() {
  const [show, setShow] = useState(false);

  // Product and trip
  const [product, setProduct] = useState<ProductType>('charter');
  const [trip, setTrip] = useState<TripType>('one');

  // From/To
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Outbound date/time
  const [dateStr, setDateStr] = useState<string>(''); // YYYY-MM-DD
  const [timeStr, setTimeStr] = useState<string>(''); // HH:MM
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);

  // Return date/time (for round trip)
  const [returnDateStr, setReturnDateStr] = useState<string>(''); // YYYY-MM-DD
  const [returnTimeStr, setReturnTimeStr] = useState<string>(''); // HH:MM
  const returnDateRef = useRef<HTMLInputElement | null>(null);
  const returnTimeRef = useRef<HTMLInputElement | null>(null);

  // Airports dataset
  const [airports] = useState<Airport[]>(airportsData as Airport[]);
  const [airportsLoaded] = useState(true);

  // ultra-sensitive reveal within hero
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const vh = window.innerHeight;
      if (y <= vh) setShow(y > 5);
    };
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY <= window.innerHeight && e.deltaY > 1) setShow(true);
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => (touchStartY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - e.touches[0].clientY;
      if (window.scrollY <= window.innerHeight && dy > 1) setShow(true);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const formattedDate = (() => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = dt.toLocaleString(undefined, { month: 'short' });
      const year = dt.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  })();

  const formattedReturnDate = (() => {
    if (!returnDateStr) return '';
    try {
      const [y, m, d] = returnDateStr.split('-').map(Number);
      const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = dt.toLocaleString(undefined, { month: 'short' });
      const year = dt.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return returnDateStr;
    }
  })();

  const bookNow = () => {
    if (!from.trim() || !to.trim()) {
      alert('Please select both From and To.');
      return;
    }
    if (!dateStr.trim() || !timeStr.trim()) {
      alert('Please select date and time.');
      return;
    }
    if (trip === 'round' && (!returnDateStr.trim() || !returnTimeStr.trim())) {
      alert('Please select return date and time for a round trip.');
      return;
    }

    const payload: Record<string, string> = {
      product,
      trip,
      from,
      to,
      date: dateStr,
      time: timeStr,
    };
    if (trip === 'round') {
      payload.returnDate = returnDateStr;
      payload.returnTime = returnTimeStr;
    }

    const url = buildBookingURL(BOOK_DEST, payload);
    window.location.href = url;
  };

  return (
    <>
      {/* IMPORTANT: No transforms on this wrapper (they can break native pickers) */}
      <div
        className={`
          absolute inset-x-0 bottom-6 sm:bottom-8 md:bottom-10
          z-[50]
          flex justify-center
          transition-opacity duration-500
          ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden={!show}
      >
        {/* DESKTOP/TABLET — responsive width, 3 rows */}
        <div
          className={`
            hidden md:block
            w-[92%] md:w-[90%] lg:w-[86%] max-w-[1100px]
            rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]
            px-5 md:px-7 lg:px-9 py-5 md:py-6
          `}
        >
          {/* Row 1: product group + trip tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 mb-4">
            {/* Product chips (Charter | Seat | Helicopter) */}
            <div className="flex items-center gap-4 md:gap-6">
              <RadioChip
                checked={product === 'charter'}
                onClick={() => setProduct('charter')}
                icon={
                  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M2 13v-2l9-4 1-4h2l1 4 7 2v2l-7 2-1 4h-2l-1-4-9-4z" />
                  </svg>
                }
                label="Charter"
              />
              <RadioChip
                checked={product === 'seat'}
                onClick={() => setProduct('seat')}
                icon={
                  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 4h7v7H9v3H7V4z" />
                    <path d="M9 14h10v3H9z" />
                  </svg>
                }
                label="Seat"
              />
              <RadioChip
                checked={product === 'helicopter'}
                onClick={() => setProduct('helicopter')}
                icon={
                  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 6h18v2H3z" />
                    <path d="M3 12h3l2 2h4l1-2h4l1 2h2.5L21 12h1v2h-2l-2.8 3H13l-1.5-2H8l-2-2H3v-2zM5 18h5v2H5z" />
                  </svg>
                }
                label="Helicopter"
              />
            </div>

            {/* Trip tabs */}
            <div className="bg-[#ECF2FF] rounded-full p-1 inline-flex">
              {[
                { key: 'one', label: 'One Way' },
                { key: 'round', label: 'Round Trip' },
                { key: 'multi', label: 'Multi Trip' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTrip(t.key as typeof trip)}
                  className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition
                    ${trip === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: fields (wrap on smaller widths) */}
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <Field
                icon="from"
                placeholder="Where from?"
                value={from}
                onChange={setFrom}
                options={airports}
                loaded={airportsLoaded}
              />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <Field
                icon="to"
                placeholder="Where to?"
                value={to}
                onChange={setTo}
                options={airports}
                loaded={airportsLoaded}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <NativePicker
                type="date"
                value={dateStr}
                onChange={setDateStr}
                inputRef={dateRef}
                placeholder="Select date"
                icon={
                  <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm12 6H5v12h14V8z" />
                  </svg>
                }
                displayValue={formattedDate}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <NativePicker
                type="time"
                value={timeStr}
                onChange={setTimeStr}
                inputRef={timeRef}
                placeholder="Select time"
                icon={
                  <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10V7h-2v7h6v-2h-4z" />
                  </svg>
                }
                displayValue={timeStr}
              />
            </div>

            {/* Return date/time appear only for round trip */}
            {trip === 'round' && (
              <>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <NativePicker
                    type="date"
                    value={returnDateStr}
                    onChange={setReturnDateStr}
                    inputRef={returnDateRef}
                    placeholder="Return date"
                    icon={
                      <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm12 6H5v12h14V8z" />
                      </svg>
                    }
                    displayValue={formattedReturnDate}
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <NativePicker
                    type="time"
                    value={returnTimeStr}
                    onChange={setReturnTimeStr}
                    inputRef={returnTimeRef}
                    placeholder="Return time"
                    icon={
                      <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10V7h-2v7h6v-2h-4z" />
                      </svg>
                    }
                    displayValue={returnTimeStr}
                  />
                </div>
              </>
            )}
          </div>

          {/* Row 3: centered CTA */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={bookNow}
              className="min-w-[200px] h-12 px-8 bg-[#F2B400] hover:bg-[#e0a600] text-white font-semibold rounded-xl shadow-md transition text-base"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* MOBILE — stacked, fully responsive */}
        <div
          className={`
            md:hidden
            w-[92%] max-w-[560px]
            rounded-3xl bg-white/15 backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            px-5 py-6
          `}
        >
          {/* Product chips row (wrap if needed) */}
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <RadioChip
              checked={product === 'charter'}
              onClick={() => setProduct('charter')}
              light
              icon={
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 13v-2l9-4 1-4h2l1 4 7 2v2l-7 2-1 4h-2l-1-4-9-4z" />
                </svg>
              }
              label="Charter"
            />
            <RadioChip
              checked={product === 'seat'}
              onClick={() => setProduct('seat')}
              light
              icon={
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4h7v7H9v3H7V4z" />
                  <path d="M9 14h10v3H9z" />
                </svg>
              }
              label="Seat"
            />
            <RadioChip
              checked={product === 'helicopter'}
              onClick={() => setProduct('helicopter')}
              light
              icon={
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 6h18v2H3z" />
                  <path d="M3 12h3l2 2h4l1-2h4l1 2h2.5L21 12h1v2h-2l-2.8 3H13l-1.5-2H8l-2-2H3v-2z" />
                </svg>
              }
              label="Helicopter"
            />
          </div>

          {/* Trip tabs */}
          <div className="mb-5">
            <div className="bg-white/30 rounded-full p-1 inline-flex">
              {[
                { key: 'one', label: 'One Way' },
                { key: 'round', label: 'Round Trip' },
                { key: 'multi', label: 'Multi Trip' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTrip(t.key as typeof trip)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    trip === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-white/90'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stacked fields */}
          <div className="space-y-4">
            <Field big glass icon="from" placeholder="Where from?" value={from} onChange={setFrom} options={airports} loaded={airportsLoaded} />
            <Field big glass icon="to" placeholder="Where to?" value={to} onChange={setTo} options={airports} loaded={airportsLoaded} />
            <NativePicker
              big
              glass
              type="date"
              value={dateStr}
              onChange={setDateStr}
              inputRef={dateRef}
              placeholder="Select date"
              icon={
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm12 6H5v12h14V8z" />
                </svg>
              }
              displayValue={formattedDate}
            />
            <NativePicker
              big
              glass
              type="time"
              value={timeStr}
              onChange={setTimeStr}
              inputRef={timeRef}
              placeholder="Select time"
              icon={
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10V7h-2v7h6v-2h-4z" />
                </svg>
              }
              displayValue={timeStr}
            />
            {trip === 'round' && (
              <>
                <NativePicker
                  big
                  glass
                  type="date"
                  value={returnDateStr}
                  onChange={setReturnDateStr}
                  inputRef={returnDateRef}
                  placeholder="Return date"
                  icon={
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm12 6H5v12h14V8z" />
                    </svg>
                  }
                  displayValue={formattedReturnDate}
                />
                <NativePicker
                  big
                  glass
                  type="time"
                  value={returnTimeStr}
                  onChange={setReturnTimeStr}
                  inputRef={returnTimeRef}
                  placeholder="Return time"
                  icon={
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10V7h-2v7h6v-2h-4z" />
                    </svg>
                  }
                  displayValue={returnTimeStr}
                />
              </>
            )}
          </div>

          {/* CTA full-width */}
          <button
            onClick={bookNow}
            className="w-full mt-5 h-12 px-8 bg-[#F2B400] hover:bg-[#e0a600] text-white font-semibold rounded-xl shadow-md transition text-base"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Hide native date/time icons (we use our own) */}
      <style jsx global>{`
        input.no-native-icon::-webkit-calendar-picker-indicator { display: none !important; }
        input.no-native-icon::-webkit-clear-button { display: none !important; }
        input.no-native-icon::-webkit-inner-spin-button { display: none !important; }
        input.no-native-icon {
          -webkit-appearance: none;
          -moz-appearance: textfield;
          appearance: none;
        }
      `}</style>
    </>
  );
}

/* ---------- small pieces ---------- */

function RadioChip({
  checked,
  onClick,
  icon,
  label,
  light,
}: {
  checked: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  light?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 select-none">
      <span
        className={`inline-flex w-5 h-5 rounded-full justify-center items-center transition
          ${checked ? 'bg-blue-700' : light ? 'border-2 border-white/60 bg-transparent' : 'border-2 border-gray-300 bg-white'}`}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
      </span>
      <span className={`font-semibold flex items-center gap-2 ${checked ? 'text-blue-700' : light ? 'text-white/90' : 'text-gray-700'}`}>
        {icon}
        {label}
      </span>
    </button>
  );
}

/** NativePicker that opens a temporary input in <body> so the popup is anchored correctly */
function NativePicker({
  type, // 'date' | 'time'
  value,
  onChange,
  inputRef, // kept for API compatibility; not used to summon the popup
  placeholder,
  icon,
  displayValue,
  big,
  glass,
}: {
  type: 'date' | 'time';
  value: string;
  onChange: (v: string) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  placeholder: string;
  icon: React.ReactNode;
  displayValue?: string;
  big?: boolean;
  glass?: boolean;
}) {
  const pad = big ? 'h-14 px-4' : 'h-12 px-4';
  const bg = glass ? 'bg-white/85 backdrop-blur' : 'bg-[#F6F8FB]';
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const summonPicker = () => {
    // Try native showPicker on a body-level, fixed-position input (avoids transform/backdrop bugs)
    try {
      const rect = wrapRef.current?.getBoundingClientRect();
      const temp = document.createElement('input');
      temp.type = type;
      temp.value = value || '';
      temp.className = 'asr-temp-picker';
      Object.assign(temp.style, {
        position: 'fixed',
        top: `${(rect?.top ?? 0) + 8}px`,
        left: `${(rect?.left ?? 0) + 8}px`,
        width: '1px',
        height: '1px',
        opacity: '0',
        zIndex: '2147483647',
        pointerEvents: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'transparent',
      } as CSSStyleDeclaration);

      const cleanup = () => temp.remove();

      temp.addEventListener('change', () => onChange(temp.value));
      temp.addEventListener('input', () => onChange(temp.value));
      temp.addEventListener('blur', cleanup);

      document.body.appendChild(temp);
      // @ts-ignore
      if (typeof temp.showPicker === 'function') {
        // @ts-ignore
        temp.showPicker();
      }
      temp.focus({ preventScroll: true });
      return;
    } catch {
      // fall through to focusing internal input
    }
    // Fallback: focus internal input (may anchor incorrectly on some browsers, but at least opens)
    inputRef.current?.focus();
    // @ts-ignore
    inputRef.current?.showPicker?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      summonPicker();
    }
  };

  return (
    <div
      ref={wrapRef}
      onClick={summonPicker}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      className={`relative flex items-center gap-3 rounded-xl ${bg} text-gray-800 ${pad} cursor-pointer`}
    >
      {icon}

      {/* Keep an internal input to hold value/control; make it readOnly so it doesn't summon its own popup */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        readOnly
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-transparent outline-none cursor-pointer no-native-icon appearance-none
          ${value ? 'text-gray-800' : 'text-transparent'}
        `}
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'none' }}
      />

      {!value ? (
        <span className="pointer-events-none absolute left-11 text-gray-500/90 font-medium text-[15px]">
          {placeholder}
        </span>
      ) : displayValue ? (
        <span className="pointer-events-none absolute left-11 text-gray-800">
          {displayValue}
        </span>
      ) : null}

      <svg className="ml-auto w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M5.25 7.5l4.5 4.5 4.5-4.5H5.25z" />
      </svg>
    </div>
  );
}

/** AUTOCOMPLETE FIELD (From/To) — token-based fuzzy match */
function Field({
  icon,
  placeholder,
  value,
  onChange,
  options = [],
  loaded = false,
  big,
  glass,
}: {
  icon: 'from' | 'to';
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options?: Airport[];
  loaded?: boolean;
  big?: boolean;
  glass?: boolean;
}) {
  const pad = big ? 'h-14 px-4' : 'h-12 px-4';
  const bg = glass ? 'bg-white/85 backdrop-blur' : 'bg-[#F6F8FB]';

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Normalize: lower-case, strip punctuation/extra spaces
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  // Precompute a search key once per airport
  const indexed = useMemo(
    () => options.map((o) => ({ ...o, _search: norm(o.label || String(o)) })),
    [options]
  );

  const filtered = useMemo(() => {
    const q = norm(value);
    if (!q) return indexed.slice(0, 12); // show suggestions when empty/focused
    const tokens = q.split(/\s+/).filter(Boolean);
    const list = indexed.filter((o) => tokens.every((t) => o._search.includes(t)));
    // Prefer starts-with for first token
    list.sort((a, b) => {
      const t0 = tokens[0] || '';
      const aStarts = a._search.startsWith(t0);
      const bStarts = b._search.startsWith(t0);
      return (bStarts ? 1 : 0) - (aStarts ? 1 : 0);
    });
    return list.slice(0, 12);
  }, [indexed, value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlight];
      if (pick) {
        onChange(pick.label);
        setOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className={`flex items-center gap-3 rounded-xl ${bg} text-gray-800 ${pad}`}>
        {icon === 'from' && (
          <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a6 6 0 00-6 6c0 4.6 6 11 6 11s6-6.4 6-11a6 6 0 00-6-6zm0 9a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        )}
        {icon === 'to' && (
          <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a6 6 0 00-6 6c0 4.6 6 11 6 11s6-6.4 6-11a6 6 0 00-6-6z" />
            <path d="M10.8 10.6l-1.6-1.6L8 10.2l2.8 2.8 4.2-4.2-1.2-1.2-3 3z" />
          </svg>
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-gray-500/90 placeholder:font-medium"
          autoComplete="off"
        />
        <svg className="ml-auto w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.25 7.5l4.5 4.5 4.5-4.5H5.25z" />
        </svg>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white border border-gray-100 shadow-xl max-h-64 overflow-auto">
          {!loaded && <div className="px-3 py-2 text-sm text-gray-500">Loading airports…</div>}
          {loaded && filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
          ) : (
            loaded &&
            filtered.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(opt.label);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition ${
                  idx === highlight ? 'bg-[#ECF2FF] text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
