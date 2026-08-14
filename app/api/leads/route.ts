// Lead capture endpoint.
//
//   POST   -> public: submit an enquiry (rate limited, validated)
//   GET    -> admin: list enquiries
//   PATCH  -> admin: change status  { id, status }
//   DELETE -> admin: remove         { id }
//
// A failed notification email never fails the request: the lead is stored
// first, then the email is attempted, and any error is recorded on the record.

import { NextResponse } from "next/server";
import { LEAD_STATUSES, addLead, deleteLead, listLeads, updateLeadStatus } from "@/lib/leads";
import { sendLeadEmail } from "@/lib/notify-email";
import { getService } from "@/lib/services";
import { isSameOrigin, requireAdmin } from "@/lib/admin-auth";
import { checkRateLimit, clientIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import { ValidationError, readJsonBody } from "@/lib/validate-deal";

export const dynamic = "force-dynamic";

const MAX = { name: 120, email: 200, phone: 40, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, field: string, max: number, required: boolean) {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    if (required) throw new ValidationError(`${field} is required`);
    return "";
  }
  if (str.length > max) throw new ValidationError(`${field} is too long`);
  return str;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  // Enquiry forms are a spam magnet; reuse the strict auth budget.
  const limit = checkRateLimit(clientIdentifier(request), "auth");
  const headers = rateLimitHeaders(limit);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries from this address. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await readJsonBody(request);

    // Honeypot: a real user never fills a hidden field. Accept and discard so
    // the bot sees success and does not retry.
    if (typeof body?.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ message: "Thank you — we'll be in touch." }, { headers });
    }

    const email = text(body?.email, "Email", MAX.email, true);
    if (!EMAIL_RE.test(email)) throw new ValidationError("Enter a valid email address");

    const slug = text(body?.service, "Service", 80, false) || "general";
    const service = getService(slug);
    const isContactForm = body?.kind === "contact";

    // Extra fields from the full contact form, each individually bounded.
    const contact = isContactForm
      ? {
          companyName: text(body?.contact?.companyName, "Company name", 200, false),
          departureCity: text(body?.contact?.departureCity, "Departure city", 200, false),
          arrivalCity: text(body?.contact?.arrivalCity, "Arrival city", 200, false),
          departureDate: text(body?.contact?.departureDate, "Departure date", 40, false),
          returnDate: text(body?.contact?.returnDate, "Return date", 40, false),
          foodPreferences: text(body?.contact?.foodPreferences, "Food preferences", 200, false),
          numberOfPassengers: text(body?.contact?.numberOfPassengers, "Passengers", 10, false),
        }
      : undefined;

    const lead = await addLead({
      kind: isContactForm ? "contact" : "enquiry",
      source: isContactForm ? "contact-form" : "service-page",
      name: text(body?.name, "Name", MAX.name, true),
      email,
      phone: text(body?.phone, "Phone", MAX.phone, false),
      service: service ? service.slug : "general",
      serviceTitle: isContactForm
        ? "Contact form"
        : service
        ? service.title
        : "General enquiry",
      message: text(body?.message, "Message", MAX.message, false),
      ...(contact ? { contact } : {}),
    });

    // Stored already — email is best-effort from here.
    const result = await sendLeadEmail(lead);
    if (!result.sent && !result.skipped && result.error) {
      console.error("Lead email failed:", result.error);
      await updateLeadStatus(lead.id, "new").catch(() => {});
    }

    return NextResponse.json(
      { message: "Thank you — we'll be in touch.", id: lead.id },
      { headers }
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status, headers });
    }
    console.error("Lead Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    return NextResponse.json(await listLeads());
  } catch (err) {
    console.error("Lead Fetch Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, status } = await readJsonBody(request);
    if (!LEAD_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const lead = await updateLeadStatus(Number(id), status);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated", lead });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Lead Update Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await readJsonBody(request);
    const removed = await deleteLead(Number(id));
    if (!removed) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Lead Delete Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
