"use client";

// Ferry deals listing.
//
// Requesting a deal reuses the shared BookingModal, so it behaves exactly like
// the homepage strip: Google sign-in, then the request lands in admin Leads
// tagged "Featured deal".

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookingModal, { type BookingDraft } from "@/components/BookingModal";
import Pagination from "@/components/Pagination";

interface Deal {
  id: number;
  from: string;
  to: string;
  date: string;
  time: string;
  plane: string;
  seater: number;
  perSeat: number;
  wholeJet: number;
  booked: boolean;
  image?: string | null;
}

const PAGE_SIZE = 9;
const money = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function LegDealsClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/deals", { cache: "no-store" });
      const data = await response.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (onlyAvailable ? deals.filter((d) => !d.booked) : deals),
    [deals, onlyAvailable]
  );

  useEffect(() => setPage(1), [onlyAvailable]);

  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const request = (deal: Deal) =>
    setDraft({
      product: "charter",
      trip: "one",
      from: deal.from,
      to: deal.to,
      date: deal.date,
      time: deal.time,
      source: "featured-deal",
      deal: {
        id: deal.id,
        route: `${deal.from} → ${deal.to}`,
        date: deal.date,
        time: deal.time,
        aircraft: deal.plane,
        perSeat: deal.perSeat,
        wholeJet: deal.wholeJet,
      },
    });

  return (
    <>
      {/* Hero — wording from the ASR LegDeals hero */}
      <section className="relative bg-gray-900 pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="/plane.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="flex flex-col md:flex-row justify-center text-4xl md:text-6xl text-[#E6B311] gap-3 md:gap-10 mb-8">
            <span>ASR</span>
            <span>FERRY</span>
            <span>Deals</span>
          </h1>
          <p className="text-sm md:text-lg text-white/90 max-w-3xl mx-auto">
            Experience the elegance of private jet travel at an exceptional price
            with ASR Ferry Deals. These exclusive empty-leg flights offer an
            opportunity to fly in ultimate comfort and privacy for a fraction of
            the cost. Indulge in seamless luxury, only with ASR Aviation.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <p className="text-gray-600">
            {loading
              ? "Loading deals…"
              : `${visible.length} deal${visible.length === 1 ? "" : "s"} available`}
          </p>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-yellow-600"
            />
            Hide booked
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No ferry deals right now</h2>
            <p className="text-gray-600 mb-6">
              Empty-leg deals appear here as they become available.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg"
            >
              Request a custom charter
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={deal.image || "/jet-deals.png"}
                      alt={`${deal.plane} — ${deal.from} to ${deal.to}`}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                        deal.booked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {deal.booked ? "Booked" : "Available"}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      {deal.plane}
                    </p>

                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">From</p>
                        <p className="font-semibold text-gray-900 truncate">{deal.from}</p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs text-gray-500">To</p>
                        <p className="font-semibold text-gray-900 truncate">{deal.to}</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>{deal.date}</span>
                      <span>{deal.time}</span>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Per seat</p>
                        <p className="text-lg font-bold text-gray-900">{money(deal.perSeat)}</p>
                        {Boolean(deal.seater) && (
                          <p className="text-xs text-gray-400">{deal.seater} seats</p>
                        )}
                      </div>

                      <button
                        onClick={() => request(deal)}
                        disabled={deal.booked}
                        className="px-5 py-2 rounded-lg font-semibold text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-yellow-600 hover:bg-yellow-700"
                      >
                        {deal.booked ? "Booked" : "Request"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={visible.length}
              onChange={setPage}
              label="deals"
            />
          </>
        )}
      </section>

      <BookingModal draft={draft} onClose={() => setDraft(null)} />
    </>
  );
}
