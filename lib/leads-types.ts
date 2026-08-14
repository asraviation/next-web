// Lead types and display constants.
//
// Kept separate from lib/leads.ts because that module imports `fs` for the
// JSON store. Client components need the types AND runtime values like
// SOURCE_LABEL; importing them from the store would drag `fs` into the browser
// bundle and fail the build. Nothing here may import a Node built-in.

export type LeadStatus = "new" | "contacted" | "confirmed" | "closed";

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "confirmed", "closed"];

/** What the request is. Bookings are shown alongside enquiries. */
export type LeadKind = "enquiry" | "booking" | "contact";

/**
 * Which part of the site produced the lead. Kept separate from `kind` so the
 * admin can tell a featured-deal request apart from a home-page booking even
 * though both are of kind "booking".
 */
export type LeadSource =
  | "contact-form"
  | "service-page"
  | "featured-deal"
  | "booking-panel"
  | "unknown";

export const SOURCE_LABEL: Record<LeadSource, string> = {
  "contact-form": "Contact form",
  "service-page": "Service page",
  "featured-deal": "Featured deal",
  "booking-panel": "Home booking panel",
  unknown: "Unknown",
};

/** Flight details captured by the Book Now panel. */
export interface BookingDetails {
  product: string;      // charter | seat | helicopter
  trip: string;         // one | round | multi
  from: string;
  to: string;
  date: string;
  time: string;
}

/** Extra fields captured by the full contact form. */
export interface ContactDetails {
  companyName?: string;
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: string;
  returnDate?: string;
  foodPreferences?: string;
  numberOfPassengers?: string;
}

/** Snapshot of the featured deal a request was raised against. */
export interface DealReference {
  id: number;
  route: string;
  date: string;
  time: string;
  aircraft: string;
  perSeat?: number;
  wholeJet?: number;
}

export interface Lead {
  id: number;
  kind: LeadKind;
  /** Where on the site this came from. */
  source: LeadSource;
  name: string;
  email: string;
  phone: string;
  service: string;      // service slug, or "general"
  serviceTitle: string;
  message: string;
  status: LeadStatus;
  createdAt: string;    // ISO
  /** Present on kind === "booking". */
  booking?: BookingDetails;
  /** Present on kind === "contact". */
  contact?: ContactDetails;
  /** Present when source === "featured-deal". */
  deal?: DealReference;
  /** Google-verified email of the customer who raised a booking. */
  customerEmail?: string;
  /** Set when the notification email could not be sent. */
  emailError?: string;
}
