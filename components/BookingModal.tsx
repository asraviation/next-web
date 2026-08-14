"use client";

// Book Now flow.
//
// Replaces the previous redirect to an external Vercel page. The customer
// signs in with Google (so the booking is tied to a verified identity and they
// can track its status), then the request is filed through /api/bookings and
// appears in the admin Leads inbox.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import Portal from "@/components/Portal";

export interface BookingDraft {
  product: string;
  trip: string;
  from: string;
  to: string;
  date: string;
  time: string;
  /** Which part of the site raised this. Defaults to the home booking panel. */
  source?: "booking-panel" | "featured-deal";
  /** Snapshot of the featured deal, when the request came from one. */
  deal?: {
    id: number;
    route: string;
    date: string;
    time: string;
    aircraft: string;
    perSeat?: number;
    wholeJet?: number;
  };
}

const PRODUCT_LABEL: Record<string, string> = {
  charter: "Charter",
  seat: "Seat booking",
  helicopter: "Helicopter",
};

const TRIP_LABEL: Record<string, string> = {
  one: "One way",
  round: "Round trip",
  multi: "Multi trip",
};

export default function BookingModal({
  draft,
  onClose,
}: {
  draft: BookingDraft | null;
  onClose: () => void;
}) {
  const [customer, setCustomer] = useState<{ email: string; name: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Who is signed in? The cookie is httpOnly, so ask the server.
  useEffect(() => {
    if (!draft) return;

    let cancelled = false;
    setChecking(true);

    fetch("/api/auth/customer", { cache: "no-store", credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated) setCustomer({ email: data.email, name: data.name });
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecking(false));

    return () => {
      cancelled = true;
    };
  }, [draft]);

  // Close on Escape.
  useEffect(() => {
    if (!draft) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [draft, onClose]);

  const submit = useCallback(async () => {
    if (!draft) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...draft,
          source: draft.source || "booking-panel",
          phone,
          message: notes,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body?.error || "Could not submit your request. Please try again.");
        return;
      }

      setDone(body.id);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [draft, phone, notes]);

  if (!draft) return null;

  // Rendered through a portal: the booking panel applies a CSS transform,
  // which would otherwise make `position: fixed` resolve against the panel
  // instead of the viewport.
  return (
    <Portal>
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm booking request"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Itinerary summary */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm your request</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {draft.source === "featured-deal"
                  ? `Featured deal${draft.deal?.aircraft ? ` · ${draft.deal.aircraft}` : ""}`
                  : `${PRODUCT_LABEL[draft.product] || draft.product} · ${
                      TRIP_LABEL[draft.trip] || draft.trip
                    }`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between gap-3 mb-2">
              <span className="text-gray-500 shrink-0">From</span>
              <span className="font-medium text-gray-900 text-right">{draft.from}</span>
            </div>
            <div className="flex justify-between gap-3 mb-2">
              <span className="text-gray-500 shrink-0">To</span>
              <span className="font-medium text-gray-900 text-right">{draft.to}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 shrink-0">When</span>
              <span className="font-medium text-gray-900 text-right">
                {draft.date} {draft.time && `· ${draft.time}`}
              </span>
            </div>
            {draft.deal?.perSeat ? (
              <div className="flex justify-between gap-3 mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 shrink-0">Per seat</span>
                <span className="font-medium text-gray-900">
                  ₹{draft.deal.perSeat.toLocaleString("en-IN")}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-6">
          {done !== null ? (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900">Request #{done} received</h3>
              <p className="text-gray-600 mt-1 text-sm">
                Our team will confirm availability and pricing shortly.
              </p>
              <Link
                href="/my-bookings"
                className="mt-5 inline-block w-full h-11 leading-[2.75rem] bg-[#F2B400] hover:bg-[#E0A600] text-white font-semibold rounded-lg"
              >
                Track my bookings
              </Link>
              <button onClick={onClose} className="mt-3 text-sm text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
          ) : checking ? (
            <p className="text-center text-gray-500 py-6">Checking your session…</p>
          ) : !customer ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Sign in with Google to place this request. This lets you track its
                status and lets our team reach you.
              </p>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-center">
                <GoogleSignIn
                  endpoint="/api/auth/customer"
                  onAuthSuccess={(data: any) =>
                    setCustomer({ email: data.email, name: data.name })
                  }
                  onAuthError={(message: string) => setError(message)}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Booking as <span className="font-medium text-gray-900">{customer.email}</span>
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                  {error}
                </div>
              )}

              <label htmlFor="booking-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="booking-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={40}
                className="w-full h-11 px-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition mb-4"
              />

              <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="booking-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                placeholder="Passengers, luggage, catering, anything else"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition resize-y"
              />

              <button
                onClick={submit}
                disabled={submitting}
                className="mt-5 w-full h-12 bg-[#F2B400] hover:bg-[#E0A600] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {submitting ? "Sending…" : "Send booking request"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
