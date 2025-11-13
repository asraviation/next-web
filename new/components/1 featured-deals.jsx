"use client"

import React, { useState, useEffect } from "react"

// Define the type for a single deal object
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

const FeaturedDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch deals
    const fetchDeals = async () => {
      try {
        const mockDeals: Deal[] = [
          {
            id: "1",
            from: "Mumbai",
            to: "Bali",
            date: "15 Nov 2024",
            time: "10:30 AM",
            aircraft: "Legacy 600",
            price: 110000,
            image: "/jet-deals.png",
          },
          {
            id: "2",
            from: "Dubai",
            to: "Maldives",
            date: "18 Nov 2024",
            time: "2:15 PM",
            aircraft: "Citation X",
            price: 95000,
            image: "/jet-deals.png",
          },
          {
            id: "3",
            from: "Singapore",
            to: "Phuket",
            date: "20 Nov 2024",
            time: "6:45 PM",
            aircraft: "Falcon 900",
            price: 85000,
            image: "/jet-deals.png",
          },
        ]

        // Simulate loading delay
        setTimeout(() => {
          setDeals(mockDeals)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching deals:", error)
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
    <div className="bg-white py-20 font-sans">
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
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="deal-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-80"
                >
                  <div className="relative h-48 rounded-t-2xl overflow-hidden">
                    <img
                      src={deal.image || "/jet-deals.pngImage+Not+Found"}
                      alt={`${deal.aircraft} - ${deal.from} to ${deal.to}`}
                      className="w-full h-full object-cover blur-sm"
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

                    <div className="flex justify-end items-center">
                      <button 
                        disabled
                        className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed opacity-70"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Explore More Deals
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default FeaturedDeals;