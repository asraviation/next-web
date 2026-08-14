// Service catalogue.
//
// Single source of truth for the Exclusive Services carousel, the individual
// service pages at /services/<slug>, and the enquiry form's service field.
// Adding a service here creates its page automatically.

export interface Service {
  slug: string;
  title: string;
  /** Short line used on the carousel card. */
  desc: string;
  image: string;
  alt: string;
  /** objectPosition for the carousel crop. */
  obj: string;
  /** Lead paragraph on the service page. */
  intro: string;
  highlights: string[];
  /** Answers "who is this for" on the page. */
  suitedFor: string;
}

export const SERVICES: Service[] = [
  {
    slug: "luxury-travel",
    title: "Luxury Travel",
    desc: "Experience ultimate comfort in our premium private jets",
    image: "/Frame91.png",
    alt: "Luxury Private Jet Interior",
    obj: "0% 50%",
    intro:
      "Travel on your own schedule in a cabin configured around you. Our charter fleet ranges from light jets for short domestic hops to long-range aircraft for intercontinental travel, each crewed by an experienced team.",
    highlights: [
      "Depart when you choose — no fixed schedules",
      "Private terminal access with minimal ground time",
      "Cabin, catering and crew arranged to your brief",
      "Light, midsize and long-range aircraft available",
    ],
    suitedFor: "Business travel, family trips and time-critical journeys.",
  },
  {
    slug: "wedding-services",
    title: "Wedding Services",
    desc: "Make your special day unforgettable with helicopter arrivals",
    image: "/Frame90.png",
    alt: "Helicopter Wedding Service",
    obj: "20% 50%",
    intro:
      "A helicopter arrival turns an entrance into the moment guests remember. We handle site survey, permissions and landing arrangements so the day runs exactly to plan.",
    highlights: [
      "Baraat and bride/groom helicopter arrivals",
      "Landing site survey and permissions handled",
      "Decorated aircraft options",
      "Guest shuttles between venues",
    ],
    suitedFor: "Weddings, receptions and destination celebrations.",
  },
  {
    slug: "sightseeing-tours",
    title: "Sightseeing Tours",
    desc: "Discover breathtaking views from above",
    image: "/Frame95.png",
    alt: "Helicopter Sightseeing Tours",
    obj: "40% 50%",
    intro:
      "See the landscape the way few people do. Our scenic flights cover coastlines, hill stations and heritage sites, with routes and duration shaped to your group.",
    highlights: [
      "Fixed-route and custom scenic flights",
      "Window seats for every passenger",
      "Short city hops through to full-day circuits",
      "Photography-friendly routing on request",
    ],
    suitedFor: "Tourists, special occasions and corporate hospitality.",
  },
  {
    slug: "mountain-adventures",
    title: "Mountain Adventures",
    desc: "Access remote destinations with ease and style",
    image: "/Frame93.png",
    alt: "Mountain Helicopter Services",
    obj: "60% 50%",
    intro:
      "Reach places roads cannot. Our crews are experienced in high-altitude and confined-area operations, serving pilgrimage circuits, trekking bases and remote lodges.",
    highlights: [
      "High-altitude and confined-area experienced crews",
      "Pilgrimage circuits and trekking base transfers",
      "Supply runs to remote sites",
      "Weather-contingent planning with flexible slots",
    ],
    suitedFor: "Pilgrimages, expeditions and remote site access.",
  },
  {
    slug: "medical-services",
    title: "Medical Services",
    desc: "Emergency medical transport when time matters most",
    image: "/Frame92.png",
    alt: "Medical Helicopter Services",
    obj: "80% 50%",
    intro:
      "Air ambulance capability for when transfer time is the deciding factor. Aircraft can be configured for stretcher transport with medical escort, coordinated directly with the receiving hospital.",
    highlights: [
      "Rapid-response air ambulance",
      "Stretcher configuration with medical escort",
      "Hospital-to-hospital and accident-site transfers",
      "Organ transport coordination",
    ],
    suitedFor: "Emergency medical evacuation and inter-hospital transfers.",
  },
  {
    slug: "aerial-photography",
    title: "Aerial Photography",
    desc: "Capture stunning aerial perspectives for any occasion",
    image: "/Frame94.png",
    alt: "Aerial Photography Services",
    obj: "100% 50%",
    intro:
      "Stable, precisely flown platforms for film, survey and inspection work. We fly to the brief — altitude, heading and pace set by what the shot needs.",
    highlights: [
      "Doors-off configuration where permitted",
      "Film, television and commercial shoots",
      "Survey, mapping and infrastructure inspection",
      "Flight profile flown to the shot list",
    ],
    suitedFor: "Production crews, surveyors and marketing teams.",
  },
];

export const getService = (slug: string) =>
  SERVICES.find((service) => service.slug === slug);
