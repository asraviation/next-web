// Booking requests.
//
// Replaces the old redirect to asr-taxipage.vercel.app. A booking is stored as
// a lead of kind "booking", so it lands in the same admin Leads inbox and uses
// the same status workflow.
//
// Requires a signed-in customer: the email is taken from the verified Google
// session, never from the request body, so a booking cannot be filed against
// someone else's account.

import { NextResponse } from "next/server";
import { addLead, listLeadsForCustomer } from "@/lib/leads";
import { sendLeadEmail } from "@/lib/notify-email";
import { isSameOrigin } from "@/lib/admin-auth";
import { requireCustomer } from "@/lib/customer-auth";
import { checkRateLimit, clientIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import { ValidationError, readJsonBody } from "@/lib/validate-deal";

export const dynamic = "force-dynamic";

const PRODUCTS = ["charter", "seat", "helicopter"];
const TRIPS = ["one", "round", "multi"];

function text(value: unknown, field: string, max: number, required = true) {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    if (required) throw new ValidationError(`${field} is required`);
    return "";
  }
  if (str.length > max) throw new ValidationError(`${field} is too long`);
  return str;
}

/** The signed-in customer's own booking requests, with current status. */
export async function GET() {
  const auth = await requireCustomer();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const leads = await listLeadsForCustomer(auth.customer.email);
    return NextResponse.json(
      leads.map((lead) => ({
        id: lead.id,
        kind: lead.kind,
        status: lead.status,
        createdAt: lead.createdAt,
        serviceTitle: lead.serviceTitle,
        booking: lead.booking ?? null,
      }))
    );
  } catch (err) {
    console.error("Booking fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  const auth = await requireCustomer();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limit = checkRateLimit(clientIdentifier(request), "mutation");
  const headers = rateLimitHeaders(limit);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers }
    );
  }

  try {
    const body = await readJsonBody(request);

    const product = text(body?.product, "Product", 40);
    const trip = text(body?.trip, "Trip type", 40);
    if (!PRODUCTS.includes(product)) throw new ValidationError("Unknown product type");
    if (!TRIPS.includes(trip)) throw new ValidationError("Unknown trip type");

    const from = text(body?.from, "Origin", 200);
    const to = text(body?.to, "Destination", 200);

    // Same rule the panel enforces, re-checked here so the API cannot be
    // used to file an impossible itinerary.
    if (trip !== "multi") {
      const key = (s: string) => {
        const code = s.match(/\(([A-Z0-9]{2,4})\)/);
        return code ? code[1] : s.toLowerCase().replace(/[^a-z0-9]+/g, "");
      };
      if (key(from) === key(to)) {
        throw new ValidationError("Origin and destination cannot be the same");
      }
    }

    const booking = {
      product,
      trip,
      from,
      to,
      date: text(body?.date, "Date", 40),
      time: text(body?.time, "Time", 40),
    };

    // A request raised against a published featured deal carries a snapshot of
    // it, so the admin still sees what was offered after the deal expires.
    const isDealRequest = body?.source === "featured-deal" && body?.deal;
    const deal = isDealRequest
      ? {
          id: Number(body.deal.id) || 0,
          route: text(body.deal.route, "Deal route", 400, false),
          date: text(body.deal.date, "Deal date", 40, false),
          time: text(body.deal.time, "Deal time", 40, false),
          aircraft: text(body.deal.aircraft, "Aircraft", 200, false),
          perSeat: Number(body.deal.perSeat) || 0,
          wholeJet: Number(body.deal.wholeJet) || 0,
        }
      : undefined;

    const productLabel =
      product === "seat" ? "Seat booking" : product === "helicopter" ? "Helicopter" : "Charter";

    const lead = await addLead({
      kind: "booking",
      source: isDealRequest ? "featured-deal" : "booking-panel",
      name: auth.customer.name,
      email: auth.customer.email,
      customerEmail: auth.customer.email,
      phone: text(body?.phone, "Phone", 40, false),
      service: "booking",
      serviceTitle: isDealRequest
        ? `Featured deal — ${booking.from} → ${booking.to}`
        : `${productLabel} — ${booking.from} → ${booking.to}`,
      message: text(body?.message, "Notes", 2000, false),
      booking,
      ...(deal ? { deal } : {}),
    });

    const result = await sendLeadEmail(lead);
    if (!result.sent && !result.skipped && result.error) {
      console.error("Booking email failed:", result.error);
    }

    return NextResponse.json(
      { message: "Booking request received", id: lead.id, status: lead.status },
      { headers }
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status, headers });
    }
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
