"use client";

// Contact form.
//
// Field set and layout ported from New-ASR-Client/src/pages/ContactUs.jsx.
// The Google sign-in gate that page put in front of the form is deliberately
// removed — anyone can enquire. Submissions go to /api/leads and appear in the
// admin Leads inbox.

import { useState } from "react";

const FIELD = "w-full px-3 py-2 border rounded focus:border-yellow-400 focus:outline-none transition";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          kind: "contact",
          name: get("name"),
          email: get("email"),
          phone: get("phoneNumber"),
          service: "general",
          message: get("message"),
          company: get("company"), // honeypot
          contact: {
            companyName: get("companyName"),
            departureCity: get("departureCity"),
            arrivalCity: get("arrivalCity"),
            departureDate: get("departureDate"),
            returnDate: get("returnDate"),
            foodPreferences: get("foodPreferences"),
            numberOfPassengers: get("numberOfPassengers"),
          },
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body?.error || "Something went wrong. Please try again.");
        return;
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">Name *</label>
          <input id="name" type="text" name="name" className={FIELD} maxLength={120} required />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email *</label>
          <input id="email" type="email" name="email" className={FIELD} maxLength={200} required />
        </div>

        <div className="mb-4">
          <label htmlFor="companyName" className="block text-gray-700">Company Name</label>
          <input id="companyName" type="text" name="companyName" className={FIELD} maxLength={200} />
        </div>

        <div className="mb-4">
          <label htmlFor="departureCity" className="block text-gray-700">Departure City *</label>
          <input id="departureCity" type="text" name="departureCity" className={FIELD} maxLength={200} required />
        </div>

        <div className="mb-4">
          <label htmlFor="arrivalCity" className="block text-gray-700">Arrival City *</label>
          <input id="arrivalCity" type="text" name="arrivalCity" className={FIELD} maxLength={200} required />
        </div>

        <div className="mb-4">
          <label htmlFor="departureDate" className="block text-gray-700">Departure Date *</label>
          <input id="departureDate" type="date" name="departureDate" className={FIELD} required />
        </div>

        <div className="mb-4">
          <label htmlFor="returnDate" className="block text-gray-700">Return Date</label>
          <input id="returnDate" type="date" name="returnDate" className={FIELD} />
        </div>

        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700">Phone Number *</label>
          <input id="phoneNumber" type="tel" name="phoneNumber" className={FIELD} maxLength={40} required />
        </div>

        <div className="mb-4">
          <label htmlFor="foodPreferences" className="block text-gray-700">Food Preferences</label>
          <input id="foodPreferences" type="text" name="foodPreferences" className={FIELD} maxLength={200} />
        </div>

        <div className="mb-4">
          <label htmlFor="numberOfPassengers" className="block text-gray-700">Number of Passengers *</label>
          <input
            id="numberOfPassengers"
            type="number"
            name="numberOfPassengers"
            min={1}
            max={500}
            className={FIELD}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-gray-700">Additional Notes</label>
          <textarea id="message" name="message" rows={4} maxLength={4000} className={FIELD} />
        </div>

        {/* Honeypot — hidden from users, catches naive bots. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-yellow-500 text-white font-semibold py-2 rounded-lg w-full hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {submitted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSubmitted(false)}
          />
          <div className="relative bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p>Your submission has been received. We&apos;ll get back to you soon.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
