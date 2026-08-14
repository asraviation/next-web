"use client"

import { useState, useEffect } from "react"
import BookingModal, { type BookingDraft } from "@/components/BookingModal"
import Pagination from "@/components/Pagination"

interface Deal {
  id: string
  from: string
  to: string
  date: string
  time: string
  aircraft: string
  price: number
  image: string
}

const DEALS_PER_PAGE = 6

export default function FeaturedDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  // Pending request raised against a deal; drives the sign-in + confirm modal.
  const [draft, setDraft] = useState<BookingDraft | null>(null)

  /** Turn a published deal into a booking request. */
  const requestDeal = (deal: Deal) => {
    setDraft({
      product: "charter",
      trip: "one",
      from: deal.from,
      to: deal.to,
      date: deal.date,
      time: deal.time,
      source: "featured-deal",
      deal: {
        id: Number(deal.id) || 0,
        route: `${deal.from} → ${deal.to}`,
        date: deal.date,
        time: deal.time,
        aircraft: deal.aircraft,
        perSeat: deal.price,
      },
    })
  }

  useEffect(() => {
    // Fetch deals from API with fallback to defaults
    const fetchDeals = async () => {
      // Default (frontend) deals – used as fallback when API is empty or fails
      const mockDeals: Deal[] = [
        {
          id: "1",
          from: "Bangalore",
          to: "Mumbai",
          date: "15 Nov 2024",
          time: "10:30 AM",
          aircraft: "Legacy 600",
          price: 110000,
          image: "/jet-deals.png",
        },
        {
          id: "2",
          from: "Delhi",
          to: "Goa",
          date: "18 Nov 2024",
          time: "2:15 PM",
          aircraft: "Citation X",
          price: 95000,
          image: "/jet-deals.png",
        },
        {
          id: "3",
          from: "Chennai",
          to: "Hyderabad",
          date: "20 Nov 2024",
          time: "6:45 PM",
          aircraft: "Falcon 900",
          price: 85000,
          image: "/jet-deals.png",
        },
      ]

      try {
        // Served by app/api/deals — the same store the admin dashboard writes to.
        const res = await fetch("/api/deals", {
          // Avoid caching during development; adjust if needed
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()

        // Support both `[]` and `{ results: [] }` shapes
        const raw = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])

        // Normalize keys defensively in case backend uses different names
        const normalized: Deal[] = (raw as any[]).map((d: any, idx: number) => ({
          id: String(d.id ?? d._id ?? idx + 1),
          from: d.from ?? d.source ?? d.origin ?? "",
          to: d.to ?? d.destination ?? "",
          date: d.date ?? d.departure_date ?? "",
          time: d.time ?? d.departure_time ?? "",
          aircraft: d.aircraft ?? d.plane ?? d.aircraft_type ?? "",
          price: Number(d.price ?? d.perSeat ?? d.amount ?? 0),
          image: d.image ?? d.image_url ?? "/jet-deals.png",
        })).filter(d => d.from && d.to)

        if (normalized.length > 0) {
          setDeals(normalized)
        } else {
          // API returned empty -> use defaults
          setDeals(mockDeals)
        }
      } catch (error) {
        console.error("Error fetching deals:", error)
        // On error -> use defaults
        setDeals(mockDeals)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">Featured Deals</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Featured Deals</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto px-4">
          Discover exclusive flight deals and save on your next luxury travel experience
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No deals right now</h3>
          <p className="text-gray-600">Check back soon for exclusive flight offers</p>
        </div>
      ) : (
        <>
          <div className="horizontal-scroll-container overflow-x-auto pb-8">
            <div className="flex space-x-6 px-8 min-w-max">
              {deals
                .slice((page - 1) * DEALS_PER_PAGE, page * DEALS_PER_PAGE)
                .map((deal) => (
                <div
                  key={deal.id}
                  className="deal-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-80"
                >
                  <div className="relative h-48 rounded-t-2xl overflow-hidden">
                    <img
                      src={deal.image || "/placeholder.svg"}
                      alt={`${deal.aircraft} - ${deal.from} to ${deal.to}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-left">
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-semibold text-gray-900">{deal.from}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-px bg-gray-300 relative">
                          <div className="absolute right-0 top-0 w-2 h-2 border-r border-t border-gray-300 transform rotate-45 -translate-y-1"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-semibold text-gray-900">{deal.to}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p>{deal.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p>{deal.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Aircraft</p>
                        <p>{deal.aircraft}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-xl font-bold text-gray-900">₹{deal.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => requestDeal(deal)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8">
            <Pagination
              page={page}
              pageSize={DEALS_PER_PAGE}
              total={deals.length}
              onChange={setPage}
              label="deals"
            />
          </div>
        </>
      )}

      {/* Sign in with Google, then submit — same flow as the booking panel */}
      <BookingModal draft={draft} onClose={() => setDraft(null)} />
    </div>
  )
}
