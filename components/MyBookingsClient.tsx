"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 8;

interface TrackedBooking {
  id: number;
  kind: string;
  status: "new" | "contacted" | "confirmed" | "closed";
  createdAt: string;
  serviceTitle: string;
  booking: {
    product: string;
    trip: string;
    from: string;
    to: string;
    date: string;
    time: string;
  } | null;
}

// What each status means to a customer — the admin's wording is internal.
const STATUS_LABEL: Record<TrackedBooking["status"], string> = {
  new: "Received",
  contacted: "In progress",
  confirmed: "Confirmed",
  closed: "Closed",
};

const STATUS_STYLE: Record<TrackedBooking["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

export default function MyBookingsClient() {
  const [customer, setCustomer] = useState<{ email: string; name: string } | null>(null);
  const [bookings, setBookings] = useState<TrackedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const session = await fetch("/api/auth/customer", {
        cache: "no-store",
        credentials: "same-origin",
      }).then((r) => r.json());

      if (!session.authenticated) {
        setCustomer(null);
        return;
      }

      setCustomer({ email: session.email, name: session.name });

      const response = await fetch("/api/bookings", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || "Could not load your bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Could not load your bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signOut = async () => {
    await fetch("/api/auth/customer", {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => {});
    setCustomer(null);
    setBookings([]);
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-24">Loading…</p>;
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600 mb-8">
          Sign in with Google to see your requests and their status.
        </p>
        <div className="flex justify-center">
          <GoogleSignIn
            endpoint="/api/auth/customer"
            onAuthSuccess={() => {
              setLoading(true);
              load();
            }}
            onAuthError={(message: string) => setError(message)}
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1 text-sm">Signed in as {customer.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900 underline">
          Sign out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-gray-700 font-medium">No requests yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Your booking requests will appear here once you make one.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#F2B400] hover:bg-[#E0A600] text-white font-semibold rounded-lg"
          >
            Book a flight
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-5 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">
                      Request #{item.id}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                        STATUS_STYLE[item.status]
                      }`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {item.booking ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">From</p>
                    <p className="text-gray-900">{item.booking.from}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">To</p>
                    <p className="text-gray-900">{item.booking.to}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">When</p>
                    <p className="text-gray-900">
                      {item.booking.date} {item.booking.time && `· ${item.booking.time}`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">{item.serviceTitle}</p>
              )}
            </div>
          ))}

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={bookings.length}
            onChange={setPage}
            label="requests"
          />
        </div>
      )}
    </div>
  );
}
