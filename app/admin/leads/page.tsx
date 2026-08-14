"use client";

// Leads inbox.
//
// Auth is inherited from app/admin/layout.tsx and enforced again on the API,
// so this component only deals with presentation.

import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "@/components/Pagination";
import { SOURCE_LABEL, type Lead, type LeadSource, type LeadStatus } from "@/lib/leads-types";

const PAGE_SIZE = 10;

/** Colour per origin, so the list can be scanned by where leads came from. */
const SOURCE_STYLE: Record<LeadSource, string> = {
  "contact-form": "bg-teal-100 text-teal-800",
  "service-page": "bg-indigo-100 text-indigo-800",
  "featured-deal": "bg-purple-100 text-purple-800",
  "booking-panel": "bg-sky-100 text-sky-800",
  unknown: "bg-gray-100 text-gray-600",
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

const FILTERS: Array<{ key: LeadStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "confirmed", label: "Confirmed" },
  { key: "closed", label: "Closed" },
];

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/leads", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || "Failed to load leads");
      setLeads(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const setStatus = async (id: number, status: LeadStatus) => {
    // Optimistic — revert by refetching if the server disagrees.
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, status }),
    }).catch(() => null);

    if (!response || !response.ok) fetchLeads();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) return;

    const response = await fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id }),
    }).catch(() => null);

    if (response?.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
    else alert("Could not delete the enquiry. Please try again.");
  };

  const visible = useMemo(
    () =>
      leads
        .filter((l) => filter === "all" || l.status === filter)
        .filter((l) => sourceFilter === "all" || (l.source || "unknown") === sourceFilter),
    [leads, filter, sourceFilter]
  );

  // Keep the page in range when filters shrink the list.
  useEffect(() => {
    setPage(1);
  }, [filter, sourceFilter]);

  const pageItems = useMemo(
    () => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visible, page]
  );

  /** Counts per source, for the source filter row. */
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const key = l.source || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [leads]);

  const counts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      confirmed: leads.filter((l) => l.status === "confirmed").length,
      closed: leads.filter((l) => l.status === "closed").length,
    }),
    [leads]
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Leads</h1>
      <p className="text-gray-500 mb-6">
        Enquiries, contact-form submissions and booking requests, newest first.
        Each shows where on the site it came from.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? "bg-yellow-100 text-yellow-800"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-gray-400">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Filter by where the lead came from */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs uppercase tracking-wide text-gray-400 mr-1">Source</span>
        <button
          onClick={() => setSourceFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            sourceFilter === "all"
              ? "bg-gray-800 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {(Object.keys(SOURCE_LABEL) as LeadSource[])
          .filter((key) => sourceCounts[key])
          .map((key) => (
            <button
              key={key}
              onClick={() => setSourceFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                sourceFilter === key
                  ? "bg-gray-800 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {SOURCE_LABEL[key]}
              <span className="ml-1.5 text-xs opacity-60">{sourceCounts[key]}</span>
            </button>
          ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 py-10 text-center">Loading enquiries…</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-600 font-medium">
            {filter === "all" ? "No enquiries yet" : `No ${filter} enquiries`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Submissions from the service pages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map((lead) => {
            const open = expanded === lead.id;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-gray-900">{lead.name}</h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            STATUS_STYLE[lead.status]
                          }`}
                        >
                          {lead.status}
                        </span>
                        {/* Where this lead came from */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            SOURCE_STYLE[lead.source || "unknown"]
                          }`}
                        >
                          {SOURCE_LABEL[lead.source || "unknown"]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {lead.serviceTitle} ·{" "}
                        {new Date(lead.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <>
                            {" · "}
                            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                              {lead.phone}
                            </a>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={lead.status}
                        onChange={(e) => setStatus(lead.id, e.target.value as LeadStatus)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                        aria-label={`Status for ${lead.name}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => remove(lead.id)}
                        className="text-sm text-red-600 hover:text-red-800 px-2 py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* The published deal this request was raised against */}
                  {lead.deal && (
                    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
                      <p className="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-1">
                        Requested featured deal #{lead.deal.id}
                      </p>
                      <p className="text-gray-800">
                        {lead.deal.aircraft && `${lead.deal.aircraft} · `}
                        {lead.deal.route}
                        {lead.deal.date && ` · ${lead.deal.date}`}
                        {lead.deal.time && ` ${lead.deal.time}`}
                      </p>
                      {Boolean(lead.deal.perSeat) && (
                        <p className="text-gray-600 mt-0.5">
                          Advertised at ₹{Number(lead.deal.perSeat).toLocaleString("en-IN")} per seat
                        </p>
                      )}
                    </div>
                  )}

                  {/* Flight details from the Book Now panel */}
                  {lead.booking && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-4 text-sm rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="text-gray-400 text-xs">From</p>
                        <p className="text-gray-900">{lead.booking.from}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">To</p>
                        <p className="text-gray-900">{lead.booking.to}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">When</p>
                        <p className="text-gray-900">
                          {lead.booking.date} {lead.booking.time && `· ${lead.booking.time}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Type</p>
                        <p className="text-gray-900 capitalize">
                          {lead.booking.product} · {lead.booking.trip}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Extra fields from the full contact form */}
                  {lead.contact && (
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600 rounded-lg bg-gray-50 p-3">
                      {lead.contact.companyName && <span><span className="text-gray-400">Company:</span> {lead.contact.companyName}</span>}
                      {lead.contact.departureCity && <span><span className="text-gray-400">From:</span> {lead.contact.departureCity}</span>}
                      {lead.contact.arrivalCity && <span><span className="text-gray-400">To:</span> {lead.contact.arrivalCity}</span>}
                      {lead.contact.departureDate && <span><span className="text-gray-400">Departs:</span> {lead.contact.departureDate}</span>}
                      {lead.contact.returnDate && <span><span className="text-gray-400">Returns:</span> {lead.contact.returnDate}</span>}
                      {lead.contact.numberOfPassengers && <span><span className="text-gray-400">Pax:</span> {lead.contact.numberOfPassengers}</span>}
                      {lead.contact.foodPreferences && <span><span className="text-gray-400">Food:</span> {lead.contact.foodPreferences}</span>}
                    </div>
                  )}

                  {lead.message && (
                    <>
                      <p
                        className={`text-gray-700 mt-3 text-sm whitespace-pre-wrap ${
                          open ? "" : "line-clamp-2"
                        }`}
                      >
                        {lead.message}
                      </p>
                      {lead.message.length > 140 && (
                        <button
                          onClick={() => setExpanded(open ? null : lead.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                        >
                          {open ? "Show less" : "Show more"}
                        </button>
                      )}
                    </>
                  )}

                  {lead.emailError && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      Notification email failed: {lead.emailError}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={visible.length}
            onChange={setPage}
            label="leads"
          />
        </div>
      )}
    </div>
  );
}
