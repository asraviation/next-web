"use client";

// Lead capture form shown on every service page.

import { useState } from "react";

export default function ServiceEnquiryForm({
  serviceSlug,
  serviceTitle,
}: {
  serviceSlug: string;
  serviceTitle: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          service: serviceSlug,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          company: data.get("company"), // honeypot
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body?.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setError("Could not reach the server. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-white border border-green-300 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">✈️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiry received</h3>
        <p className="text-gray-600">
          Thank you — our team will get back to you shortly about {serviceTitle}.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm text-yellow-700 hover:text-yellow-800 underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const field =
    "w-full h-12 px-4 bg-gray-50 rounded-lg border-2 border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none transition";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-1">Request a quote</h3>
      <p className="text-sm text-gray-500 mb-6">
        Tell us what you need for {serviceTitle} and we'll come back with options.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="name" name="name" required maxLength={120} className={field} />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" required maxLength={200} className={field} />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" maxLength={40} className={field} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={4000}
            placeholder="Route, dates, number of passengers, anything else we should know"
            className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none transition resize-y"
          />
        </div>
      </div>

      {/* Honeypot — hidden from users, catches naive bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full h-12 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
